import { describe, expect, it } from 'vitest';
import {
  decodedByteLength,
  parseDataUrl,
  validateAnalyzePayload,
  validateChatPayload,
} from './validation';

const PNG_1PX =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('parseDataUrl', () => {
  it('parses a valid data URL', () => {
    const parsed = parseDataUrl(PNG_1PX);
    expect(parsed).not.toBeNull();
    expect(parsed!.mimeType).toBe('image/png');
    expect(parsed!.base64.length).toBeGreaterThan(0);
  });

  it('rejects non data URLs', () => {
    expect(parseDataUrl('https://example.com/img.png')).toBeNull();
    expect(parseDataUrl('')).toBeNull();
  });

  it('rejects malformed data URLs', () => {
    // parseDataUrl is a generic parser; mime filtering happens in the callers
    const html = parseDataUrl('data:text/html;base64,PGJvZHk+');
    expect(html).not.toBeNull();
    expect(html!.mimeType).toBe('text/html');
    // not base64
    expect(parseDataUrl('data:image/png;base64,not-!valid!==')).toBeNull();
  });
});

describe('decodedByteLength', () => {
  it('computes length ignoring padding', () => {
    expect(decodedByteLength('aGVsbG8=')).toBe(5); // "hello"
    expect(decodedByteLength('aGVsbG8')).toBe(5);
  });
});

describe('validateAnalyzePayload', () => {
  it('accepts a valid payload', () => {
    const result = validateAnalyzePayload({ prompt: 'Diagnose this', imageUrl: PNG_1PX });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mimeType).toBe('image/png');
      expect(result.data.prompt).toBe('Diagnose this');
    }
  });

  it('rejects a missing prompt', () => {
    const result = validateAnalyzePayload({ prompt: '', imageUrl: PNG_1PX });
    expect(result.ok).toBe(false);
  });

  it('rejects an oversized prompt', () => {
    const result = validateAnalyzePayload({ prompt: 'x'.repeat(2001), imageUrl: PNG_1PX });
    expect(result.ok).toBe(false);
  });

  it('rejects a non-image mime type', () => {
    const svg = 'data:image/svg+xml;base64,PHN2Zy8+';
    const result = validateAnalyzePayload({ prompt: 'test', imageUrl: svg });
    expect(result.ok).toBe(false);
  });

  it('rejects an oversize image', () => {
    const result = validateAnalyzePayload({ prompt: 'test', imageUrl: PNG_1PX }, 10);
    expect(result.ok).toBe(false);
  });

  it('rejects missing imageUrl', () => {
    const result = validateAnalyzePayload({ prompt: 'test' });
    expect(result.ok).toBe(false);
  });

  it('rejects non-object bodies', () => {
    expect(validateAnalyzePayload(null).ok).toBe(false);
    expect(validateAnalyzePayload('text').ok).toBe(false);
  });

  it('strips control characters from the prompt', () => {
    const result = validateAnalyzePayload({ prompt: 'diag\u0000nos\u0001e', imageUrl: PNG_1PX });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.prompt).toBe('diagnose');
  });
});

describe('validateChatPayload', () => {
  it('accepts a message only', () => {
    const result = validateChatPayload({ message: 'Is it safe?', history: [] });
    expect(result.ok).toBe(true);
  });

  it('accepts an image only', () => {
    const result = validateChatPayload({ message: '', history: [], imageUrl: PNG_1PX });
    expect(result.ok).toBe(true);
  });

  it('rejects empty message without image', () => {
    const result = validateChatPayload({ message: '', history: [] });
    expect(result.ok).toBe(false);
  });

  it('rejects oversized history', () => {
    const turns = Array.from({ length: 41 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'model', parts: [{ text: 'x' }] }));
    const result = validateChatPayload({ message: 'hi', history: turns });
    expect(result.ok).toBe(false);
  });

  it('rejects invalid roles', () => {
    const result = validateChatPayload({
      message: 'hi',
      history: [{ role: 'system', parts: [{ text: 'x' }] }],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects history that does not start with a user turn', () => {
    const result = validateChatPayload({
      message: 'hi',
      history: [{ role: 'model', parts: [{ text: 'x' }] }],
    });
    expect(result.ok).toBe(false);
  });

  it('accepts valid alternating user/model history', () => {
    const result = validateChatPayload({
      message: 'hi',
      history: [
        { role: 'user', parts: [{ text: 'hello' }] },
        { role: 'model', parts: [{ text: 'world' }] },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.history).toHaveLength(2);
  });

  it('rejects invalid parts', () => {
    const result = validateChatPayload({
      message: 'hi',
      history: [{ role: 'user', parts: [{ text: 123 }] }],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects oversized message', () => {
    const result = validateChatPayload({ message: 'x'.repeat(4001), history: [] });
    expect(result.ok).toBe(false);
  });
});
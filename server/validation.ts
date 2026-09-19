export const MAX_PROMPT_LENGTH = 2000;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_HISTORY_TURNS = 40;
export const MAX_PART_TEXT_LENGTH = 2000;
export const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const DATA_URL_PATTERN = /^data:([a-zA-Z0-9.+\-]+\/[a-zA-Z0-9.+\-]+);base64,([A-Za-z0-9+/=]+)$/;

const MAX_DATA_URL_CHARS = 12 * 1024 * 1024;

export interface ParsedImage {
  mimeType: string;
  base64: string;
}

export interface AnalyzePayload {
  prompt: string;
  imageUrl: string;
  mimeType: string;
  base64: string;
}

export interface ChatPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

export interface ChatTurn {
  role: 'user' | 'model';
  parts: ChatPart[];
}

export interface ChatPayload {
  message: string;
  history: ChatTurn[];
  imageUrl?: string;
}

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export function parseDataUrl(dataUrl: string): ParsedImage | null {
  if (typeof dataUrl !== 'string' || dataUrl.length === 0) return null;
  if (dataUrl.length > MAX_DATA_URL_CHARS) return null;
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match || match.length !== 3) return null;
  return { mimeType: match[1].toLowerCase(), base64: match[2] };
}

export function decodedByteLength(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function isAllowedMime(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME.has(mimeType);
}

function isValidDataImage(imageUrl: string, maxBytes: number): ParsedImage | null {
  const parsed = parseDataUrl(imageUrl);
  if (!parsed) return null;
  if (!isAllowedMime(parsed.mimeType)) return null;
  if (decodedByteLength(parsed.base64) > maxBytes) return null;
  return parsed;
}

export function validateAnalyzePayload(input: unknown, maxImageBytes = 5 * 1024 * 1024): ValidationResult<AnalyzePayload> {
  if (input === null || typeof input !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const record = input as Record<string, unknown>;

  if (typeof record.prompt !== 'string' || record.prompt.trim().length === 0) {
    return { ok: false, error: 'A non-empty prompt is required.' };
  }
  if (record.prompt.length > MAX_PROMPT_LENGTH) {
    return { ok: false, error: `Prompt must be at most ${MAX_PROMPT_LENGTH} characters.` };
  }

  if (typeof record.imageUrl !== 'string') {
    return { ok: false, error: 'An imageUrl (data URL) is required.' };
  }

  const image = isValidDataImage(record.imageUrl, maxImageBytes);
  if (!image) {
    return {
      ok: false,
      error: 'Invalid image. Use a JPEG, PNG, WebP, GIF or AVIF data URL no larger than ' + Math.round(maxImageBytes / 1024 / 1024) + 'MB.',
    };
  }

  return {
    ok: true,
    data: {
      prompt: cleanText(record.prompt).slice(0, MAX_PROMPT_LENGTH),
      imageUrl: image.base64.length > 0 ? `data:${image.mimeType};base64,${image.base64}` : '',
      mimeType: image.mimeType,
      base64: image.base64,
    },
  };
}

function isValidTurn(part: unknown): part is ChatPart {
  if (part === null || typeof part !== 'object') return false;
  const p = part as Record<string, unknown>;
  if (p.text !== undefined && typeof p.text !== 'string') return false;
  if (p.inlineData !== undefined) {
    if (p.inlineData === null || typeof p.inlineData !== 'object') return false;
    const inline = p.inlineData as Record<string, unknown>;
    if (typeof inline.mimeType !== 'string' || typeof inline.data !== 'string') return false;
  }
  return true;
}

export function validateChatPayload(input: unknown, maxImageBytes = 5 * 1024 * 1024): ValidationResult<ChatPayload> {
  if (input === null || typeof input !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const record = input as Record<string, unknown>;

  const hasImage = typeof record.imageUrl === 'string' && record.imageUrl.length > 0;
  const hasMessage = typeof record.message === 'string' && record.message.trim().length > 0;

  if (!hasMessage && !hasImage) {
    return { ok: false, error: 'A message or an image is required.' };
  }
  const messageText = typeof record.message === 'string' ? record.message : '';
  if (messageText.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `message must be a string of at most ${MAX_MESSAGE_LENGTH} characters.` };
  }

  let imageUrl: string | undefined;
  if (hasImage) {
    const image = isValidDataImage(record.imageUrl as string, maxImageBytes);
    if (!image) {
      return { ok: false, error: 'Invalid attached image. Use a JPEG, PNG, WebP, GIF or AVIF data URL.' };
    }
    imageUrl = `data:${image.mimeType};base64,${image.base64}`;
  }

  const history: ChatTurn[] = [];
  if (record.history !== undefined) {
    if (!Array.isArray(record.history)) {
      return { ok: false, error: 'history must be an array of turns.' };
    }
    if (record.history.length > MAX_HISTORY_TURNS) {
      return { ok: false, error: `history is limited to ${MAX_HISTORY_TURNS} turns.` };
    }
    for (let i = 0; i < record.history.length; i += 1) {
      const turn = record.history[i];
      if (turn === null || typeof turn !== 'object') {
        return { ok: false, error: `history[${i}] must be an object.` };
      }
      const t = turn as Record<string, unknown>;
      if (t.role !== 'user' && t.role !== 'model') {
        return { ok: false, error: `history[${i}].role must be "user" or "model".` };
      }
      if (!Array.isArray(t.parts)) {
        return { ok: false, error: `history[${i}].parts must be an array.` };
      }
      const parts: ChatPart[] = [];
      for (let j = 0; j < t.parts.length; j += 1) {
        if (!isValidTurn(t.parts[j])) {
          return { ok: false, error: `history[${i}].parts[${j}] is invalid.` };
        }
        const part = t.parts[j] as Record<string, unknown>;
        const cleaned: ChatPart = {};
        if (typeof part.text === 'string') {
          cleaned.text = cleanText(part.text).slice(0, MAX_PART_TEXT_LENGTH);
        }
        if (part.inlineData && (part.inlineData as { mimeType: string; data: string }).data) {
          const inline = part.inlineData as { mimeType: string; data: string };
          cleaned.inlineData = { mimeType: inline.mimeType, data: inline.data };
        }
        parts.push(cleaned);
      }
      if (i === 0 && t.role !== 'user') {
        return { ok: false, error: 'The first turn of history must have role "user".' };
      }
      history.push({ role: t.role as 'user' | 'model', parts });
    }
  }

  const message = messageText.length > 0 ? cleanText(messageText).slice(0, MAX_MESSAGE_LENGTH) : '';

  return { ok: true, data: { message, history, imageUrl } };
}
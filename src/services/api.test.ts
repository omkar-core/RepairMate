import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeRepairIssueStructured, chatWithRepairMate } from './api';

const PNG_1PX =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const analysisFixture = {
  imageQuality: { isClear: true },
  deviceIdentification: { name: 'Fan', category: 'Appliance', brand: 'Unknown', type: 'AC Motor Fan' },
  componentsDetected: ['motor', 'capacitor'],
  possibleIssues: [{ issue: 'Capacitor failure', likelihood: 60 }],
  faultLocationDescription: 'Near the motor terminal',
  difficulty: 'Easy',
  estimatedTime: '10 minutes',
  toolsNeeded: ['screwdriver'],
  repairSteps: ['Turn off power', 'Replace capacitor'],
  safetyWarnings: ['Disconnect power'],
  testRepair: ['Check rotation'],
  confidenceScore: 80,
  alternativeSolutions: ['Replace motor'],
  professionalRecommendation: ['Call a pro if unsure'],
  estimatedCost: '$5 - $15',
  sustainabilityImpact: { eWasteSaved: '1 kg', carbonSaved: '2 kg' },
  learningSection: 'Capacitors store energy.',
};

function mockFetchOnce(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('analyzeRepairIssueStructured', () => {
  it('posts the image and prompt to /api/analyze and returns the analysis', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(analysisFixture) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeRepairIssueStructured('Diagnose', PNG_1PX);

    expect(result.deviceIdentification.name).toBe('Fan');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/analyze');
    const payload = JSON.parse((init as RequestInit).body as string);
    expect(payload.imageUrl).toBe(PNG_1PX);
    expect(payload.prompt).toBe('Diagnose');
  });

  it('maps API error messages to thrown Error', async () => {
    mockFetchOnce(400, { error: { message: 'An imageUrl (data URL) is required.' } });
    await expect(analyzeRepairIssueStructured('Diagnose', PNG_1PX)).rejects.toThrow('An imageUrl (data URL) is required.');
  });

  it('throws a friendly message on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));
    await expect(analyzeRepairIssueStructured('Diagnose', PNG_1PX)).rejects.toThrow(/Network error/);
  });

  it('throws for invalid image data', async () => {
    await expect(analyzeRepairIssueStructured('Diagnose', 'not-a-data-url')).rejects.toThrow(/Invalid image data/);
  });
});

describe('chatWithRepairMate', () => {
  it('posts history and message to /api/chat and returns text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ text: 'Unplug it first.' }) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await chatWithRepairMate([{ role: 'user', parts: [{ text: 'help' }] }], 'What now?');

    expect(result).toBe('Unplug it first.');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/chat');
    const payload = JSON.parse((init as RequestInit).body as string);
    expect(payload.message).toBe('What now?');
  });
});
import type { RepairAnalysis } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

interface ChatPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface ChatTurn {
  role: 'user' | 'model';
  parts: ChatPart[];
}

interface ApiErrorBody {
  error?: { message?: string };
}

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const data = (await response.json()) as ApiErrorBody;
      message = data?.error?.message ?? message;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function normalizeDataUrl(imageSrc: string): string {
  if (imageSrc && imageSrc.startsWith('data:')) return imageSrc;
  throw new Error('Invalid image data. Please try again with a valid image.');
}

const STANDARD_PROMPT =
  'Perform a professional engineering diagnostic analysis on this device image. Identify components, potential faults, and provide precise repair instructions.';

export async function analyzeRepairIssueStructured(prompt: string, imageSrc: string): Promise<RepairAnalysis> {
  const imageUrl = normalizeDataUrl(imageSrc);
  return apiFetch<RepairAnalysis>('/analyze', {
    prompt: prompt || STANDARD_PROMPT,
    imageUrl,
  });
}

export async function chatWithRepairMate(
  history: ChatTurn[],
  message: string,
  image?: string,
): Promise<string> {
  const imageUrl = image && image.startsWith('data:') ? image : undefined;
  const data = await apiFetch<{ text: string }>('/chat', {
    history,
    message,
    imageUrl,
  });
  return data.text;
}
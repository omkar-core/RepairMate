import { RepairAnalysis } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function analyzeRepairIssueStructured(
  prompt: string,
  base64Image: string,
  mimeType: string
): Promise<RepairAnalysis> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, image: base64Image, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze image');
  }

  return response.json();
}

export async function chatWithRepairMate(
  history: any[],
  message: string,
  image?: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ history, message, image }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get chat response');
  }

  const data = await response.json();
  return data.response;
}

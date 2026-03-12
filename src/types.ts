import { RepairAnalysis } from './services/geminiService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 data URL
}

export type { RepairAnalysis };

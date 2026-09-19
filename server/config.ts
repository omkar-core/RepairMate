import 'dotenv/config';

const DEFAULT_DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];

function asInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? fallback : parsed;
}

function asBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  return value === 'true' || value === '1';
}

function parseOrigins(value: string | undefined): string[] {
  if (!value || value.trim() === '') return DEFAULT_DEV_ORIGINS;
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

export const config = {
  env: nodeEnv,
  isProduction,
  port: asInt(process.env.PORT, 3001),
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview',
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  trustProxy: asBool(process.env.TRUST_PROXY, false),
  logLevel: process.env.LOG_LEVEL ?? 'info',

  rateLimit: {
    windowMs: asInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: asInt(process.env.RATE_LIMIT_MAX, 120),
  },
  analyzeRateLimit: {
    windowMs: asInt(process.env.ANALYZE_RATE_LIMIT_WINDOW_MS, 60 * 1000),
    max: asInt(process.env.ANALYZE_RATE_LIMIT_MAX, 8),
  },
  chatRateLimit: {
    windowMs: asInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60 * 1000),
    max: asInt(process.env.CHAT_RATE_LIMIT_MAX, 30),
  },

  maxImageBytes: asInt(process.env.MAX_IMAGE_BYTES, 5 * 1024 * 1024),
  maxBodyBytes: asInt(process.env.MAX_BODY_BYTES, 10 * 1024 * 1024),

  serveStatic: isProduction || asBool(process.env.SERVE_STATIC, false),
} as const;
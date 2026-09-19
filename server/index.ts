import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import { config } from './config';
import { isGeminiConfigured, runAnalysis, runChat, GeminiUnavailableError } from './gemini';
import { validateAnalyzePayload, validateChatPayload } from './validation';

const bundleDir = path.dirname(fileURLToPath(import.meta.url));

function resolveDistDir(): string {
  const candidates = [path.resolve(process.cwd(), 'dist'), path.resolve(bundleDir, '../dist')];
  return candidates.find((dir) => fs.existsSync(dir)) ?? candidates[0];
}

function createLimiter(options: { windowMs: number; max: number }) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ error: { message: 'Too many requests. Please slow down and try again in a moment.' } });
    },
  });
}

const globalLimiter = createLimiter(config.rateLimit);
const analyzeLimiter = createLimiter(config.analyzeRateLimit);
const chatLimiter = createLimiter(config.chatRateLimit);

const app = express();
app.disable('x-powered-by');

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), display-capture=()',
  );
  next();
});

if (config.trustProxy && config.isProduction) {
  app.set('trust proxy', 1);
}

if (config.isProduction) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://api.dicebear.com', 'https://images.unsplash.com'],
          'connect-src': ["'self'", 'https://images.unsplash.com'],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'object-src': ["'none'"],
        },
      },
    }),
  );
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(cors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'], maxAge: 86400 }));
app.use(express.json({ limit: config.maxBodyBytes }));

app.use('/api', globalLimiter);

const requestLog = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    if (config.logLevel !== 'info' && res.statusCode < 400) return;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms ip=${req.ip}`);
  });
  next();
};
app.use(requestLog);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', geminiConfigured: isGeminiConfigured() });
});

app.post('/api/analyze', analyzeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = validateAnalyzePayload(req.body, config.maxImageBytes);
    if (result.ok === false) {
      res.status(400).json({ error: { message: result.error } });
      return;
    }
    if (!isGeminiConfigured()) {
      res.status(503).json({ error: { message: 'The AI service is not configured. Please contact the administrator.' } });
      return;
    }
    const analysis = await runAnalysis({
      prompt: result.data.prompt,
      base64Image: result.data.base64,
      mimeType: result.data.mimeType,
    });
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

app.post('/api/chat', chatLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = validateChatPayload(req.body, config.maxImageBytes);
    if (result.ok === false) {
      res.status(400).json({ error: { message: result.error } });
      return;
    }
    if (!isGeminiConfigured()) {
      res.status(503).json({ error: { message: 'The AI service is not configured. Please contact the administrator.' } });
      return;
    }
    const text = await runChat({
      message: result.data.message,
      history: result.data.history,
      imageUrl: result.data.imageUrl,
    });
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

const distDir = resolveDistDir();
if (config.serveStatic && fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: 'index.html', maxAge: '1d', setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    if (filePath.endsWith('.svg') || filePath.endsWith('.txt') || filePath.endsWith('.xml')) res.setHeader('Cache-Control', 'no-cache');
  } }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    const hasFileExtension = /\/[^/]+\.[a-zA-Z0-9]+$/.test(req.path);
    const pathname = req.path.replace(/\/+$/, '') || '/';
    if (hasFileExtension || pathname !== '/') return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: { message: 'Endpoint not found.' } });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof GeminiUnavailableError) {
    res.status(503).json({ error: { message: 'The AI service is temporarily unavailable. Please try again later.' } });
    return;
  }
  if (err && err.type === 'entity.too.large') {
    res.status(413).json({ error: { message: 'Payload too large. Reduce the number of attached images or the message size.' } });
    return;
  }
  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
    res.status(400).json({ error: { message: 'Request body contains invalid JSON.' } });
    return;
  }
  const status = typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  console.error(`[${new Date().toISOString()}] UNHANDLED ${err?.stack ?? err?.message ?? err}`);
  res.status(status).json({ error: { message: 'An unexpected error occurred. Please try again.' } });
});

const isMainEntry =
  process.argv[1] !== undefined &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMainEntry) {
  app.listen(config.port, () => {
    console.log(`[${new Date().toISOString()}] RepairMate API listening on http://localhost:${config.port} (${config.env})`);
    if (!isGeminiConfigured()) {
      console.warn(`[${new Date().toISOString()}] WARNING: GEMINI_API_KEY is not set. Analysis endpoints will return 503.`);
    }
  });
}

export { app };
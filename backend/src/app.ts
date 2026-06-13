import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { LinkRepository } from './repositories/link.repository';
import { AnalyticsService } from './services/analytics.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable security headers with helmet (configured to support iframe styles if needed)
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off CSP for easy local testing and script imports
  })
);

// Configure CORS to allow frontend connections
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// 1. Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// 2. Main API routes (prefixed with /api)
app.use('/api', apiLimiter, apiRouter);

// 3. Public redirect route (wildcard route placed at the end)
const linkRepository = new LinkRepository();
const analyticsService = new AnalyticsService();

app.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;

    // Skip redirection for typical static file queries or health indicators
    if (code === 'favicon.ico' || code === 'robots.txt' || code === 'sitemap.xml') {
      return res.sendStatus(404);
    }

    const link = await linkRepository.findByShortCode(code);

    if (!link) {
      return renderErrorPage(res, 'Link Not Found', 'The link you are trying to reach does not exist or has been deleted.', 404);
    }

    if (!link.isActive || link.isArchived) {
      return renderErrorPage(res, 'Link Inactive', 'This shortened link is currently deactivated or archived by its creator.', 403);
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return renderErrorPage(res, 'Link Expired', 'This shortened link has expired and is no longer active.', 410);
    }

    // Capture visitor details in the background (NON-BLOCKING to ensure ultra-low latency redirection)
    const userAgent = req.headers['user-agent'] || '';
    
    // Resolve client IP (respecting proxy headers like x-forwarded-for)
    let ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    const referrer = req.headers['referer'] || '';

    analyticsService.logRedirect(link.id, userAgent, ipAddress, referrer);

    // Perform redirect immediately
    return res.redirect(302, link.originalUrl);
  } catch (err) {
    next(err);
  }
});

// Helper for sending high-quality HTML error sheets
function renderErrorPage(res: Response, title: string, description: string, statusCode: number) {
  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | LinkForge AI</title>
      <style>
        body {
          background-color: #09090b;
          color: #fafafa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          max-width: 480px;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          background: linear-gradient(to right, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          color: #a1a1aa;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(to right, #4f46e5, #7c3aed);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .btn:hover {
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${description}</p>
        <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Back to LinkForge AI</a>
      </div>
    </body>
    </html>
  `);
}

// 4. Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 LinkForge AI API Gateway running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});

export default app;

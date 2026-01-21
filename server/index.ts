import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { warmCache } from "./cache";
import { checkDatabaseHealth } from "./db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Performance and security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Enable gzip compression for all responses
app.use(compression({
  level: 6, // Good balance between compression and speed
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if the request includes a cache-control no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Faster JSON parsing with size limits
app.use(
  express.json({
    limit: '10mb', // Reasonable limit
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: '10mb' }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Enhanced logging middleware with response time tracking
app.use((req, res, next) => {
  const start = process.hrtime.bigint(); // High-resolution timer
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration.toFixed(2)}ms`;
      if (capturedJsonResponse && !path.includes('/health')) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Warn about slow requests
      if (duration > 1000) {
        logLine += " ⚠️  SLOW";
      } else if (duration < 100) {
        logLine += " ⚡ FAST";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    const status = dbHealthy ? 'healthy' : 'unhealthy';
    const statusCode = dbHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      status,
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

(async () => {
  try {
    // Check database connection before starting
    log('Checking database connection...');
    const dbHealthy = await checkDatabaseHealth();
    
    if (!dbHealthy) {
      log('⚠️  Database connection failed, but starting server anyway...');
    } else {
      log('✅ Database connection successful');
    }

    // Warm up caches on startup
    await warmCache();
    
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(port, "localhost", () => {
      log(`🚀 Server ready at http://localhost:${port} - Optimized for maximum performance!`);
      log(`📊 Health check available at http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

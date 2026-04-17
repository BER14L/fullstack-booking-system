/**
 * SmartReserve API bootstrap.
 *
 * Middleware order matters:
 *   1. Security / platform headers (helmet, cors, trust proxy).
 *   2. Stripe webhook with `express.raw()` — must be before `express.json()`
 *      or signatures fail.
 *   3. Standard JSON parser + logger.
 *   4. Rate limiting.
 *   5. Routers.
 *   6. 404 + error handlers (last).
 */
import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { env, corsOrigins, isProd } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { disconnectPrisma, prisma } from "./config/prisma";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import routes from "./routes";
import paymentRoutes from "./routes/payment.routes";
import { logger } from "./utils/logger";

function buildApp(): Express {
  const app = express();

  // Behind Render/Vercel/NGINX we trust the first proxy so rate limiting and
  // `req.ip` see the real client.
  app.set("trust proxy", 1);

  app.use(helmet());

  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow same-origin / server-to-server (no origin) and explicit allowlist.
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );

  // --- Stripe webhook: mounted BEFORE the JSON parser so the raw Buffer
  // survives for signature verification. Anything else under /api uses JSON.
  app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    paymentRoutes,
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(isProd ? "combined" : "dev"));
  app.use(globalLimiter);

  // API docs
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Main API
  app.use("/api", routes);

  // Nicely-typed 404 for anything not matched.
  app.use(notFoundHandler);
  // Central error handler — MUST be last.
  app.use(errorHandler);

  return app;
}

async function start() {
  const app = buildApp();

  // Fail fast if the DB is unreachable. No point booting an API with no DB.
  try {
    await prisma.$connect();
    logger.info("Database connection established");
  } catch (err) {
    logger.error("Database connection failed", {
      message: (err as Error).message,
    });
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`SmartReserve API listening on http://localhost:${env.PORT}`);
    logger.info(`Swagger UI: http://localhost:${env.PORT}/api/docs`);
  });

  // Graceful shutdown.
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
    // Hard exit if shutdown hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

// Only start when executed directly; leaves `buildApp` importable for tests.
if (require.main === module) {
  void start();
}

export { buildApp };

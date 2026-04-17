/**
 * Prisma client singleton.
 *
 * Prisma opens a pool per `PrismaClient` instance, so we instantiate exactly
 * one for the life of the process. In dev with hot reload, we also stash the
 * instance on `globalThis` to avoid leaking connections between reloads.
 */
import { PrismaClient } from "@prisma/client";
import { env, isProd } from "./env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ["error"] : ["warn", "error"],
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown — ensures pools close cleanly on SIGTERM/SIGINT.
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

// Tiny helper so callers can avoid importing `env` just for this.
export const databaseUrl = env.DATABASE_URL;

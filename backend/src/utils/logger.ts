/**
 * Minimal logger shim.
 *
 * Keeps third-party logging libraries out of the critical path; swap for
 * pino/winston later without changing call sites.
 */
/* eslint-disable no-console */
import { isProd } from "../config/env";

type Level = "info" | "warn" | "error" | "debug";

function stamp(level: Level, msg: string, meta?: unknown): string {
  const now = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${now}] ${level.toUpperCase()} ${msg}${metaStr}`;
}

export const logger = {
  info: (msg: string, meta?: unknown) => console.log(stamp("info", msg, meta)),
  warn: (msg: string, meta?: unknown) => console.warn(stamp("warn", msg, meta)),
  error: (msg: string, meta?: unknown) => console.error(stamp("error", msg, meta)),
  debug: (msg: string, meta?: unknown) => {
    if (!isProd) console.debug(stamp("debug", msg, meta));
  },
};

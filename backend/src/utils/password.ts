/**
 * Password hashing helpers.
 *
 * bcryptjs (pure JS) is used instead of native bcrypt so Docker images don't
 * require build tools. Cost factor 12 is a good 2026 default — tune upward as
 * CPUs get faster.
 */
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

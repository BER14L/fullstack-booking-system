/**
 * Auth service — all business logic for registration, login, and profile
 * retrieval. Controllers stay thin HTTP adapters on top of this.
 */
import { prisma } from "../config/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import type { LoginInput, RegisterInput } from "../validators/auth.validator";

function toPublicUser(u: {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("Email is already registered");

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashed,
      // Role defaults to USER in the schema; admins are promoted manually
      // via a DB update — no public endpoint should grant ADMIN.
    },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Constant-ish time: even if user is missing, run bcrypt so attackers can't
  // easily probe for valid emails by comparing response times.
  const dummyHash = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8v/dUm0o.HXhvRBfQ1qH9K2r4qD5W6";
  const ok = await verifyPassword(input.password, user?.password ?? dummyHash);
  if (!user || !ok) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");
  return toPublicUser(user);
}

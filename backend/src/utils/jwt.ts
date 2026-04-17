/**
 * JWT helpers.
 *
 * Access tokens only — short-lived (default 1h). When you add a refresh-token
 * flow later, keep refresh tokens in an httpOnly cookie and rotate on use.
 */
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./ApiError";

export interface TokenPayload extends JwtPayload {
  sub: string; // user id
  role: "USER" | "ADMIN";
  email: string;
}

export function signToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string") {
      throw ApiError.unauthorized("Malformed token");
    }
    return decoded as TokenPayload;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

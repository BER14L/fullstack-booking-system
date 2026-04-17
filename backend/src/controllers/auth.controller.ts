/**
 * Auth controllers — thin HTTP adapters over `auth.service`.
 */
import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json(result);
}

export async function me(req: AuthenticatedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.getProfile(req.user.sub);
  res.status(200).json({ user });
}

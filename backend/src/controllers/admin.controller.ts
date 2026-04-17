/**
 * Admin controllers — wrap the admin service. Access is enforced by
 * `requireRole("ADMIN")` on the router, not here, to keep controllers pure.
 */
import { Request, Response } from "express";
import * as adminService from "../services/admin.service";

function parsePagination(req: Request) {
  const page = Number.parseInt(String(req.query.page ?? "1"), 10) || 1;
  const pageSize = Number.parseInt(String(req.query.pageSize ?? "25"), 10) || 25;
  return { page, pageSize };
}

export async function users(req: Request, res: Response) {
  const { page, pageSize } = parsePagination(req);
  res.status(200).json(await adminService.listAllUsers(page, pageSize));
}

export async function bookings(req: Request, res: Response) {
  const { page, pageSize } = parsePagination(req);
  res.status(200).json(await adminService.listAllBookings(page, pageSize));
}

export async function analytics(_req: Request, res: Response) {
  res.status(200).json(await adminService.getAnalytics());
}

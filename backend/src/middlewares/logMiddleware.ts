import { Request, Response, NextFunction } from "express";

export const logMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const waktu = new Date().toLocaleTimeString("id-ID");
  console.log(`[${waktu}] ${req.method} ${req.originalUrl}`);
  next();
};

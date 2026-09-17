import { Request, Response, NextFunction } from "express";

export const roleAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user && user.role === "ADMIN") {
    return next();
  }

  return res.status(403).json({
    message: "akses ditolak hanya admin yang diizinkan",
  });
};

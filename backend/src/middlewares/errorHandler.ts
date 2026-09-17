import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan pada server.";

  return res.status(statusCode).json({
    message: message,
  });
};

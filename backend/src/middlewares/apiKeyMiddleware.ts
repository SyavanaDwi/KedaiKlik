import { Request, Response, NextFunction } from "express";

export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey === "RESTORAN28") {
    next();
  } else {
    res.status(403).json({ message: "akses ditolak! API Key salah" });
  }
};

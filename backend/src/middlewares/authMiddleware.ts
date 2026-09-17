import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "akses ditolak, token tidak ada!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "token sudah tidak bisa digunakan/kadaluarsa!" });
  }
};

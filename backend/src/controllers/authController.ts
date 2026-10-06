import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi!",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah digunakan!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashPassword,
        role: role ? (role as Role) : "STAFF",
        statusUser: true,
        isLoggedIn: false,
      },
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      data: {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi!",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isMatch) {
      return res.status(401).json({ message: "Email atau password salah!" });
    }

    if (!user.statusUser) {
      return res
        .status(403)
        .json({ message: "Akun Anda telah dinonaktifkan oleh Admin." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isLoggedIn: true,
        lastLoginAt: new Date(),
      },
    });

    const secret = process.env.JWT_SECRET || "default_secret_key";

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login berhasil",
      token,
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id;

    if (userId) {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          isLoggedIn: false,
          lastLogoutAt: new Date(),
        },
      });
    }

    return res.status(200).json({
      message: "Logout berhasil",
    });
  } catch (error) {
    next(error);
  }
};

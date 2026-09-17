import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

const userSelect = {
  id: true,
  nama: true,
  email: true,
  role: true,
  statusUser: true,
  isLoggedIn: true,
  lastLoginAt: true,
  lastLogoutAt: true,
  createAt: true,
  updateAt: true,
};

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findMany({
      where: { statusUser: true },
      select: userSelect,
      orderBy: [{ statusUser: "desc" }, { id: "desc" }],
    });
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID user harus berupa angka" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Data berhasil ditampilkan",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getOnlineUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const onlineUsers = await prisma.user.findMany({
      where: {
        statusUser: true,
      },
      select: {
        id: true,
        nama: true,
        role: true,
        statusUser: true,
      },
    });

    return res.status(200).json(onlineUsers);
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
        where: { id: userId },
        data: {
          isLoggedIn: false,
          lastLogoutAt: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil logout",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID user harus berupa angka" });
    }

    const { nama, email, password, role, statusUser } = req.body;
    const loggedInUser = (req as any).user;

    const userLama = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userLama) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    if (email && email !== userLama.email) {
      const emailTerpakai = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTerpakai) {
        return res.status(400).json({
          message: "Email ini sudah terdaftar di akun lain",
        });
      }
    }

    let updatedPassword = userLama.password;
    if (password && typeof password === "string" && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updatedPassword = await bcrypt.hash(password, salt);
    }

    let updatedRole = userLama.role;
    let updatedStatus = userLama.statusUser;

    if (loggedInUser?.role === "ADMIN") {
      if (role && Object.values(Role).includes(role as Role)) {
        updatedRole = role as Role;
      }
      if (statusUser !== undefined) {
        updatedStatus = Boolean(statusUser);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        nama: nama ?? userLama.nama,
        email: email ?? userLama.email,
        password: updatedPassword,
        role: updatedRole,
        statusUser: updatedStatus,
      },
      select: userSelect,
    });

    return res.status(200).json({
      message: "Berhasil mengupdate data user",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        statusUser: false,
        isLoggedIn: false,
        lastLogoutAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Akun berhasil dinonaktifkan (Soft Delete).",
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus akun: " + error.message,
    });
  }
};

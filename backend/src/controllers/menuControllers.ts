import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { Kategori } from "@prisma/client";

export const getAllMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const menu = await prisma.menu.findMany({
      orderBy: { id: "asc" },
    });
    return res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

export const getMenuByid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const menuId = Number(id);

    if (isNaN(menuId)) {
      return res.status(400).json({ message: "ID menu harus berupa angka" });
    }

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Data berhasil ditampilkan",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const createMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { menu, harga, kategori, deskripsi } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!menu || harga === undefined || !kategori) {
      return res.status(400).json({
        message: "Nama menu, harga, dan kategori wajib diisi!",
      });
    }

    const parsedHarga = Number(harga);
    if (isNaN(parsedHarga) || parsedHarga < 0) {
      return res.status(400).json({
        message: "Harga harus berupa angka valid dan bernilai positif!",
      });
    }

    const menuYgSudahAda = await prisma.menu.findFirst({
      where: {
        menu: { equals: menu, mode: "insensitive" },
      },
    });

    if (menuYgSudahAda) {
      return res.status(400).json({
        message: `Menu dengan nama ${menu} sudah terdaftar!`,
      });
    }

    const newMenu = await prisma.menu.create({
      data: {
        menu,
        harga: parsedHarga,
        kategori: kategori as Kategori,
        deskripsi,
        image,
      },
    });

    return res.status(201).json({
      message: "Menu berhasil ditambahkan",
      data: newMenu,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const menuId = Number(id);

    if (isNaN(menuId)) {
      return res.status(400).json({ message: "ID menu harus berupa angka" });
    }

    const { menu, harga, kategori, deskripsi, statusMenu } = req.body;
    const user = (req as any).user;

    // Proteksi role Staff jika middleware menyertakan req.user
    if (user && user.role === "STAFF") {
      if (
        menu !== undefined ||
        harga !== undefined ||
        kategori !== undefined ||
        deskripsi !== undefined
      ) {
        return res.status(403).json({
          message:
            "Akses ditolak! Staff hanya boleh mengubah status ketersediaan menu.",
        });
      }
    }

    const menuLama = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menuLama) {
      return res.status(404).json({
        message: "Menu tidak ditemukan",
      });
    }

    if (menu && menu.toLowerCase() !== menuLama.menu.toLowerCase()) {
      const menuDuplikat = await prisma.menu.findFirst({
        where: {
          menu: {
            equals: menu,
            mode: "insensitive",
          },
          id: { not: menuId },
        },
      });

      if (menuDuplikat) {
        return res.status(400).json({
          message: `Menu dengan nama ${menu} sudah ada!`,
        });
      }
    }

    let parsedHarga = menuLama.harga;
    if (harga !== undefined) {
      parsedHarga = Number(harga);
      if (isNaN(parsedHarga) || parsedHarga < 0) {
        return res.status(400).json({
          message: "Harga harus berupa angka valid!",
        });
      }
    }

    const resultUpdate = await prisma.menu.update({
      where: { id: menuId },
      data: {
        menu: menu ?? menuLama.menu,
        harga: parsedHarga,
        kategori: kategori ? (kategori as Kategori) : menuLama.kategori,
        deskripsi: deskripsi ?? menuLama.deskripsi,
        statusMenu:
          statusMenu !== undefined ? Boolean(statusMenu) : menuLama.statusMenu,
      },
    });

    return res.status(200).json({
      message: "Data berhasil diperbarui",
      data: resultUpdate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const menuId = Number(id);

    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }

    try {
      return res
        .status(200)
        .json({ message: "Menu berhasil dihapus permanen" });
    } catch (prismaError: any) {
      if (prismaError.code === "P2003") {
        const updatedMenu = await prisma.menu.update({
          where: { id: menuId },
          data: { statusMenu: false },
        });

        return res.status(200).json({
          message:
            "Menu tidak dapat dihapus karena sudah memiliki histori pesanan. Status menu berhasil diubah menjadi 'Habis' (Nonaktif).",
          data: updatedMenu,
        });
      }
      throw prismaError;
    }
  } catch (error) {
    next(error);
  }
};

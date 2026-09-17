import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export const getAllPelanggan = async (req: Request, res: Response) => {
  try {
    const pelanggan = await prisma.pelanggan.findMany({
      include: {
        member: true,
        _count: {
          select: { order: true },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: pelanggan,
    });
  } catch (error) {
    console.error("Error getAllPelanggan:", error);
    return res.status(500).json({ message: "Gagal mengambil data pelanggan" });
  }
};

export const getPelangganById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const pelangganId = Number(id);

    if (isNaN(pelangganId)) {
      return res
        .status(400)
        .json({ message: "ID pelanggan harus berupa angka" });
    }

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: pelangganId },
      include: { member: true },
    });

    if (!pelanggan) {
      return res
        .status(404)
        .json({ message: `Pelanggan dengan ID ${id} tidak ditemukan` });
    }

    return res.status(200).json({
      message: "Berhasil menampilkan data",
      data: pelanggan,
      historyMember: pelanggan.member !== null,
    });
  } catch (error) {
    next(error);
  }
};

export const createPelanggan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { nama, nomer_hp, alamat } = req.body;

    if (!nama || !nomer_hp) {
      return res.status(400).json({
        message: "Nama dan nomor HP wajib diisi!",
      });
    }

    const nomerPelanggan = await prisma.pelanggan.findUnique({
      where: { nomer_hp },
    });

    if (nomerPelanggan) {
      if (nomerPelanggan.statusPelanggan === false) {
        return res.status(403).json({
          message:
            "Nomor handphone ini sudah diblacklist/diberhentikan dan tidak bisa didaftarkan kembali",
        });
      }

      return res.status(400).json({
        message: "Nomor handphone ini sudah terdaftar!",
      });
    }

    const newPelanggan = await prisma.pelanggan.create({
      data: {
        nama,
        nomer_hp,
        alamat: alamat || null,
      },
    });

    return res.status(201).json({
      message: "Pelanggan berhasil ditambahkan",
      data: newPelanggan,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePelanggan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const pelangganId = Number(id);

    if (isNaN(pelangganId)) {
      return res
        .status(400)
        .json({ message: "ID pelanggan harus berupa angka" });
    }

    const { nama, nomer_hp, alamat, statusPelanggan } = req.body;

    const pelangganLama = await prisma.pelanggan.findUnique({
      where: { id: pelangganId },
    });

    if (!pelangganLama) {
      return res.status(404).json({
        message: "Pelanggan tidak ditemukan",
      });
    }

    if (nomer_hp && nomer_hp !== pelangganLama.nomer_hp) {
      const nomerTerpakai = await prisma.pelanggan.findUnique({
        where: { nomer_hp },
      });

      if (nomerTerpakai) {
        return res.status(400).json({
          message: "Nomor handphone sudah terdaftar di akun lain!",
        });
      }
    }

    const pelanggan = await prisma.pelanggan.update({
      where: { id: pelangganId },
      data: {
        nama: nama ?? pelangganLama.nama,
        nomer_hp: nomer_hp ?? pelangganLama.nomer_hp,
        alamat: alamat !== undefined ? alamat : pelangganLama.alamat,
        statusPelanggan:
          statusPelanggan !== undefined
            ? Boolean(statusPelanggan)
            : pelangganLama.statusPelanggan,
      },
    });

    return res.status(200).json({
      message: "Data pelanggan berhasil diperbarui",
      data: pelanggan,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBlacklistPelanggan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const pelangganId = Number(id);

    if (isNaN(pelangganId)) {
      return res
        .status(400)
        .json({ message: "ID pelanggan harus berupa angka" });
    }

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: pelangganId },
    });

    if (!pelanggan) {
      return res.status(404).json({ message: "Pelanggan tidak ditemukan" });
    }

    const newStatus = !pelanggan.statusPelanggan;

    const updatedPelanggan = await prisma.pelanggan.update({
      where: { id: pelangganId },
      data: {
        statusPelanggan: newStatus,
      },
    });

    return res.status(200).json({
      message: newStatus
        ? "Pelanggan berhasil diaktifkan kembali"
        : "Pelanggan berhasil diblacklist",
      data: updatedPelanggan,
    });
  } catch (error) {
    next(error);
  }
};

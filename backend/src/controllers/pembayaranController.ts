import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export const getAllPembayaran = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pembayaran = await prisma.pembayaran.findMany({
      include: {
        order: {
          include: { pelanggan: true },
        },
        penerimaKasir: {
          select: { id: true, nama: true, email: true, role: true },
        },
      },
      orderBy: { id: "desc" },
    });
    return res.status(200).json(pembayaran);
  } catch (error) {
    next(error);
  }
};

export const getPembayaranById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const pembayaranId = Number(id);

    if (isNaN(pembayaranId)) {
      return res
        .status(400)
        .json({ message: "ID pembayaran harus berupa angka" });
    }

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: pembayaranId },
      include: {
        order: {
          include: { pelanggan: true, pesanMenu: { include: { menu: true } } },
        },
        penerimaKasir: {
          select: { id: true, nama: true, email: true, role: true },
        },
      },
    });

    if (!pembayaran) {
      return res.status(404).json({
        message: `Pembayaran dengan ID ${id} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: "Berhasil menampilkan data",
      data: pembayaran,
    });
  } catch (error) {
    next(error);
  }
};

export const createPembayaran = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId, jumlah, metode, penerimaKasirId } = req.body;

    // Validasi manual input wajib
    if (!orderId || jumlah === undefined || !metode || !penerimaKasirId) {
      return res.status(400).json({
        message:
          "Order ID, jumlah pembayaran, metode, dan Kasir ID wajib diisi!",
      });
    }

    const parsedOrderId = Number(orderId);
    const parsedJumlah = Number(jumlah);
    const parsedKasirId = Number(penerimaKasirId);

    if (isNaN(parsedOrderId) || isNaN(parsedJumlah) || isNaN(parsedKasirId)) {
      return res.status(400).json({
        message: "Order ID, jumlah, dan Kasir ID harus berupa angka valid!",
      });
    }

    if (parsedJumlah <= 0) {
      return res.status(400).json({
        message: "Jumlah pembayaran harus lebih dari 0!",
      });
    }

    const orderSebelumnya = await prisma.order.findUnique({
      where: { id: parsedOrderId },
    });

    if (!orderSebelumnya) {
      return res.status(404).json({
        message: `Order dengan ID ${parsedOrderId} tidak ditemukan!`,
      });
    }

    const totalHarga = Number(orderSebelumnya.total);

    if (parsedJumlah < totalHarga) {
      return res.status(400).json({
        message: `Jumlah pembayaran (Rp ${parsedJumlah.toLocaleString("id-ID")}) kurang dari total tagihan (Rp ${totalHarga.toLocaleString("id-ID")})!`,
      });
    }

    const userKasir = await prisma.user.findUnique({
      where: { id: parsedKasirId },
    });

    if (!userKasir) {
      return res.status(404).json({
        message: `User/Kasir dengan ID ${parsedKasirId} tidak ditemukan!`,
      });
    }

    const pembayaran = await prisma.$transaction(async (transaksi) => {
      const newPembayaran = await transaksi.pembayaran.create({
        data: {
          orderId: parsedOrderId,
          jumlah: parsedJumlah,
          metode,
          penerimaKasirId: parsedKasirId,
        },
      });

      await transaksi.order.update({
        where: { id: parsedOrderId },
        data: { statusPembayaran: "SUDAH_DIBAYAR" },
      });

      return newPembayaran;
    });

    return res.status(201).json({
      message: "Pembayaran berhasil diproses",
      data: pembayaran,
    });
  } catch (error) {
    next(error);
  }
};

export const getPembayaranByOrderId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const parsedOrderId = Number(orderId);

    if (isNaN(parsedOrderId)) {
      return res
        .status(400)
        .json({ message: "Order ID harus berupa angka valid" });
    }

    const pembayaran = await prisma.pembayaran.findFirst({
      where: { orderId: parsedOrderId },
      include: {
        order: {
          include: { pelanggan: true, pesanMenu: { include: { menu: true } } },
        },
        penerimaKasir: {
          select: { id: true, nama: true, email: true, role: true },
        },
      },
    });

    if (!pembayaran) {
      return res.status(404).json({
        message: `Data pembayaran untuk Order ID ${orderId} belum ditemukan`,
      });
    }

    return res.status(200).json({
      message: "Berhasil menampilkan data pembayaran",
      data: pembayaran,
    });
  } catch (error) {
    next(error);
  }
};

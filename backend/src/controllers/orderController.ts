import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export const getAllOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await prisma.order.findMany({
      include: {
        pelanggan: true,
        createBy: {
          select: { id: true, nama: true, email: true, role: true },
        },
        pesanMenu: {
          include: { menu: true },
        },
        historiPesanan: true,
      },
      orderBy: { id: "desc" },
    });
    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: "ID order harus berupa angka" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pelanggan: true,
        createBy: {
          select: { id: true, nama: true, email: true, role: true },
        },
        pesanMenu: {
          include: { menu: true },
        },
        historiPesanan: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    return res
      .status(200)
      .json({ message: "Berhasil menampilkan data", data: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pelangganId, kasirId, items, diskon = 0 } = req.body;

    if (
      !pelangganId ||
      !kasirId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Pelanggan ID, kasir ID, dan items pesanan wajib diisi!",
      });
    }

    const parsedPelangganId = Number(pelangganId);
    const parsedKasirId = Number(kasirId);

    if (isNaN(parsedPelangganId) || isNaN(parsedKasirId)) {
      return res.status(400).json({
        message: "Pelanggan ID dan Kasir ID harus berupa angka valid!",
      });
    }

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: parsedPelangganId },
    });

    if (!pelanggan) {
      return res.status(404).json({
        message: `Pelanggan dengan ID ${parsedPelangganId} tidak ditemukan`,
      });
    }

    if (pelanggan.statusPelanggan === false) {
      return res.status(400).json({
        message:
          "Pelanggan ini sedang nonaktif/blacklist dan tidak dapat membuat orderan",
      });
    }

    const kasir = await prisma.user.findUnique({
      where: { id: parsedKasirId },
    });

    if (!kasir) {
      return res.status(404).json({
        message: `Kasir dengan ID ${parsedKasirId} tidak ditemukan`,
      });
    }

    for (const item of items) {
      if (!item.menuId || !item.jumlah || item.harga === undefined) {
        return res.status(400).json({
          message: "Setiap item wajib memiliki menuId, jumlah, dan harga!",
        });
      }

      const menuStatus = await prisma.menu.findUnique({
        where: { id: Number(item.menuId) },
      });

      if (!menuStatus || menuStatus.statusMenu === false) {
        return res.status(400).json({
          message: `Menu ${menuStatus?.menu || item.menuId} sedang tidak tersedia/habis`,
        });
      }
    }

    let subTotal = 0;

    const pesanMenuData = items.map(
      (item: { menuId: number; jumlah: number; harga: number }) => {
        const itemSubTotal = Number(item.jumlah) * Number(item.harga);
        subTotal += itemSubTotal;

        return {
          menuId: Number(item.menuId),
          jumlah: Number(item.jumlah),
          hargaSnapshot: Number(item.harga),
          subTotal: itemSubTotal,
        };
      },
    );

    const parsedDiskon = Number(diskon) || 0;
    const total = Math.max(0, subTotal - parsedDiskon);
    const orderKode = `ORD-${Date.now()}`;

    const newOrder = await prisma.order.create({
      data: {
        orderKode,
        subTotal: Number(subTotal),
        diskon: parsedDiskon,
        total: Number(total),
        pelanggan: {
          connect: { id: parsedPelangganId },
        },
        createBy: {
          connect: { id: parsedKasirId },
        },
        pesanMenu: {
          create: pesanMenuData,
        },
        historiPesanan: {
          create: {
            status: "MENUNGGU",
            diubahOleh: {
              connect: { id: parsedKasirId },
            },
          },
        },
      },
      include: {
        pelanggan: true,
        pesanMenu: { include: { menu: true } },
        historiPesanan: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Order berhasil dibuat", data: newOrder });
  } catch (error: any) {
    console.error("--- PRISMA ERROR DETAIL ---", error);
    next(error);
  }
};

export const updateStatusOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: "ID order harus berupa angka" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status order wajib diisi!" });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        pelanggan: true,
        pesanMenu: { include: { menu: true } },
        historiPesanan: true,
      },
    });

    return res.status(200).json({
      message: "Status order berhasil diperbarui",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

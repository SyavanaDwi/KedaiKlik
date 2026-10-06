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
    const {
      pelangganId,
      kasirId,
      mejaId,
      namaTamu,
      nomerHpTamu,
      items,
      diskon = 0,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Items pesanan wajib diisi!",
      });
    }

    const isGuestOrder = !pelangganId && !kasirId;

    if (isGuestOrder) {
      if (!mejaId || !namaTamu) {
        return res.status(400).json({
          message: "Meja dan nama wajib diisi!",
        });
      }
    } else {
      if (!pelangganId || !kasirId) {
        return res.status(400).json({
          message: "Pelanggan ID dan kasir ID wajib diisi!",
        });
      }
    }

    let parsedMejaId: number | undefined;
    let parsedPelangganId: number | undefined;
    let parsedKasirId: number | undefined;

    if (mejaId !== undefined) {
      parsedMejaId = Number(mejaId);

      if (isNaN(parsedMejaId)) {
        return res.status(400).json({
          message: "Meja ID harus berupa angka valid!",
        });
      }

      const meja = await prisma.meja.findUnique({
        where: { id: parsedMejaId },
      });

      if (!meja) {
        return res.status(404).json({
          message: "Meja tidak ditemukan",
        });
      }

      if (!meja.statusMeja) {
        return res.status(400).json({
          message: "Meja sedang tidak aktif",
        });
      }
    }

    if (pelangganId !== undefined) {
      parsedPelangganId = Number(pelangganId);

      if (isNaN(parsedPelangganId)) {
        return res.status(400).json({
          message: "Pelanggan ID harus berupa angka valid!",
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

      if (!pelanggan.statusPelanggan) {
        return res.status(400).json({
          message:
            "Pelanggan ini sedang nonaktif/blacklist dan tidak dapat membuat orderan",
        });
      }
    }

    if (kasirId !== undefined) {
      parsedKasirId = Number(kasirId);

      if (isNaN(parsedKasirId)) {
        return res.status(400).json({
          message: "Kasir ID harus berupa angka valid!",
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
    }

    let subTotal = 0;
    const pesanMenuData = [];

    for (const item of items) {
      if (!item.menuId || !item.jumlah) {
        return res.status(400).json({
          message: "Setiap item wajib memiliki menuId dan jumlah!",
        });
      }

      const menu = await prisma.menu.findUnique({
        where: {
          id: Number(item.menuId),
        },
      });

      if (!menu) {
        return res.status(404).json({
          message: `Menu dengan ID ${item.menuId} tidak ditemukan`,
        });
      }

      if (!menu.statusMenu) {
        return res.status(400).json({
          message: `Menu ${menu.menu} sedang tidak tersedia/habis`,
        });
      }

      const jumlah = Number(item.jumlah);
      const harga = Number(menu.harga);
      const itemSubTotal = harga * jumlah;

      subTotal += itemSubTotal;

      pesanMenuData.push({
        menuId: menu.id,
        jumlah,
        hargaSnapshot: harga,
        subTotal: itemSubTotal,
      });
    }

    const parsedDiskon = Number(diskon) || 0;
    const total = Math.max(0, subTotal - parsedDiskon);

    const orderKode = `ORD-${Date.now()}`;

    const newOrder = await prisma.order.create({
      data: {
        orderKode,

        ...(parsedMejaId !== undefined && {
          meja: {
            connect: {
              id: parsedMejaId,
            },
          },
        }),

        ...(parsedPelangganId !== undefined && {
          pelanggan: {
            connect: {
              id: parsedPelangganId,
            },
          },
        }),

        ...(namaTamu && {
          namaTamu,
        }),

        ...(nomerHpTamu && {
          nomerHpTamu,
        }),

        ...(parsedKasirId !== undefined && {
          createBy: {
            connect: {
              id: parsedKasirId,
            },
          },
        }),

        subTotal,
        diskon: parsedDiskon,
        total,

        pesanMenu: {
          create: pesanMenuData,
        },

        ...(parsedKasirId !== undefined && {
          historiPesanan: {
            create: {
              status: "MENUNGGU",
              diubahOleh: {
                connect: {
                  id: parsedKasirId,
                },
              },
            },
          },
        }),
      },

      include: {
        meja: true,
        pelanggan: true,
        createBy: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
        pesanMenu: {
          include: {
            menu: true,
          },
        },
        historiPesanan: true,
      },
    });

    return res.status(201).json({
      message: "Order berhasil dibuat",
      data: newOrder,
    });
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

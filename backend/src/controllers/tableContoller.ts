import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import QRCode from "qrcode";

export const getAllTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const table = await prisma.meja.findMany({
      orderBy: { nomerMeja: "asc" },
    });
    return res.status(200).json(table);
  } catch (error) {
    next(error);
  }
};

export const getTableById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const table = await prisma.meja.findUnique({
      where: { id },
    });

    if (!table) {
      return res.status(404).json({
        message: "meja tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Meja berhasil ditampilkan",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

export const createTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { nomerMeja } = req.body;

    if (!nomerMeja) {
      return res.status(400).json({
        message: "nomer meja wajib diisi!",
      });
    }

    const table = await prisma.meja.create({
      data: {
        nomerMeja: Number(nomerMeja),
      },
    });

    return res.status(200).json({
      message: "berhasil membuat meja baru",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const { nomerMeja, statusMeja } = req.body;

    const table = await prisma.meja.update({
      where: {
        id,
      },
      data: {
        ...(nomerMeja !== undefined && {
          nomerMeja: Number(nomerMeja),
        }),
        ...(statusMeja !== undefined && {
          statusMeja,
        }),
      },
    });

    return res.status(200).json({
      message: "berhasil mengupdate meja",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

export const getTableQr = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const table = await prisma.meja.findUnique({
      where: { id },
    });

    if (!table) {
      return res.status(404).json({
        message: "Meja tidak ditemukan",
      });
    }

    const url = `http://localhost:5174/?meja=${table.nomerMeja}`;

    const qrCode = await QRCode.toDataURL(url);

    return res.status(200).json({
      message: "QR meja berhasil dibuat",
      data: {
        id: table.id,
        nomerMeja: table.nomerMeja,
        url,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTableQr = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tables = await prisma.meja.findMany({
      orderBy: {
        nomerMeja: "asc",
      },
    });

    const tablesWithQr = await Promise.all(
      tables.map(async (table) => {
        const url = `http://localhost:5174/?meja=${table.nomerMeja}`;

        const qrCode = await QRCode.toDataURL(url);

        return {
          id: table.id,
          nomerMeja: table.nomerMeja,
          statusMeja: table.statusMeja,
          url,
          qrCode,
        };
      }),
    );

    return res.status(200).json({
      message: "QR semua meja berhasil dibuat",
      data: tablesWithQr,
    });
  } catch (error) {
    next(error);
  }
};

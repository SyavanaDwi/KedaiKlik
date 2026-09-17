import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export const getAllMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const member = await prisma.member.findMany({
      include: {
        pelanggan: true,
      },
    });
    return res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

export const getMemberById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const memberId = Number(id);

    if (isNaN(memberId)) {
      return res.status(400).json({ message: "ID member harus berupa angka" });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { pelanggan: true },
    });

    if (!member) {
      return res.status(404).json({
        message: "Member tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Data berhasil ditampilkan",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pelangganId, diskon } = req.body;

    if (pelangganId === undefined || diskon === undefined) {
      return res.status(400).json({
        message: "Pelanggan ID dan diskon wajib diisi!",
      });
    }

    const parsedPelangganId = Number(pelangganId);
    const parsedDiskon = Number(diskon);

    if (isNaN(parsedPelangganId) || isNaN(parsedDiskon)) {
      return res.status(400).json({
        message: "Pelanggan ID dan diskon harus berupa angka valid!",
      });
    }

    const existingPelanggan = await prisma.pelanggan.findUnique({
      where: { id: parsedPelangganId },
    });

    if (!existingPelanggan) {
      return res.status(404).json({
        message: `Pelanggan dengan ID ${parsedPelangganId} tidak ditemukan`,
      });
    }

    const existingMember = await prisma.member.findUnique({
      where: { pelangganId: parsedPelangganId },
    });

    if (existingMember) {
      return res.status(400).json({
        message: `Pelanggan dengan ID ${parsedPelangganId} sudah terdaftar sebagai member`,
      });
    }

    const memberKode = `MBR-${Date.now()}`;

    const newMember = await prisma.member.create({
      data: {
        pelangganId: parsedPelangganId,
        memberKode,
        diskon: parsedDiskon,
      },
    });

    return res.status(201).json({
      message: "Berhasil menambahkan member",
      data: newMember,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { statusMember, diskon } = req.body;
    const memberId = Number(id);

    if (isNaN(memberId)) {
      return res.status(400).json({ message: "ID member harus berupa angka" });
    }

    const memberLama = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!memberLama) {
      return res.status(404).json({
        message: "Member tidak ditemukan",
      });
    }

    const updateData: any = {};

    if (statusMember !== undefined) {
      updateData.statusMember = Boolean(statusMember);
    }

    if (diskon !== undefined) {
      updateData.diskon = Number(diskon);
    }

    const member = await prisma.member.update({
      where: { id: memberId },
      data: updateData,
    });

    return res.status(200).json({
      message: "Member berhasil diperbarui",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAllMemberDiskon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { diskon } = req.body;

    if (diskon === undefined || isNaN(Number(diskon))) {
      return res
        .status(400)
        .json({ message: "Nilai diskon harus berupa angka yang valid!" });
    }

    const updateResult = await prisma.member.updateMany({
      data: {
        diskon: Number(diskon),
      },
    });

    return res.status(200).json({
      message: `Berhasil memperbarui diskon untuk ${updateResult.count} member.`,
      data: updateResult,
    });
  } catch (error) {
    next(error);
  }
};

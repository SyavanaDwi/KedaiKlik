import { Router } from "express";
import {
  getAllPembayaran,
  getPembayaranById,
  getPembayaranByOrderId,
  createPembayaran,
} from "../controllers/pembayaranController";

const router = Router();

router.get("/", getAllPembayaran);
router.get("/order/:orderId", getPembayaranByOrderId);
router.get("/:id", getPembayaranById);
router.post("/", createPembayaran);

export default router;

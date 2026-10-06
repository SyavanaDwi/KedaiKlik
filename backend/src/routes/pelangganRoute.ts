import { Router } from "express";
import {
  createPelanggan,
  getAllPelanggan,
  getPelangganById,
  updatePelanggan,
  toggleBlacklistPelanggan,
} from "../controllers/pelangganController";
import { authentication } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getAllPelanggan);

router.post("/", authentication, createPelanggan);
router.get("/:id", authentication, getPelangganById);
router.put("/:id", authentication, updatePelanggan);
router.patch("/:id/blacklist", authentication, toggleBlacklistPelanggan);
export default router;

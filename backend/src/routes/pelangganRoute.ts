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

router.use(authentication);

router.post("/", createPelanggan);
router.get("/", getAllPelanggan);
router.get("/:id", getPelangganById);
router.put("/:id", updatePelanggan);
router.patch("/:id/blacklist", toggleBlacklistPelanggan);
export default router;

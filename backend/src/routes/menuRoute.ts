import { Router } from "express";
import {
  createMenu,
  getAllMenu,
  getMenuByid,
  updateMenu,
  deleteMenu,
} from "../controllers/menuControllers";
import { authentication } from "../middlewares/authMiddleware";
import { roleAdmin } from "../middlewares/roleMiddleware";
import { upload } from "../lib/multer";

const router = Router();

router.get("/", getAllMenu);
router.get("/:id", getMenuByid);

router.put("/:id", authentication, updateMenu);

router.post("/", authentication, upload.single("image"), createMenu);
router.delete("/:id", authentication, roleAdmin, deleteMenu);

export default router;

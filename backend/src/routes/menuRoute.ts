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
router.use(authentication);

router.get("/", getAllMenu);
router.get("/:id", getMenuByid);
router.put("/:id", updateMenu);

router.post("/", upload.single("image"), createMenu);
router.delete("/:id", roleAdmin, deleteMenu);

export default router;

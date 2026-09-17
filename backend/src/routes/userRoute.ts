import { Router } from "express";
import {
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  getOnlineUsers,
  logout, // <-- 1. Import fungsi logout
} from "../controllers/userController";
import { authentication } from "../middlewares/authMiddleware";
import { roleAdmin } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/logout", authentication, logout);

router.use(authentication);

router.get("/online", roleAdmin, getOnlineUsers);

router.get("/", roleAdmin, getAllUser);

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", roleAdmin, deleteUser);

export default router;

import { Router } from "express";
import { register, login } from "../controllers/authController";
import { logout } from "../controllers/authController";
import { authentication } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authentication, logout);

export default router;

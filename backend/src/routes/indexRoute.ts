import { Router } from "express";
import menuRoute from "./menuRoute";
import userRoute from "./userRoute";
import pelangganRoute from "./pelangganRoute";
import memberRoute from "./memberRoute";
import orderRoute from "./orderRoute";
import pembayaranRoute from "./pembayaranRoute";
import authRoute from "./authRoute";

const router = Router();

router.use("/menu", menuRoute);
router.use("/user", userRoute);
router.use("/pelanggan", pelangganRoute);
router.use("/member", memberRoute);
router.use("/order", orderRoute);
router.use("/pembayaran", pembayaranRoute);
router.use("/auth", authRoute);

export default router;

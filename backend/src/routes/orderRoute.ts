import { Router } from "express";
import {
  createOrder,
  getAllOrder,
  getOrderById,
  updateStatusOrder,
} from "../controllers/orderController";
import { authentication } from "../middlewares/authMiddleware";

const router = Router();

router.use(authentication);

router.get("/", getAllOrder);

router.post("/", createOrder);

router.get("/:id", getOrderById);

router.patch("/status/:id", updateStatusOrder);

export default router;

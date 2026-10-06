import { Router } from "express";
import {
  getAllTable,
  getTableById,
  createTable,
  updateTable,
  getTableQr,
  getAllTableQr,
} from "../controllers/tableContoller";
import { authentication } from "../middlewares/authMiddleware";
import { roleAdmin } from "../middlewares/roleMiddleware";

const route = Router();

route.get("/", getAllTable);
route.get("/qr", getAllTableQr);
route.get("/:id", getTableById);
route.get("/:id/qr", getTableQr);

route.post("/", authentication, roleAdmin, createTable);
route.put("/:id", authentication, roleAdmin, updateTable);

export default route;

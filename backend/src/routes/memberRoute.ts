import { Router } from "express";
import {
  createMember,
  getAllMember,
  getMemberById,
  updateMember,
  updateAllMemberDiskon,
} from "../controllers/memberController";

const router = Router();

router.get("/", getAllMember);
router.get("/:id", getMemberById);

router.post("/", createMember);

router.put("/:id", updateMember);
router.put("/all/diskon", updateAllMemberDiskon);

export default router;

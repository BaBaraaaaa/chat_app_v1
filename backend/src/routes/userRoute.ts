import { Router } from "express";
import { getMe } from "../controllers/userController";

const router = Router();

router.get("/me", getMe);

export default router;
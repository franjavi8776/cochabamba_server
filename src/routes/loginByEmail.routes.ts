import { Router } from "express";
import { loginUser } from "../controllers/login.controllers";

const router = Router();

router.post("/login", loginUser);

export default router;

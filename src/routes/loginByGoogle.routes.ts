import { Router } from "express";
import { loginGoogle } from "../controllers/login.controllers";

const router = Router();

router.get("/google", loginGoogle);

export default router;

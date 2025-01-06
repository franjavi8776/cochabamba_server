import { Router } from "express";
import multer from "multer";
import {
  createGym,
  deleteGym,
  getGyms,
  getGymsByCategory,
  getGymsByUserId,
  toggleIsActiveGym,
  updateGym,
} from "../controllers/gym.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.get("/gyms/isActive", toggleIsActiveGym);
router.get("/gyms/categories", getGymsByCategory);
router.get("/gyms", getGyms);
router.get("/gyms/:id", getGymsByUserId);
router.post("/gyms", upload.array("images"), createGym);
router.put("/gyms/:id", upload.array("images"), updateGym);
router.delete("/gyms/:id", deleteGym);

export default router;

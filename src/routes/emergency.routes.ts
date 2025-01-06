import { Router } from "express";
import multer from "multer";
import {
  createEmergency,
  deleteEmergency,
  getEmergencies,
  getEmergenciesByCategory,
  getEmergenciesByUserId,
  toggleIsActiveEmergency,
  updatedEmergency,
} from "../controllers/emergency.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.patch("/emergencies/isActive", toggleIsActiveEmergency);
router.get("/emergencies/categories", getEmergenciesByCategory);
router.get("/emergencies", getEmergencies);
router.get("/emergencies/:id", getEmergenciesByUserId);
router.post("/emergencies", upload.array("images"), createEmergency);
router.put("/emergencies/:id", upload.array("images"),updatedEmergency);
router.delete("/emergencies", deleteEmergency);

export default router;

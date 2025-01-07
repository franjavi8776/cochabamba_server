import { Router } from "express";
import multer from "multer";
import {
  createTourism,
  deleteTourism,
  getTourisms,
  getTourismsByCategory,
  getTourismsByUserId,
  toggleIsActiveTourism,
  updatedTourism,
} from "../controllers/tourism.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.patch("/tourisms/isActive/:id", toggleIsActiveTourism);
router.get("/tourisms/categories", getTourismsByCategory);
router.get("/tourisms", getTourisms);
router.get("/tourisms/:id", getTourismsByUserId);
router.post("/tourisms", upload.array("images"), createTourism);
router.put("/tourisms/:id", upload.array("images"), updatedTourism);
router.delete("/tourisms", deleteTourism);

export default router;

import { Router } from "express";
import multer from "multer";
import {
  createTaxi,
  deleteTaxi,
  getTaxis,
  getTaxisByUserId,
  toggleIsActiveTaxi,
  updatedTaxi,
} from "../controllers/taxi.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.patch("/taxis/isActive/:id", toggleIsActiveTaxi);
router.get("/taxis", getTaxis);
router.get("/taxis/:id", getTaxisByUserId);
router.post("/taxis", upload.array("images"), createTaxi);
router.put("/taxis/:id", upload.array("images"), updatedTaxi);
router.delete("/taxis/:id", deleteTaxi);

export default router;

import { Router } from "express";
import multer from "multer";
import {
  createSupermarket,
  deleteSupermarket,
  getSupermarkets,
  getSupermarketsByCategory,
  getSupermarketsByUserId,
  toggleIsActiveSupermarket,
  updatedSupermarket,
} from "../controllers/supermarket.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.patch("/supermarket/isActive/:id", toggleIsActiveSupermarket);
router.get("/supermarkets/categories", getSupermarketsByCategory);
router.get("/supermarkets", getSupermarkets);
router.get("/supermarkets/:id", getSupermarketsByUserId);
router.post("/supermarkets", upload.array("images"), createSupermarket);
router.put("/supermarkets/:id", upload.array("images"), updatedSupermarket);
router.delete("/supermarkets/:id", deleteSupermarket);

export default router;

import { Router } from "express";
import multer from "multer";
import {
  createRestaurant,
  getRestaurants,
  updatedRestaurant,
  toggleIsActiveRestaurant,
  deleteRestaurant,
  getRestaurantsByUserId,
  getRestaurantsByCategory,
} from "../controllers/restaurant.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.patch("/restaurants/isActive/:id", toggleIsActiveRestaurant);
router.get("/restaurants/categories", getRestaurantsByCategory);
router.get("/restaurants", getRestaurants);
router.get("/restaurants/:id", getRestaurantsByUserId);
router.post("/restaurants", upload.array("images"), createRestaurant);
router.put("/restaurants/:id", upload.array("images"), updatedRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

export default router;

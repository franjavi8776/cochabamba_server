import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Asegúrate de que la carpeta 'uploads' exista
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// const upload = multer({ storage: multer.memoryStorage() });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define el directorio donde se almacenarán las imágenes
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Define el nombre del archivo usando el nombre original
    cb(null, Date.now() + path.extname(file.originalname)); // Asegúrate de que el nombre del archivo sea único
  },
});

// Crea un middleware de Multer usando esta configuración
const upload = multer({ storage: storage });

import {
  createRestaurant,
  getRestaurants,
  updatedRestaurant,
  toggleIsActiveRestaurant,
  deleteRestaurant,
  getRestaurantsByUserId,
  getRestaurantsByCategory,
} from "../controllers/restaurant.controllers";

const router = Router();
router.patch("/restaurants/isActive/:id", toggleIsActiveRestaurant);
router.get("/restaurants/categories", getRestaurantsByCategory);
router.get("/restaurants", getRestaurants);
router.get("/restaurants/:id", getRestaurantsByUserId);
router.post("/restaurants", upload.array("images"), createRestaurant);
router.put("/restaurants/:id", upload.array("images"), updatedRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

export default router;

import { Router } from "express";
import multer from "multer";
import {
  createHotel,
  deleteHotel,
  getHotels,
  getHotelsByCategory,
  getHotelsByUserId,
  toggleIsActiveHotel,
  updateHotel,
} from "../controllers/hotel.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.patch("/hotels/isActive/:id", toggleIsActiveHotel);
router.get("/hotels/categories", getHotelsByCategory);
router.get("/hotels", getHotels);
router.get("/hotels/:id", getHotelsByUserId);
router.post("/hotels", upload.array("images"), createHotel);
router.put("/hotels/:id", upload.array("images"), updateHotel);
router.delete("/hotels/:id", deleteHotel);

export default router;

import { Router } from "express";
import multer from "multer";

import {
  createMovieTheater,
  deleteMovieTheater,
  getMovieTheaterByUserId,
  getMovieTheaters,
  toggleIsActiveMovieTheater,
  updateMovieTheater,
} from "../controllers/movieTheater.controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.patch("/movieTheaters/isActive/:id", toggleIsActiveMovieTheater);
router.get("/movieTheaters", getMovieTheaters);
router.get("/movieTheaters/:id", getMovieTheaterByUserId);
router.post("/movieTheaters", upload.array("images"), createMovieTheater);
router.put("/movieTheaters/:id", upload.array("images"), updateMovieTheater);
router.delete("/movieTheaters/:id", deleteMovieTheater);

export default router;

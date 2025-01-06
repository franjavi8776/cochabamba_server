import { Router } from "express";
import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentsByEmergency,
  getCommentsByGym,
  getCommentsByHotel,
  getCommentsByMovieTheater,
  getCommentsByRestaurant,
  getCommentsBySupermarket,
  getCommentsByTaxi,
  getCommentsByTourism,
} from "../controllers/comment.controllers";

const router = Router();

router.get("/comments", getAllComments);
router.get("/comments/restaurant/:id", getCommentsByRestaurant);
router.get("/comments/taxi/:id", getCommentsByTaxi);
router.get("/comments/hotel/:id", getCommentsByHotel);
router.get("/comments/emergency/:id", getCommentsByEmergency);
router.get("/comments/gym/:id", getCommentsByGym);
router.get("/comments/movieTheater/:id", getCommentsByMovieTheater);
router.get("/comments/supermarket/:id", getCommentsBySupermarket);
router.get("/comments/tourism/:id", getCommentsByTourism);
router.post("/comments", createComment);
router.delete("/comments/:id", deleteComment);

export default router;

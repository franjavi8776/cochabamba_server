import { Router } from "express";
import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentsByRestaurant,
  getCommentsByTaxi,
} from "../controllers/comment.controllers";

const router = Router();

router.get("/comments/restaurant/:id", getCommentsByRestaurant);
router.get("/comments/taxi/:id", getCommentsByTaxi);
router.post("/comments", createComment);
router.get("/comments", getAllComments);
router.delete("/comments/:id", deleteComment);

export default router;

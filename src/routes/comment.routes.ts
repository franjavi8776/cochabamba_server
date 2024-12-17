import { Router } from "express";
import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentsByRestaurant,
} from "../controllers/comment.controllers";

const router = Router();

router.get("/comments/:id", getCommentsByRestaurant);
router.post("/comments", createComment);
router.get("/comments", getAllComments);
router.delete("/comments/:id", deleteComment);

export default router;

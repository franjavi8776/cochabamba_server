import { Request, Response } from "express";
import { Comment } from "../models/Comment";
import { User } from "../models/User";

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.findAll();
    res.status(200).json(comments);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getCommentsByRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { restaurant_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        restaurant_id: data.restaurant_id,
        isAnonymous: data.isAnonymous,
        userName:
          data.isAnonymous || !data.user
            ? "Anónimo"
            : data.user.name.split(" ")[0],
      };
    });

    res.status(200).json(formattedComments);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { comments, stars, user_id, restaurant_id } = req.body;

    const commentData = {
      comments,
      stars,
      restaurant_id,
      user_id: user_id || null,
      isAnonymous: !user_id,
    };

    const newComment = await Comment.create(commentData);
    res.status(200).json(newComment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      res.status(404).json({ message: "comentario no encontrado" });
    }
    await comment?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

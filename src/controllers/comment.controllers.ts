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

export const getCommentsByTaxi = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { taxi_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        taxi_id: data.taxi_id,
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

export const getCommentsByMovieTheater = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { movieTheater_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        movieTheater_id: data.movieTheater_id,
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

export const getCommentsBySupermarket = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { supermarket_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        supermarket_id: data.supermarket_id,
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

export const getCommentsByTourism = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { tourism_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        tourism_id: data.tourism_id,
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

export const getCommentsByGym = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { gym_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        gym_id: data.gym_id,
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

export const getCommentsByHotel = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { hotel_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        hotel_id: data.hotel_id,
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

export const getCommentsByEmergency = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { emergency_id: id },
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });

    const formattedComments = comments.map((comment) => {
      const data = comment.get({ plain: true });
      return {
        id: data.id,
        comments: data.comments,
        stars: data.stars,
        emergency_id: data.emergency_id,
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
    const {
      comments,
      stars,
      user_id,
      restaurant_id,
      taxi_id,
      movieTheater_id,
      supermarket_id,
      tourism_id,
      gym_id,
      hotel_id,
      emergency_id,
    } = req.body;

    const commentData = {
      comments,
      stars,
      restaurant_id,
      taxi_id,
      movieTheater_id,
      supermarket_id,
      tourism_id,
      gym_id,
      hotel_id,
      emergency_id,
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
      res.status(404).json({ message: "Comentario no encontrado" });
    }
    await comment?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

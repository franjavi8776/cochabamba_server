import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json({ message: "No se proporcionó un token de autenticación" });
    return;
  }

  jwt.verify(token, "tu_secreto_secreto", (err, user) => {
    if (err) {
      res.status(403).json({ message: "Token inválido" });
      return;
    }

    const authenticatedUser = user;

    console.log(authenticatedUser);

    next();
  });
};

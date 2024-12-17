import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const secretKey = crypto.randomBytes(32).toString("hex");
const generateToken = (userId: number) => {
  return jwt.sign({ userId }, secretKey, { expiresIn: "1h" });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    //console.log(email, password);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "email or password incorrect" });
      return;
    }

    const userData = user?.get();

    const isPasswordValid = await bcrypt.compare(password, userData!.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "email or password incorrect" });
      return;
    }

    const token = generateToken(Number(userData?.id));

    res.status(200).json({
      message: "Start session successfully",
      token,
      email: userData?.email,
      name: userData?.name,
      id: userData?.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const loginGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email } = req.body;
  //console.log("req.body", req.body);

  try {
    let user = await User.findOne({ where: { email } });
    const userData = user?.get();
    if (!user) {
      user = await User.create(req.body);

      const token = generateToken(Number(userData?.id));
      res.status(201).json({ ...user.toJSON(), token, email });
      return;
    }
    const token = generateToken(Number(userData?.id));
    res.status(200).json({
      message: "Starting session successfully",
      token,
      email: userData?.email,
      name,
      id: userData?.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

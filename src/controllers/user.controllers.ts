import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User";

const secretkey = crypto.randomBytes(32).toString("hex");
const securityLevel = 10;

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, secretkey, { expiresIn: "3h" });
};

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, securityLevel);
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({ where: { isAdmin: false } });
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      codArea,
      phone,
      city,
      country,
      isAdmin,
      isActive,
    } = req.body;

    const foundUser = await User.findOne({
      where: {
        email,
      },
    });

    if (foundUser) {
      res.status(409).json({ message: "Este email ya existe" });
      return;
    }

    const encryptedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: encryptedPassword,
      codArea,
      phone,
      city,
      country,
      isAdmin,
      isActive,
    });

    console.log(newUser);

    const userData = newUser.get();

    const token = generateToken(userData.id);
    res.status(200).json({ ...userData, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      codArea,
      phone,
      city,
      country,
      isAdmin,
      isActive,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    let passwordData = user.get();
    let updatedPassword1 = passwordData.password;

    if (password) {
      updatedPassword1 = await hashPassword(password);
    }

    await user.update({
      name,
      email,
      password: updatedPassword1,
      codArea,
      phone,
      city,
      country,
      isAdmin,
      isActive,
    });

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const toggleIsActiveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: "Usuarion no encontrado" });
      return;
    }

    const userActive = user.get();

    const toggleActive = await user.update({ isActive: !userActive.isActive });

    res.sendStatus(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

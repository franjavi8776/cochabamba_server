import { Router } from "express";
import {
  createUser,
  getUser,
  getUsers,
  toggleIsActiveUser,
  updateUser,
} from "../controllers/user.controllers";

const router = Router();

router.patch("/users/isActive/:id", toggleIsActiveUser);
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);

export default router;

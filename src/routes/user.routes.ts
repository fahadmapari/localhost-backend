import { Router } from "express";
import { getAllUsers, getUser } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getAllUsers);

userRouter.get("/:id", getUser);

userRouter.post("/", (req, res) => {
  res.status(200).json({ message: "CREATE USER" });
});

userRouter.put("/:id", (req, res) => {
  res.status(200).json({ message: "UPDATE USER" });
});

userRouter.delete("/:id", (req, res) => {
  res.status(200).json({ message: "DELETE USER" });
});

export default userRouter;

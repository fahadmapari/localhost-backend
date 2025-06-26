import { Router } from "express";
import { getAllUsers, getUser } from "../controllers/user.controller";
import { authorizationMiddleware } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/", authorizationMiddleware, getAllUsers);

userRouter.get("/:id", authorizationMiddleware, getUser);

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

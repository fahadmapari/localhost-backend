import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.status(200).json({ message: "GET ALL USERS" });
});

export default userRouter;

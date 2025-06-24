import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.status(200).json({ message: "GET ALL USERS" });
});

userRouter.get("/:id", (req, res) => {
  res.status(200).json({ message: "GET USER BY ID" });
});

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

import { Router } from "express";

const authRouter = Router();

authRouter.get("signup", (req, res) => {
  res.status(200).json({ message: "signup" });
});

authRouter.get("signin", (req, res) => {
  res.status(200).json({ message: "sign in" });
});

authRouter.get("logout", (req, res) => {
  res.status(200).json({ message: "logout" });
});

import { Router } from "express";
import { signup } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.get("/signin", (req, res) => {
  res.status(200).json({ message: "sign in" });
});

authRouter.get("/signout", (req, res) => {
  res.status(200).json({ message: "logout" });
});

export default authRouter;

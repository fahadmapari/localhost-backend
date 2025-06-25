import { Router } from "express";
import { signIn, signup } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.post("/signin", signIn);

authRouter.get("/signout", (req, res) => {
  res.status(200).json({ message: "logout" });
});

export default authRouter;

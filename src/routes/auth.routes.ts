import { Router } from "express";
import {
  logout,
  refreshToken,
  signIn,
  signup,
  verifyToken,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.post("/signin", signIn);

authRouter.post("/refresh", refreshToken);

authRouter.post("/verify", verifyToken);

authRouter.post("/signout", logout);

export default authRouter;

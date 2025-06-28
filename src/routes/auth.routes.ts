import { Router } from "express";
import {
  logout,
  refreshToken,
  signIn,
  signup,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.post("/signin", signIn);

authRouter.post("/refresh", refreshToken);

authRouter.post("/signout", logout);

export default authRouter;

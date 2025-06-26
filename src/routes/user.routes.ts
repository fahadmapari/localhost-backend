import { Router } from "express";
import { getAllUsers, getUser } from "../controllers/user.controller";
import { authorizationMiddleware } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/", authorizationMiddleware, getAllUsers);

userRouter.get("/:id", authorizationMiddleware, getUser);

export default userRouter;

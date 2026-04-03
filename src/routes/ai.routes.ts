import { Router } from "express";
import {
  askProductController,
  rewriteController,
} from "../controllers/ai.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const aiRouter = Router();

aiRouter.post(
  "/rewrite",
  authorizationMiddleware,
  isAdminMiddleware,
  rewriteController,
);

aiRouter.post(
  "/ask-product",
  authorizationMiddleware,
  isAdminMiddleware,
  askProductController,
);

export default aiRouter;

import { Router } from "express";
import {
  createNewConversationController,
  getAllConversationsController,
} from "../controllers/conversation.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const conversationRouter = Router();

conversationRouter.get(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  getAllConversationsController
);

conversationRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  createNewConversationController
);

export default conversationRouter;

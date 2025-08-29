import { Router } from "express";
import {
  createNewConversationController,
  getAllConversationsController,
  getAllMessagesForConversationController,
  getConversationController,
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

conversationRouter.get(
  "/:conversationId",
  authorizationMiddleware,
  isAdminMiddleware,
  getConversationController
);

conversationRouter.get(
  "/messages/:conversationId",
  authorizationMiddleware,
  isAdminMiddleware,
  getAllMessagesForConversationController
);

export default conversationRouter;

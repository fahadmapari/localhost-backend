import { Router } from "express";
import {
  createClientController,
  getClientListController,
  getClientMetricsController,
} from "../controllers/client.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const clientRouter = Router();

clientRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  createClientController
);

clientRouter.get(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  getClientListController
);

clientRouter.get(
  "/metrics",
  authorizationMiddleware,
  isAdminMiddleware,
  getClientMetricsController
);

export default clientRouter;

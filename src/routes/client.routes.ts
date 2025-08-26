import { Router } from "express";
import {
  createClientController,
  getAllClientsController,
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
  "/all",
  authorizationMiddleware,
  isAdminMiddleware,
  getAllClientsController
);

clientRouter.get(
  "/metrics",
  authorizationMiddleware,
  isAdminMiddleware,
  getClientMetricsController
);

export default clientRouter;

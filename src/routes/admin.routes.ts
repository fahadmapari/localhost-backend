import { Router } from "express";
import {
  changeAdminPasswordController,
  createNewAdminController,
  getAllAdmins,
} from "../controllers/admin.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const adminRouter = Router();

adminRouter.get("/", authorizationMiddleware, isAdminMiddleware, getAllAdmins);

adminRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  createNewAdminController
);

adminRouter.put(
  "/change-password",
  authorizationMiddleware,
  isAdminMiddleware,
  changeAdminPasswordController
);

export default adminRouter;

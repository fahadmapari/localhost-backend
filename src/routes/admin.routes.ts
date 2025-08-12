import { Router } from "express";
import {
  changeAdminPasswordController,
  createNewAdminController,
  getAllAdmins,
} from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get("/", getAllAdmins);

adminRouter.post("/", createNewAdminController);

adminRouter.put("/change-password", changeAdminPasswordController);

export default adminRouter;

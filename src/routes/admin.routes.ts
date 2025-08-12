import { Router } from "express";
import {
  createNewAdminController,
  getAllAdmins,
} from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get("/", getAllAdmins);

adminRouter.post("/", createNewAdminController);

export default adminRouter;

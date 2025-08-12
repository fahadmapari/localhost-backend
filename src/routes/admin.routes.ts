import { Router } from "express";
import { getAllAdmins } from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get("/", getAllAdmins);

export default adminRouter;

import { Router } from "express";
import {
  createClientController,
  getClientListController,
} from "../controllers/client.controller";

const clientRouter = Router();

clientRouter.post("/", createClientController);

clientRouter.get("/", getClientListController);

export default clientRouter;

import { Router } from "express";
import { createClientController } from "../controllers/client.controller";

const clientRouter = Router();

clientRouter.post("/", createClientController);

export default clientRouter;

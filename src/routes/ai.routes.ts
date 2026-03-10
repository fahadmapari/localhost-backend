import { Router } from "express";
import { rewriteController } from "../controllers/ai.controller";

const aiRouter = Router();

aiRouter.post("/rewrite", rewriteController);

export default aiRouter;

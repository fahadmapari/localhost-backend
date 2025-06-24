import { Router } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
  res.status(200).json({ message: "GET ALL SUBSCRIPTIONS" });
});

export default subscriptionRouter;

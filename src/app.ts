import express from "express";
import { PORT } from "./config/env";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import subscriptionRouter from "./routes/subscription.routes";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/subscriptions", subscriptionRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import { PORT } from "./config/env";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import subscriptionRouter from "./routes/subscription.routes";
import { connectDB } from "./db/mongoDB";
import globalErrorMiddleware from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";
import { arcjetMiddleware } from "./middlewares/arcjet.middleware";
import morgan from "morgan";
import compression from "compression";

import cors from "cors";
import productRouter from "./routes/product.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:3000", // frontend port
    credentials: true, // if using cookies
  })
);

app.use(arcjetMiddleware);

app.use(compression());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(globalErrorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});

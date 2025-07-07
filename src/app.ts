import express from "express";
import { PORT } from "./config/env.ts";
import userRouter from "./routes/user.routes.ts";
import authRouter from "./routes/auth.routes.ts";
import subscriptionRouter from "./routes/subscription.routes.ts";
import { connectDB } from "./db/mongoDB.ts";
import globalErrorMiddleware from "./middlewares/error.middleware.ts";
import cookieParser from "cookie-parser";
import { arcjetMiddleware } from "./middlewares/arcjet.middleware.ts";
import morgan from "morgan";
import compression from "compression";

import cors from "cors";
import productRouter from "./routes/product.routes.ts";
import { admin, adminRouter } from "./config/admin.ts";

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

app.use(admin.options.rootPath, adminRouter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(globalErrorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});

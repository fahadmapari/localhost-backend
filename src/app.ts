import express from "express";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import { connectDB } from "./db/mongoDB.js";
import globalErrorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { arcjetMiddleware } from "./middlewares/arcjet.middleware.js";
import morgan from "morgan";
import session from "express-session";

import cors from "cors";
import { adminRouter, admin } from "./config/admin.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "a-very-secret-and-long-password-for-sessio",
  })
);

app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5500"], // frontend port
    credentials: true, // if using cookies
  })
);

app.use(arcjetMiddleware);

app.use(admin.options.rootPath, adminRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(globalErrorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});

import express from "express";
import { PORT } from "./config/env";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import { connectDB } from "./db/mongoDB";
import globalErrorMiddleware from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";
import { arcjetMiddleware } from "./middlewares/arcjet.middleware";
import morgan from "morgan";
import compression from "compression";

import cors from "cors";
import productRouter from "./routes/product.routes";
import clientRouter from "./routes/client.routes";
import adminRouter from "./routes/admin.routes";
import conversationRouter from "./routes/conversation.routes";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { initializeSockets, periodicRoomCleanup } from "./config/sockets";
import redisClient from "./config/redis";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = redisClient;
const subClient = redisClient;
const app = express();
const serverForSocket = createServer(app);
const io = new Server(serverForSocket, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhostapp.in",
      "https://localhostapp.in",
      "http://admin.localhostapp.in",
      "https://admin.localhostapp.in",
    ],
    credentials: true,
  },
});

app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhostapp.in",
      "https://localhostapp.in",
      "http://admin.localhostapp.in",
      "https://admin.localhostapp.in",
    ], // frontend port
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
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/conversations", conversationRouter);

app.use(globalErrorMiddleware);

io.adapter(createAdapter(pubClient, subClient));

initializeSockets(io);

setInterval(
  () => periodicRoomCleanup(io),
  // 30 minutes
  30 * 60 * 1000
);

connectDB().then(() => {
  serverForSocket.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import searchRoutes from "./routes/search.route.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

const allowedOrigins = [
  // "http://localhost:5173",
  "socially-xi-wheat.vercel.app",
];

console.log("✅ Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/search", searchRoutes);
app.use("/api/messages", messageRoutes);

export default app;

// app.js or index.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { verifyClerkWebhook } from "./middleware/verifyClerkWebhook.js"; 
import { handleClerkWebhook } from "./controllers/user.controller.js"; 


dotenv.config();

import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import searchRoutes from "./routes/search.route.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

const Base_URL = true;
const allowedOrigins = Base_URL
  ? "https://socially-xi-wheat.vercel.app"
  : "http://localhost:5173";

console.log("✅ Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ⚠️ Important: Clerk requires raw body for signature verification
app.post("/api/webhook/clerk",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    console.log("Raw body length:", req.body.length); // should be a Buffer
    next();
  },
  verifyClerkWebhook,
  handleClerkWebhook
);


// After webhook, parse JSON for rest of routes
app.use(express.json());
app.use(cookieParser());

// Your app routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/search", searchRoutes);
app.use("/api/messages", messageRoutes);

export default app;

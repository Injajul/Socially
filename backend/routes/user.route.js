// routes/userRoutes.js
import express from "express";
import multer from "multer";
import {
  getAllUsers,
  toggleFollow,
  getCurrentUser,
  handleClerkWebhook,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/clerkAuth.js";
import { verifyClerkWebhook } from "../middleware/verifyClerkWebhook.js";
import storage from "../config/multerStorage.js";

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

router.get("/all", getAllUsers);

// Clerk Webhook route (raw body required for signature verification)
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  verifyClerkWebhook,
  handleClerkWebhook
);
// Authenticated route
router.get("/me", requireAuth, getCurrentUser);

router.put("/:userId/follow", requireAuth, toggleFollow);

export default router;

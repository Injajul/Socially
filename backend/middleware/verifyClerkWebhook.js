import { Webhook } from "svix";
import dotenv from "dotenv";
dotenv.config();

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; 

export const verifyClerkWebhook = async (req, res, next) => {
  const payload = JSON.stringify(req.body);
  const headers = req.headers;

  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    req.event = wh.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });
     console.log("✅ Clerk webhook verified:", req.event.type);
    next();
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).json({ message: "Invalid webhook signature" });
  }
};

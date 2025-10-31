import { Webhook } from "svix";
import dotenv from "dotenv";
dotenv.config();

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
console.log("Webhook secret prefix:", WEBHOOK_SECRET?.slice(0, 8));
if (!WEBHOOK_SECRET) {
  console.error("❌ Missing CLERK_WEBHOOK_SECRET in environment variables");
}

export const verifyClerkWebhook = async (req, res, next) => {
  try {
    // ✅ Use raw body directly, no stringify
    const payload = req.body;
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    console.log("Headers:", headers);
    console.log("Raw body length:", payload.length);

    const wh = new Webhook(WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers);

    console.log("✅ Clerk webhook verified:", evt.type);

    req.event = evt;
    next();
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).json({ message: "Invalid webhook signature" });
  }
};

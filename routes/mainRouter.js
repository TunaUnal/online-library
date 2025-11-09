import { Router } from "express";
import { dashboard, markAsRead } from "../controller/mainController.js";
import { authenticate } from "../middleware/auth.js";
import { checkOwnership } from "../middleware/ownership.js";
const router = Router();
router.get("/", authenticate, dashboard);
//!Bildirimi okundu olarak işaretleme
router.post(
  "/read",
  authenticate,
  checkOwnership("notification", "id"),
  markAsRead
);

export default router;

import express from "express";
import subjectController from "../controllers/subjectController.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// List subjects (public; supports optional auth and teacher-only filter)
router.get("/", optionalAuth, subjectController.getSubjects);

// Create subject (teachers only)
router.post(
  "/",
  protect,
  authorize("teacher"),
  subjectController.createSubject,
);

// Get single subject
router.get("/:id", subjectController.getSubject);

export default router;

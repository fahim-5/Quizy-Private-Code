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
router.get("/:id", optionalAuth, subjectController.getSubject);

// Enroll in subject (students)
router.post("/:id/enroll", protect, subjectController.enrollSubject);

export default router;

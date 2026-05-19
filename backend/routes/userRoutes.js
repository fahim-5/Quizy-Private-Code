import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  changePassword,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All routes protected

// current user profile
router.get("/me", getMe);

// Change password
router.put("/:id/password", changePassword);

router.get("/", authorize("admin"), getUsers);
router.get("/:id", authorize("admin"), getUser);
router.put("/:id", updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;

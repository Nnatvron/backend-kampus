import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword
} from "../controllers/authControllers.js";

const router = express.Router();

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// Send Reset Email
router.post("/forgot-password", forgotPassword);

// Reset User Password (frontend calls this with token)
router.post("/reset-password/:token", resetPassword);

export default router;

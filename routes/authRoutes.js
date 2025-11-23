import express from "express";
import { register, login, forgotPassword } from "../controllers/authControllers.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// Reset password via Firebase email link (no backend route needed)

export default router;

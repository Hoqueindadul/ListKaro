import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/verifyToken.js';
import { signup, login, logout, varifyEmail, forgotPassword, resetPassword, checkAuth } from '../controlers/user.controlers.js';

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", varifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
import express from "express";
const router = express.Router();
import { verifyToken } from "../middleware/verifyToken.js";
import { checkEmailVerification } from "../middleware/checkIsEmailVerified.js";
import {
  signup,
  login,
  logout,
  userProfile,
  varifyEmail,
  softDeleteUser,
  forgotPassword,
  resetPassword,
  checkAuth,
  changePassword,
} from "../controlers/user.controlers.js";

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", checkEmailVerification, login);
router.post("/logout", logout);
router.get("/user-profile", verifyToken, userProfile);
router.post("/change-password", verifyToken, changePassword);

router.post("/verify-email", varifyEmail);
router.delete("/delete-user", verifyToken, softDeleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;

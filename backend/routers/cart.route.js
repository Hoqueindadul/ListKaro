import express from "express";
import { getUserCart, removeItemFromCart } from "../controlers/cart.controler.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get cart items for the logged-in user
router.get("/user-cart", authenticate, getUserCart);
router.delete("/user-cart/:productId", authenticate, removeItemFromCart);

export default router;

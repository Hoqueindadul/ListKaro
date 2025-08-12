import express from "express";
import { getUserCart, removeItemFromCart, addToCart } from "../controlers/cart.controler.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get cart items for the logged-in user
router.post("/add-to-cart", verifyToken, addToCart);
router.get("/user-cart", verifyToken, getUserCart);
router.delete("/user-cart/:productId", verifyToken, removeItemFromCart);

export default router;

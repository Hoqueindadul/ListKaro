import express from "express";
import { getUserCart } from "../controlers/cart.controler.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get cart items for the logged-in user
router.get("/user-cart", verifyToken, getUserCart);

export default router;

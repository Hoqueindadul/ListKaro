import express from "express";
import {
  placeOrder,
  getAllOrders,
  getOrderById,
  cancleOrder,
} from "../controlers/orders.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Single unified order endpoint — handles COD + Online, single product + cart
router.post("/order", verifyToken, placeOrder);

// Cancel order
router.put("/cancel-order/:orderId", verifyToken, cancleOrder);

// Fetch a logged in user's orders
router.get("/get-all-orders", verifyToken, getAllOrders);

// Fetch a single order by ID
router.get("/get-order-by-id/:orderId", verifyToken, getOrderById);
export default router;

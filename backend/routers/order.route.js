import express from "express";
import { customerOrder, getAllOrders } from "../controlers/orders.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/order", verifyToken, customerOrder)
router.get("/get-all-orders", verifyToken, getAllOrders)

export default router;

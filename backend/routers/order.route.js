import express from "express";
import { 
    singleProductOrder, 
    customerOrder, 
    getAllOrders,
    onlinePayment 
} from "../controlers/orders.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/single-product-order", verifyToken, singleProductOrder);
router.post("/order", verifyToken, customerOrder)
router.get("/get-all-orders", verifyToken, getAllOrders)
router.post("/online-payment", onlinePayment);

export default router;
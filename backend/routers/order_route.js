import express from "express";
import Order from "../models/order_model.js";

const order_Route = express.Router();

order_Route.post("/", async (req, res) => {
  try {
    const { customerDetails, cartItems, totalAmount, paymentMode } = req.body;  // paymentMode
    if (!customerDetails || !cartItems || !totalAmount || !paymentMode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({ customerDetails, cartItems, totalAmount, paymentMode });  // paymentMode
    const savedOrder = await newOrder.save();

    res.status(201).json({ message: "Order placed", order: savedOrder });
  } catch (error) {
    console.error("Order save error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});


export default order_Route;

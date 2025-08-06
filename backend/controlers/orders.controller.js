import express from "express";
import Order from "../models/order_model.js";


export const customerOrder = async (req, res) => {
  try {
    const { customerDetails, cartItems, totalAmount, paymentMode } = req.body;

    if (!customerDetails || !cartItems || !totalAmount || !paymentMode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Basic validation (optional but helpful)
    if (!/^\d{6}$/.test(customerDetails.zip)) {
      return res.status(400).json({ message: "Invalid ZIP code" });
    }

    if (!/^\d{10}$/.test(customerDetails.phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items cannot be empty" });
    }

    const newOrder = new Order({
      customerDetails,
      cartItems,
      totalAmount,
      paymentMode,
      paymentStatus: "pending",
      status: "pending"
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "Order placed", order: savedOrder });
  } catch (error) {
    console.error("Order save error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to place order" });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const totalOrders = orders.length;
    res.status(200).json({ message: "All orders fetch successfully.", totalOrders: totalOrders, orders})
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Faild to fetch all orders."})
  }
}

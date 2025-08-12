import express from "express";
import Order from "../models/order_model.js";
import Product from "../models/products.model.js";


export const singleProductOrder = async (req, res) => {
  try {
    const { customerDetails, paymentMode, product, quantity, totalAmount } = req.body;

    console.log("body quantity:", quantity);
    // Validate required fields
    if (!customerDetails || !product || !quantity || !totalAmount || !paymentMode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the product
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // available quantity check
    if (existingProduct.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    console.log("Product found:", existingProduct);
    console.log("Quantity requested:", quantity);
    // Reduce stock
    existingProduct.quantity -= quantity;
    await existingProduct.save();

    // Create new order with customerDetails and dynamic paymentMode
    const newOrder = new Order({
      customerDetails,
      cartItems: [{ product, quantity }],
      totalAmount,
      paymentMode,
      paymentStatus: "pending",
      status: "pending"
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    console.error("Order save error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

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

    // Check and update stock for each cart item
    for (const item of cartItems) {
      const existingProduct = await Product.findById(item.product);
      if (!existingProduct) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (existingProduct.quantity.value < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${existingProduct.name}` });
      }

      existingProduct.quantity.value -= item.quantity; // update value, not whole object
      await existingProduct.save();
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
    res.status(200).json({ message: "All orders fetch successfully.", totalOrders: totalOrders, orders })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Faild to fetch all orders." })
  }
}

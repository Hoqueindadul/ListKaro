import Order from "../models/order_model.js";
import Product from "../models/products.model.js";

/**
 * POST /order
 *
 * Single unified endpoint for ALL order types:
 *  - Single product (Buy Now) — sent as a 1-item cartItems array
 *  - Cart order               — sent as a multi-item cartItems array
 *  - COD                      — paymentMode: "cashOnDelivery"
 *  - Online (Razorpay)        — paymentMode: "online" + razorpay IDs
 *
 * Expected body:
 * {
 *   customerDetails: { name, address, zip, email, phone },
 *   cartItems: [{ _id: <productId>, quantity: <number> }, ...],
 *   totalAmount: <number>,
 *   paymentMode: "cashOnDelivery" | "online",
 *   razorpayOrderId?:   string,   // only for online
 *   razorpayPaymentId?: string,   // only for online
 *   razorpaySignature?: string,   // only for online
 * }
 */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorize! Please log in." });
    }
    const {
      customerDetails,
      cartItems,
      totalAmount,
      paymentMode,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // ── 1. Basic validation ────────────────────────────────────────────────
    if (
      !customerDetails ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0 ||
      totalAmount === undefined ||
      !paymentMode
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!/^\d{6}$/.test(String(customerDetails.zip))) {
      return res
        .status(400)
        .json({ message: "Invalid ZIP code (must be 6 digits)." });
    }
    if (!/^\d{10}$/.test(String(customerDetails.phone))) {
      return res
        .status(400)
        .json({ message: "Invalid phone number (must be 10 digits)." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    // ── 2. Validate online payment fields ─────────────────────────────────
    if (paymentMode === "online" && (!razorpayOrderId || !razorpayPaymentId)) {
      return res
        .status(400)
        .json({ message: "Missing Razorpay payment details." });
    }

    // ── 3. Process each cart item: check stock, build snapshot, accumulate total ──
    let calculatedTotal = 0;
    const orderItemsArray = [];

    for (const item of cartItems) {
      const productId = item._id || item.productId || item.product;
      const quantity = Number(item.quantity);

      if (
        !productId ||
        quantity === undefined ||
        quantity === null ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message: `Invalid item: product ID or quantity is missing/zero. Item: ${JSON.stringify(item)}`,
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${productId}` });
      }

      if (product.quantity.value < quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for: ${product.name}` });
      }

      // Accumulate server-side verified total
      calculatedTotal += product.price * quantity;

      // Build product snapshot for order record
      orderItemsArray.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.quantity.value,
        quantity,
        description: product.description,
        source: product.source,
      });

      // Deduct stock
      product.quantity.value -= quantity;
      await product.save();
    }

    // ── 4. Price validation ───────────────────────────────────────────────
    // Use rounding to avoid floating-point precision issues (e.g. 99.99 vs 100.00)
    if (
      Math.round(Number(totalAmount) * 100) !==
      Math.round(calculatedTotal * 100)
    ) {
      return res.status(400).json({
        message: `Price mismatch. Expected ₹${calculatedTotal.toFixed(2)}, received ₹${Number(totalAmount).toFixed(2)}.`,
      });
    }

    // ── 5. Save order ─────────────────────────────────────────────────────
    const newOrder = new Order({
      userId,
      customerDetails,
      orderItems: orderItemsArray,
      totalAmount: calculatedTotal,
      paymentMode,
      paymentStatus: paymentMode === "online" ? "paid" : "pending",
      status: paymentMode === "online" ? "confirmed" : "pending",
      paymentDetails:
        paymentMode === "online"
          ? { razorpayOrderId, razorpayPaymentId, razorpaySignature }
          : {
              razorpayOrderId: null,
              razorpayPaymentId: null,
              razorpaySignature: null,
            },
    });

    const savedOrder = await newOrder.save();

    res
      .status(201)
      .json({ message: "Order placed successfully.", order: savedOrder });
  } catch (error) {
    console.error("Order placement error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to place order." });
  }
};

// ── Get all orders (admin) ─────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    console.log(req.userId);
    // 1. Get the logged-in user's ID from your verifyToken middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    // 2. Filter orders so a customer only sees their own purchases
    // (Make sure your Order schema uses 'userId' or customerDetails checks)
    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your orders fetched successfully.",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = req.params.orderId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const order = await Order.findOne({ _id: orderId, userId: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({
      message: "Order fetched successfully.",
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Failed to fetch order." });
  }
};

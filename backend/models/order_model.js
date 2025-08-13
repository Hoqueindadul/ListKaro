import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    address: String,
    zip: Number,
    email: String,
    phone: String,
  },
  cartItems: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      image: [
        {
          public_id: String,
          url: String,
          _id: String,
        },
      ],
      category: String,
      stock: Number,
      quantity: Number,
      description: String,
      source: String,
    },
  ],
  totalAmount: Number,
  paymentMode: {
    type: String,
    required: true,
    enum: ["cashOnDelivery", "online"],
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentDetails: {
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "outForDelivery", "delivered", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;


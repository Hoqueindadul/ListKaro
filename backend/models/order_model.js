import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      zip: { type: Number, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    orderItems: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        category: String,
        source: String,
        image: [
          {
            public_id: String,
            url: { type: String, required: true },
          },
          { _id: false }, // Clean up response by removing nested image IDs
        ],
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ["cashOnDelivery", "online"], // Matches your checkout values
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDetails: {
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
      razorpaySignature: { type: String, default: null },
    },
    shipmentStatus: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "outForDelivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

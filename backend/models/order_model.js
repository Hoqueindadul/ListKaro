import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    address: String,
    zip: Number,
    email: String,
    phone: Number,
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
  paymentMode: { type: String, required: true, enum: ["cashOnDelivery", "online"] },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;

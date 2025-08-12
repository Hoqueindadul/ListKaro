import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { LOCAL_URL, DEPLOYMENT_URL } from "../../deploy-backend-url";
import "./OrderPage.css";

const OrderPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Detect if it's a cart order or a single product order
  let cartItems = state?.cartItems || [];
  let totalAmount = state?.totalAmount || 0;

  // If it's a single product order, convert to cartItems array
  if (state?.product && state?.quantity) {
    cartItems = [
      {
        _id: state.product._id,
        name: state.product.name,
        price: state.product.price,
        quantity: state.quantity,
      },
    ];
    totalAmount = state.product.price * state.quantity;
  }

  const [paymentMode, setPaymentMode] = useState("cashOnDelivery");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    zip: "",
    email: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    // Format cartItems as expected by backend
    const formattedCartItems = cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const orderData = {
      customerDetails: formData,
      cartItems: formattedCartItems,
      totalAmount,
      paymentMode,
    };

    if (paymentMode === "cashOnDelivery") {
      try {
        const response = await axios.post(`${DEPLOYMENT_URL}/api/order`, orderData, {
          withCredentials: true,
        });
        console.log(response.data.order)
        if (response.status === 201) {
          alert("Order placed successfully!");
          localStorage.removeItem("emailSent");
          navigate("/orderplaced", {
            state: { customerDetails: formData, cartItems, totalAmount },
          });
        } else {
          alert("Error placing order: " + response.data.message);
        }
      } catch (err) {
        console.error("Error placing order:", err.response?.data || err.message);
        alert("Something went wrong: " + (err.response?.data?.message || err.message));
      } finally {
        setSubmitting(false);
      }
    } else {
      // Online payment flow
      localStorage.setItem("orderData", JSON.stringify(orderData));
      localStorage.removeItem("emailSent");

      setSubmitting(false);
      navigate("/completepayment", {
        state: { customerDetails: formData, cartItems, totalAmount },
      });
    }
  };

  return (
    <div className="orderbody">
      <div className="order-page">
        <div className="delivery-form">
          <h2>Delivery Details</h2>
          <form onSubmit={handleSubmit}>
            <label>Customer's name:</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Receiver's Name"
              required
              onChange={handleChange}
              value={formData.name}
            />

            <label>Delivery Address:</label>
            <div className="deladdress">
              <input
                type="text"
                name="address"
                placeholder="Address"
                required
                onChange={handleChange}
                value={formData.address}
              />
              <input
                type="text"
                name="zip"
                placeholder="Pin Code"
                required
                onChange={handleChange}
                value={formData.zip}
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              onChange={handleChange}
              value={formData.email}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              onChange={handleChange}
              value={formData.phone}
            />

            <label>Payment Method</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="cashOnDelivery">Cash on Delivery</option>
              <option value="online">Online Payment</option>
            </select>

            <button
              type="submit"
              id="ordersubmit"
              disabled={submitting}
              style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <ul>
            {cartItems.map((item) => (
              <li key={item._id}>
                {item.name} — {item.quantity} × ₹{item.price}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total: ₹{totalAmount}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { LOCAL_URL, DEPLOYMENT_URL } from "../../deploy-backend-url";
import "./OrderPage.css";
import toast from 'react-hot-toast'
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

        // Format cartItems for backend
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

        // Detect if single product order or cart order
        const isSingleProductOrder = !!state?.product;

        if (paymentMode === "cashOnDelivery") {
            try {
                const token = localStorage.getItem("token");

                // Choose API endpoint accordingly
                const endpoint = isSingleProductOrder
                    ? `${DEPLOYMENT_URL}/api/single-product-order`
                    : `${DEPLOYMENT_URL}/api/order`;

                // For single product orders, backend expects product & quantity separately
                if (isSingleProductOrder) {
                    orderData.product = state.product._id;
                    orderData.quantity = state.quantity;
                    delete orderData.cartItems; // remove cartItems for single product API
                }

                const response = await axios.post(endpoint, orderData, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 201) {
                    toast.success("Order placed successfully!");
                    localStorage.removeItem("emailSent");
                    navigate("/orderplaced", {
                        state: { customerDetails: formData, cartItems, totalAmount },
                    });
                } else {
                    toast.error("Error placing order: " + response.data.message);
                }
            } catch (err) {
                console.error("Error placing order:", err.response?.data || err.message);
                toast.error("Something went wrong: " + (err.response?.data?.message || err.message));
            } finally {
                setSubmitting(false);
            }
        } else {
            // Online payment flow
            try {
                const token = localStorage.getItem("token");

                const paymentResponse = await axios.post(
                    `${DEPLOYMENT_URL}/api/payment`,
                    { price: totalAmount },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const razorpayOrder = paymentResponse.data; // contains id, amount, etc.

                // Prepare order data for next page - pass product or cartItems based on order type
                let orderWithPayment = {
                    ...orderData,
                    razorpayOrderId: razorpayOrder.id,
                };

                if (isSingleProductOrder) {
                    orderWithPayment.product = state.product._id;
                    orderWithPayment.quantity = state.quantity;
                    delete orderWithPayment.cartItems;
                }

                // Store order temporarily or pass in state
                localStorage.setItem("orderData", JSON.stringify(orderWithPayment));
                localStorage.removeItem("emailSent");

                setSubmitting(false);
                navigate("/completepayment", {
                    state: {
                        customerDetails: formData,
                        cartItems, // for cart orders
                        totalAmount,
                        razorpayOrder,
                        product: isSingleProductOrder ? state.product : null,
                        quantity: isSingleProductOrder ? state.quantity : null,
                        paymentMode,
                    },
                });

            } catch (error) {
                setSubmitting(false);
                toast.error("Failed to create payment order: " + (error.response?.data?.error || error.message));
            }
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

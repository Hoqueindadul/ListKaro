import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './OrderPage.css';

const OrderPage = () => {
    const { state } = useLocation();
    const { cartItems, totalAmount } = state || {};
    const [paymentMode, setPaymentMode] = useState("cashOnDelivery");
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        zip: "",
        email: "",
        phone: "",
    });

    const navigate = useNavigate(); // Initialize navigate function for redirection

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (paymentMode === "cashOnDelivery") {
            const orderData = {
                customerDetails: formData,
                cartItems,
                totalAmount,
                paymentMode,
            };

            try {
                const response = await fetch("http://localhost:5000/api/order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                });

                const result = await response.json();
                if (response.ok) {
                    alert("Order placed successfully!");
                    localStorage.removeItem("emailSent");
                    navigate("/orderplaced", {
                        state: {
                            customerDetails: formData,
                            cartItems,
                            totalAmount,
                        }
                    });
                } else {
                    alert("Error placing order: " + result.message);
                }
            } catch (err) {
                console.error("Error:", err);
                alert("Something went wrong!");
            }
        } else {
            localStorage.removeItem("emailSent");
            navigate("/completepayment", {
                state: {
                    customerDetails: formData,
                    cartItems,
                    totalAmount,
                }
            });
        }
    };

    return (
        <div className="orderbody">
            <div className="order-page">
                <div className="delivery-form">
                    <h2>Delivery Details</h2>

                    <form onSubmit={handleSubmit}>

                        <label htmlFor="name">Customer's name : </label>
                        <input type="text" name="name" placeholder="Enter Receiver's Name" required onChange={handleChange} />

                        <label htmlFor="addresstotal">Delivery Address : </label>
                        <div className="deladdress" id="addresstotal">
                            <input type="text" name="address" placeholder="Address" id="addressfeild" required onChange={handleChange} />
                            <input type="text" name="zip" placeholder="Pin Code" required onChange={handleChange} />
                        </div>

                        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />

                        <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleChange} />

                        <label>Payment Method</label>
                        <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                            <option value="cashOnDelivery">Cash on Delivery</option>
                            <option value="online">Online Payment</option>
                        </select>
                        <button type="submit" id="ordersubmit">Place Order</button>
                    </form>
                </div>

                <div className="order-summary">
                    <h3>Order Summary</h3>
                    <ul>
                        {cartItems?.map((item) => (
                            <li key={item._id || item.product._id}>{item.name}</li>
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

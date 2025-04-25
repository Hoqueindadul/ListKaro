import React, { useState, useEffect } from 'react';
import '../pages/ShoppingCart.css';
import axios from 'axios';
import "./Navbar"
import Navbar from './Navbar';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log(cartItems);


    useEffect(() => {
        // Fetch cart items from the API
        const fetchCartItems = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/cart/user-cart", {
                    withCredentials: true, // Make sure cookies are sent with the request
                });
                setCartItems(response.data.data); // Set the cart items
                setLoading(false); // Stop loading once data is fetched
            } catch (err) {
                setError("Failed to load cart items.");
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);
    const updateQuantity = (productId, newQuantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const removeItem = async (productId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/cart/user-cart/${productId}`, {
                withCredentials: true,
            });
            console.log(response);

            setCartItems((prev) => prev.filter((item) => item._id !== productId));
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const originalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const savings = cartItems.length > 0 ? 299 : 0;
    const storePickup = cartItems.length > 0 ? 99 : 0;
    const tax = cartItems.length > 0 ? 799 : 0;
    const total = originalPrice - savings + storePickup + tax;



    return (
        <>
        
        <div className="cart-page">
            
            {/* Left Section - Cart Items */}
            <div className="cart-items">
                <h2 className="cart-items-heading">Your Cart</h2>
                <div className="cart-table">
                    <div className="cart-table-header">
                        <div className="header-product">Product</div>
                        <div className="header-quantity">Quantity</div>
                        <div className="header-total-item item-total-heading">Item Total</div>
                        <div className="header-action item-total-heading">Actions</div>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : cartItems.length === 0 ? (
                        <p className='text-black'>Your cart is empty.</p>
                    ) : (
                        cartItems.map((item) => (
                            <div className="cart-item" key={item._id}>
                                <div className="item-info">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="item-image"
                                    />
                                    <div className="item-details">
                                        <h3 className="item-name">{item.name}</h3>
                                        <p className="item-price">
                                            <strong>Price:</strong> ₹{item.price}
                                        </p>
                                        <p className="item-quantity">
                                            <strong>Quantity:</strong> {item.quantity}
                                        </p>
                                    </div>
                                </div>

                                <div className="quantity-control">
                                    <button
                                        className="quantity-button decrease-btn"
                                        onClick={() =>
                                            item.quantity > 1 &&
                                            updateQuantity(item._id, item.quantity - 1)
                                        }
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        className="quantity-input"
                                        readOnly
                                    />
                                    <button
                                        className="quantity-button increase-btn"
                                        onClick={() =>
                                            updateQuantity(item._id, item.quantity + 1)
                                        }
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="item-total">
                                    <span className="item-total-price">
                                        ₹{item.price * item.quantity}
                                    </span>
                                </div>

                                <div className="item-actions">
                                    <button
                                        className="remove-item-btn"
                                        onClick={() => removeItem(item._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Section - Price Summary */}
            <div className="price-summary">
                <h3 className="price-summary-heading">Price summary</h3>

                <div className="summary-item">
                    <p className="summary-label">Subtotal:</p>
                    <p className="summary-value">₹{originalPrice}</p>
                </div>

                <div className="summary-item">
                    <p className="summary-label">Savings:</p>
                    <p className="summary-value">-₹{savings}</p>
                </div>

                <div className="summary-item">
                    <p className="summary-label">Shipping Charges:</p>
                    <p className="summary-value">₹{storePickup}</p>
                </div>

                <div className="summary-item">
                    <p className="summary-label">Tax:</p>
                    <p className="summary-value">₹{tax}</p>
                </div>

                <div className="summary-total">
                    <p className="total-label">Total:</p>
                    <p className="total-value">₹{total}</p>
                </div>

                <button className="checkout-btn" disabled={cartItems.length === 0}>
                    Proceed to Checkout
                </button>
            </div>


        </div>
        </>
    );
};

export default ShoppingCart;

import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../pages/ShoppingCart.css';
import { useCartStore, useAuthStore } from "../store/authStore";

const ShoppingCart = () => {
    const {
        cartItems,
        fetchCartItems,
        updateQuantity,
        removeItem,
        loading,
        error,
    } = useCartStore();
    const { isAuthenticated } = useAuthStore()
    console.log(isAuthenticated);

    const navigate = useNavigate()
    const location = useLocation();
    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleIncreaseQuantity = (productId, currentQuantity) => {
        updateQuantity(productId, currentQuantity + 1);
    };

    const handleDecreaseQuantity = (productId, currentQuantity) => {
        if (currentQuantity > 1) {
            updateQuantity(productId, currentQuantity - 1);
        }
    };

    const handleRemoveItem = (productId) => {
        removeItem(productId);
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: location } }); 
        } else {
            navigate("/order", {
                state: {
                    cartItems,
                    totalAmount: total,
                },
            });
        }
    };
    const originalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const savings = cartItems.length > 0 ? 299 : 0;
    const storePickup = cartItems.length > 0 ? 99 : 0;
    const tax = cartItems.length > 0 ? 799 : 0;
    const total = originalPrice - savings + storePickup + tax;

    return (
        <div className="cart-page ">
            <div className="cart-items ">
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
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : cartItems.length === 0 ? (
                        <p className="text-black">Your cart is empty.</p>
                    ) : (
                        cartItems.map((item) => {
                            const numericQuantity = item.quantity;

                            return (
                                <div className="cart-item" key={item._id}>
                                    <div className="item-info">
                                        <img
                                            src={item.image[0]?.url || ""}
                                            alt={item.name}
                                            className="item-image"
                                        />
                                        <div className="item-details">
                                            <h3 className="item-name">{item.name}</h3>
                                            <p className="item-price">
                                                <strong>Price:</strong> ₹{item.price}
                                            </p>
                                            <p className="item-quantity">
                                                <strong>Quantity:</strong> {numericQuantity}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="quantity-control">
                                        <button
                                            className="quantity-button decrease-btn"
                                            onClick={() => handleDecreaseQuantity(item._id, numericQuantity)}
                                            disabled={numericQuantity <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={numericQuantity}
                                            className="quantity-input"
                                            readOnly
                                        />
                                        <button
                                            className="quantity-button increase-btn"
                                            onClick={() => handleIncreaseQuantity(item._id, numericQuantity)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="item-total">
                                        <span className="item-total-price">
                                            ₹{item.price * numericQuantity}
                                        </span>
                                    </div>

                                    <div className="item-actions">
                                        <button
                                            className="remove-item-btn"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="price-summary ">
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

                <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default ShoppingCart;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { LOCAL_URL, DEPLOYMENT_URL } from "../../deploy-backend-url";

import { useAuthStore } from "../../store/authStore";
import './ProductDetailDarkMode.css'
import toast from "react-hot-toast";

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const { isAuthenticated, token, user } = useAuthStore(); // auth info
    const navigate = useNavigate();

    // Fetch product data
    const fetchProduct = async () => {
        try {
            const res = await axios.get(`${DEPLOYMENT_URL}/api/products/singleProduct/${id}`, { withCredentials: true })
            setProduct(res.data.data);
            setLoading(false);
            console.log(res.data)
        } catch (error) {
            console.error("Error fetching product:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        setQuantity(1);
    }, [product]);

    // Add to cart
    const handleAddToCart = async () => {
        try {
            setAdding(true);
            const res = await axios.post(
                `${DEPLOYMENT_URL}/api/cart/add-to-cart`,
                { productId: product._id, quantity },
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success("Product added to cart!");
            } else {
                toast.error(res.data.message || "Failed to add product to cart");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        } finally {
            setAdding(false);
        }
    };

    // Buy product
    const handleBuyProduct = () => {
        if (!isAuthenticated) {
            toast.error("Please login!")
            navigate("/login", { state: { from: location } });
        } else {
            navigate("/order", {
                state: {
                    product,
                    quantity,
                    totalAmount: product.price * quantity,
                },
            });
        }
    };

    // Submit review - **NO CHANGE**
    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: location } });
            return;
        }
        if (!rating || !comment.trim()) {
            toast.error("Please provide both rating and comment.");
            return;
        }
        try {
            setSubmittingReview(true);
            const token = localStorage.getItem("token");
            await axios.post(
                `${DEPLOYMENT_URL}/api/products/submitReview/${product._id}`,
                { rating, comment },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Thank you for giving review 👍!");
            setRating(0);
            setComment("");
            fetchProduct(); // refresh reviews
        } catch (error) {
            console.error("Error submitting review:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg font-semibold text-gray-600">Loading product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg font-semibold text-red-500">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Product Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Left: Image */}
                <div>
                    <div className="shadow-md flex items-center justify-center rounded-lg overflow-hidden mb-4">
                        <img
                            src={product.image?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-auto max-h-[500px] object-contain"
                        />
                    </div>
                </div>

                {/* Middle: Info */}
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center bg-yellow-100 text-yellow-700 text-sm font-semibold px-2.5 py-0.5 rounded">
                            ★ {product.ratings ?? 0}
                        </span>
                        <span className="inline-flex items-center bg-gray-200 text-gray-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                            {product.reviews?.length || 0} Reviews
                        </span>
                    </div>

                    <div className="mb-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold text-sm ${product.stock > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {product.quantity?.value > 0 ? "In stock" : "Out of stock"}
                        </span>
                    </div>

                    <div className="mb-6">
                        <p className="font-semibold mb-2">Description:</p>
                        <p className="text-gray-700">{product.description}</p>
                    </div>
                    <div className="mb-4 text-gray-700">
                        <p className="font-semibold">
                            Quantity: {product.quantity.value} {product.quantity.unit}
                        </p>
                    </div>
                </div>

                {/* Right: Price & Buttons */}
                <div className="border border-gray-200 rounded-lg p-6 shadow-md flex flex-col">
                    <p className="text-gray-500 mb-2">Price</p>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-green-600">
                            ₹ {product.price?.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="px-3 py-1 border border-gray-300 rounded"
                        >
                            -
                        </button>
                        <span className="px-3">{quantity}</span>
                        <button
                            onClick={() => setQuantity((q) => Math.min(q + 1, Math.min(product.stock, 5)))}
                            className="px-3 py-1 border border-gray-300 rounded"
                        >
                            +
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Maximum purchase {Math.min(product.stock, 5)}
                    </p>
                    <button
                        onClick={handleBuyProduct}
                        disabled={product.quantity?.value === 0}
                        style={{
                            background: product.quantity?.value > 0
                                ? "linear-gradient(to right, #f8f9fa, #dee2e6)"
                                : "#adb5bd",
                            color: product.quantity?.value > 0 ? "#212529" : "white",
                            cursor: product.quantity?.value > 0 ? "pointer" : "not-allowed"
                        }}
                        className="w-100 py-3 rounded mb-3 buyNowBtn fw-semibold border-0"
                    >
                        Buy Now
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.quantity?.value === 0 || adding}
                            className={`w-1/2 border border-gray-300 py-3 addToCartBtn rounded font-semibold hover:bg-gray-100 transition ${(product.quantity?.value === 0 || adding) ? "cursor-not-allowed opacity-50" : ""
                                }`}
                        >
                            {(adding || product.quantity?.value === 0) ? "Adding..." : "Add to Cart"}
                        </button>

                        <button className="w-1/2 border border-gray-300 addWhitListBtn py-3 rounded font-semibold hover:bg-gray-100 transition">
                            Wishlist
                        </button>
                    </div>
                </div>
            </div>

            {/* Review Section */}
            <div className="border-t border-gray-300 pt-8">
                <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

                {/* Existing Reviews */}
                {product.reviews?.length > 0 ? (
                    <div className="space-y-4 mb-8">
                        {product.reviews.map((rev, idx) => (
                            <div key={idx} className="border p-4 rounded-lg shadow-sm">
                                <div className="flex items-center mb-2">
                                    {[...Array(5)].map((_, starIdx) => (
                                        <span
                                            key={starIdx}
                                            className={`text-sm ${starIdx < rev.rating ? "text-yellow-500" : "text-gray-300"
                                                }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="ml-2 text-gray-600 text-sm">by {rev.name || "Anonymous"}</span>
                                </div>
                                <p className="text-gray-700">{rev.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mb-8">No reviews yet.</p>
                )}

                {/* Add Review */}
                <div className="bg-gray-50 addReview p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-3">Write a Review</h3>
                    <div className="flex items-center gap-2 mb-3">
                        {[...Array(5)].map((_, idx) => (
                            <span
                                key={idx}
                                onClick={() => setRating(idx + 1)}
                                className={`cursor-pointer text-2xl ${idx < rating ? "text-yellow-500" : "text-gray-300"
                                    }`}
                                role="button"
                                aria-label={`Rate ${idx + 1} star`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') setRating(idx + 1);
                                }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <textarea
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review..."
                        className="w-full border reviewTextArea border-gray-300 rounded p-2 mb-3"
                    ></textarea>
                    <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="bg-black text-white px-6 py-2 rounded buyNowBtn hover:bg-gray-800"
                    >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </div>
        </div>
    );
}

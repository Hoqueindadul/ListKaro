import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { DEPLOYMENT_URL, LOCAL_URL } from "../../deploy-backend-url";

import { useAuthStore } from "../../store/authStore";
import "./ProductDetailDarkMode.css";
import toast from "react-hot-toast";
import {
  Star,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  MessageSquare,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { isAuthenticated, token: authStoreToken } = useAuthStore();
  const navigate = useNavigate();

  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `${LOCAL_URL}/api/products/singleProduct/${id}`,
        { withCredentials: true },
      );
      setProduct(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    setQuantity(1);
  }, [product]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      const res = await axios.post(
        `${LOCAL_URL}/api/cart/add-to-cart`,
        { productId: product._id, quantity },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Product added to cart!");
      } else {
        toast.error(res.data.message || "Failed to add product to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyProduct = () => {
    if (!isAuthenticated) {
      toast.error("Please login!");
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

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to post a review.");
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!rating || !comment.trim()) {
      toast.error("Please provide both rating and comment.");
      return;
    }
    try {
      setSubmittingReview(true);
      const activeToken = authStoreToken || localStorage.getItem("token");

      await axios.post(
        `${LOCAL_URL}/api/products/submitReview/${product._id}`,
        { rating, comment },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        },
      );
      toast.success("Thank you for giving review 👍!");
      setRating(0);
      setComment("");
      fetchProduct();
    } catch (error) {
      console.error(
        "Error submitting review:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-info mb-4"></div>
        <p className="text-lg font-medium opacity-75">
          Loading product context...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-transparent">
        <p className="text-xl font-semibold text-red-400">
          Product could not be resolved.
        </p>
      </div>
    );
  }

  const isInStock = product.quantity?.value > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 text-white bg-[#0b1426]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        {/* Image Section */}
        <div className="lg:col-span-5">
          <div
            className="sticky top-6 rounded-2xl p-6 flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              minHeight: "400px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <img
              src={product.image?.[0]?.url || "/placeholder.png"}
              alt={product.name}
              className="w-full h-auto max-h-[450px] object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <h1
              className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-capitalize text-white"
              style={{ letterSpacing: "-0.5px" }}
            >
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg text-sm font-bold border border-amber-500/20">
                <Star size={14} fill="currentColor" className="mr-1" />
                {(product.ratings ?? 0).toFixed(1)}
              </div>
              <div className="flex items-center text-slate-400 text-sm font-medium gap-1">
                <MessageSquare size={14} />
                {product.reviews?.length || 0} Reviews
              </div>
            </div>

            <div className="mb-6">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isInStock
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full mr-2 ${isInStock ? "bg-emerald-400" : "bg-rose-400"}`}
                ></span>
                {isInStock ? "In stock" : "Out of stock"}
              </span>
            </div>

            <div className="mb-6 border-t border-slate-800 pt-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Description
              </h4>
              <p className="text-slate-300 leading-relaxed text-sm font-light">
                {product.description || "No supplemental details provided."}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-4 mb-6 lg:mb-0">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Truck size={16} className="text-info" />
              <span>
                Pack Configuration:{" "}
                <strong>
                  {product.quantity?.value} {product.quantity?.unit}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-info" />
              <span>Quality verification approved & standard sealed.</span>
            </div>
          </div>
        </div>

        {/* Modern Checkout Card with Colored Shadows */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl p-6 flex flex-col sticky top-6 border border-slate-800"
            style={{
              backgroundColor: "#1a1f2c",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
            }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Total Pricing
            </span>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-white">
                ₹{(product.price * quantity).toFixed(2)}
              </span>
              {quantity > 1 && (
                <span className="text-xs text-slate-400">
                  ({quantity} × ₹{product.price?.toFixed(2)})
                </span>
              )}
            </div>

            {/* Quantity Counter */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Quantity
              </label>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-1.5 w-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  disabled={!isInStock}
                >
                  <Minus size={14} />
                </button>

                {/* Combined Quantity and Unit text */}
                <div className="flex items-center gap-1 font-bold text-sm px-4 text-white">
                  <span>{quantity * (product.quantity?.value || 1)}</span>
                  <span className="text-slate-400 text-xs font-medium">
                    {product.quantity?.unit || "units"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(q + 1, Math.min(product.stock || 5, 5)),
                    )
                  }
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  disabled={
                    !isInStock || quantity >= Math.min(product.stock || 5, 5)
                  }
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="text-[10px] text-slate-500 mt-2 block text-center">
                Purchase Limit: Max {Math.min(product.stock || 5, 5)}{" "}
                {product.quantity?.unit || "units"}
              </span>
            </div>

            {/* --- NEW BUTTON ROW GRID WITH COLORED SHADOWS --- */}
            <div className="space-y-4 mt-auto">
              <button
                onClick={handleBuyProduct}
                disabled={!isInStock}
                className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 transform hover:-translate-y-0.5"
                style={{
                  background: isInStock
                    ? "linear-gradient(135deg, #0dcaf0 0%, #0aa2c0 100%)"
                    : "#2d3748",
                  color: isInStock ? "#000000" : "#718096",
                  cursor: isInStock ? "pointer" : "not-allowed",
                  boxShadow: isInStock
                    ? "0 8px 24px rgba(13, 202, 240, 0.35)"
                    : "none",
                  border: "none",
                }}
              >
                Buy It Now
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock || adding}
                  className="w-1/2 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase transition-all duration-300 transform hover:-translate-y-0.5 bg-slate-900 text-slate-200 border border-slate-700"
                  style={{
                    boxShadow: isInStock
                      ? "0 6px 18px rgba(255, 255, 255, 0.04)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (isInStock)
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(13, 202, 240, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <ShoppingCart size={14} />
                  {adding ? "Adding..." : "To Cart"}
                </button>

                <button
                  className="w-1/2 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase transition-all duration-300 transform hover:-translate-y-0.5 bg-slate-900 text-slate-200 border border-slate-700"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(244, 63, 94, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <Heart size={14} />
                  Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-slate-800 pt-12">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-info" />
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {product.reviews?.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800/60"
                  style={{ backgroundColor: "#141822" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={14}
                          fill={
                            starIdx < rev.rating ? "#ffb300" : "transparent"
                          }
                          stroke={
                            starIdx < rev.rating
                              ? "#ffb300"
                              : "rgba(255,255,255,0.15)"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      by {rev.name || "Verified Customer"}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm font-light leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                No feedback recorded yet for this product item.
              </div>
            )}
          </div>

          {/* Review Form Component */}
          <div
            className="p-6 rounded-xl border border-slate-800"
            style={{ backgroundColor: "#1a1f2c" }}
          >
            <h3 className="text-md font-bold mb-4 tracking-tight">
              Share Your Experience
            </h3>

            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, idx) => {
                const starValue = idx + 1;
                const isLit = starValue <= (hoverRating || rating);
                return (
                  <Star
                    key={idx}
                    size={22}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer transition-transform duration-100 hover:scale-110"
                    fill={isLit ? "#ffb300" : "transparent"}
                    stroke={isLit ? "#ffb300" : "rgba(255,255,255,0.2)"}
                    role="button"
                    aria-label={`Rate ${starValue} Stars`}
                  />
                );
              })}
            </div>

            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Detail your product performance review here..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-info transition mb-4 resize-none"
            ></textarea>

            {/* --- HIGH CONTRAST REVIEW BUTTON WITH GLOW --- */}
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="w-full text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 border-0"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
                cursor: submittingReview ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(99, 102, 241, 0.45)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(99, 102, 241, 0.3)")
              }
            >
              {submittingReview ? "Uploading context..." : "Post Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

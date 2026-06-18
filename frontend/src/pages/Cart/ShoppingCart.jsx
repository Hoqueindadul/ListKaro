import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCartStore, useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Loader2,
  UserCheck,
} from "lucide-react";

const ShoppingCart = () => {
  const {
    cartItems,
    fetchCartItems,
    updateQuantity,
    removeItem,
    loading,
    error,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only attempt to call backend API if the user has an active session
    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

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
    } else if (cartItems.length === 0) {
      toast.success("Shop products then go to further process!");
      navigate("/products");
    } else {
      navigate("/order", {
        state: {
          cartItems,
          totalAmount: total,
        },
      });
    }
  };

  const originalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const savings = 0;
  const storePickup = 0;
  const tax = 0;
  const total = originalPrice - savings + storePickup + tax;

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 min-h-screen">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-cyan-500 dark:text-cyan-400" size={28} />
          <h2 className="text-2xl font-black tracking-tight m-0">Your Cart</h2>
          <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full">
            {isAuthenticated ? cartItems.length : 0}{" "}
            {cartItems.length === 1 && isAuthenticated ? "Item" : "Items"}
          </span>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center justify-center bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 hover:from-amber-500 hover:to-blue-600 text-gray-900 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all duration-300 no-underline shadow-[0_0_20px_rgba(251,191,36,0.3)] dark:shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)] hover:scale-[1.03] active:scale-[0.98]"
        >
          ← Back to Products
        </Link>
      </div>

      {/* 1. NOT AUTHENTICATED FALLBACK STATE */}
      {!isAuthenticated ? (
        <div className="text-center py-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl mx-auto flex flex-col items-center justify-center p-6 bg-gray-50/30 dark:bg-[#0b1426]/20">
          <div className="p-4 bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-500 dark:text-cyan-400 rounded-full mb-4">
            <UserCheck size={40} />
          </div>
          <h3 className="text-lg font-bold mb-1.5">
            Please sign in to view your cart
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 max-w-xs leading-relaxed">
            We save your items to your personal account so you can access them
            across any device.
          </p>
          <Link
            to="/login"
            state={{ from: location }}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black text-xs font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md"
          >
            Sign In to Account
          </Link>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-spin" />
          <p className="text-gray-400 text-sm font-medium animate-pulse">
            Loading items inside cart...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 border border-dashed border-red-200 dark:border-red-900/30 rounded-2xl bg-red-50/50 dark:bg-red-950/10">
          <p className="text-red-500 font-semibold text-sm">{error}</p>
        </div>
      ) : cartItems.length === 0 ? (
        /* 2. LOGGED IN BUT EMPTY CART STATE */
        <div className="text-center py-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl mx-auto flex flex-col items-center justify-center p-6">
          <div className="p-4 dark:bg-[#0b1426] rounded-full text-gray-400 dark:text-gray-600 mb-4">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-lg font-bold mb-1">Your cart is empty</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 max-w-xs">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black text-xs font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        /* 3. ACTIVE PRODUCTS VIEWGRID */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN: Cart Items Wrapper */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => {
              const numericQuantity = item.quantity;

              return (
                <div
                  key={item._id}
                  className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200 group"
                >
                  {/* Product Meta Section */}
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="w-20 h-20 bg-white rounded-xl p-2 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-transparent">
                      <img
                        src={item.image?.[0]?.url || ""}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-sm text-gray-900 dark:text-white truncate capitalize mb-0.5"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                        Category: {item.category || "General"}
                      </p>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Adjust Controls Panel */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-1 overflow-hidden shadow-inner">
                      <button
                        className="w-8 h-8 cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        onClick={() =>
                          handleDecreaseQuantity(item._id, numericQuantity)
                        }
                        disabled={numericQuantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={numericQuantity}
                        className="w-10 text-center rounded-xl bg-transparent font-bold text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        readOnly
                      />
                      <button
                        className="w-8 h-8 cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() =>
                          handleIncreaseQuantity(item._id, numericQuantity)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="w-24 text-right hidden md:block">
                      <span className="text-xs font-bold text-gray-400 block uppercase tracking-widest text-[9px] mb-0.5">
                        Total
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        ₹{item.price * numericQuantity}
                      </span>
                    </div>

                    <button
                      className="p-2.5 rounded-xl cursor-pointer shadow-lg bg-gray-600 hover:bg-red-500 dark:bg-gray-900/40 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                      onClick={() => handleRemoveItem(item._id)}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Summary Box */}
          <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm lg:sticky lg:top-6">
            <h3 className="text-base font-extrabold mb-5 uppercase tracking-wider text-xs text-gray-400">
              Price summary
            </h3>

            <div className="flex flex-col gap-3 pb-4 border-b border-gray-200 dark:border-gray-800/80">
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500 dark:text-gray-400 m-0">Subtotal</p>
                <p className="font-bold text-gray-900 dark:text-white m-0">
                  ₹{originalPrice}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500 dark:text-gray-400 m-0">Savings</p>
                <p className="font-bold text-emerald-500 m-0">-₹{savings}</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500 dark:text-gray-400 m-0">
                  Shipping Charges
                </p>
                <p className="font-bold text-gray-900 dark:text-white m-0">
                  {storePickup === 0 ? "Free" : `₹${storePickup}`}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500 dark:text-gray-400 m-0">Tax</p>
                <p className="font-bold text-gray-900 dark:text-white m-0">
                  ₹{tax}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mb-6">
              <p className="font-black text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 m-0">
                Total Amount
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white m-0">
                ₹{total}
              </p>
            </div>

            <button
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all duration-200 transform active:scale-[0.99]"
              onClick={handleCheckout}
            >
              <CreditCard size={16} />
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;

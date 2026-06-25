import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { currentConfig } from "../../config";
import { REACT_APP_RAZORPAY_KEY_ID } from "../../rozorPay";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Loader2,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const API_URL = currentConfig.API_URL;

const OrderSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ── Normalize items into a single cartItems array ──────────────────────────
  // Whether it's a "Buy Now" single product or a cart, we always work with an array.
  const cartItems = React.useMemo(() => {
    if (state?.product && state?.quantity) {
      // Single product: wrap in array
      return [
        {
          _id: state.product._id,
          name: state.product.name,
          price: state.product.price,
          image: state.product.image,
          category: state.product.category,
          description: state.product.description,
          quantity: state.quantity,
        },
      ];
    }
    // Cart: already an array
    return state?.cartItems || [];
  }, [state]);

  const totalAmount = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // ── Local state ────────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cashOnDelivery");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    zip: "",
    email: "",
    phone: "",
  });

  // ── Address handlers ───────────────────────────────────────────────────────
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
    setEditingAddressId(null);
    setFormData({
      name: addr.name,
      address: addr.address,
      zip: addr.zip,
      email: addr.email,
      phone: addr.phone,
    });
    toast.success("Address selected!");
  };

  const handleAddNewAddressOption = () => {
    setSelectedAddressId("new");
    setEditingAddressId(null);
    setShowNewAddressForm(true);
    setFormData({ name: "", address: "", zip: "", email: "", phone: "" });
  };

  const handleEditAddress = (e, addr) => {
    e.stopPropagation();
    setSelectedAddressId("new");
    setEditingAddressId(addr.id);
    setShowNewAddressForm(true);
    setFormData({
      name: addr.name,
      address: addr.address,
      zip: addr.zip,
      email: addr.email,
      phone: addr.phone,
    });
  };

  const handleDeleteAddress = (e, addressId) => {
    e.stopPropagation();
    setAddresses(addresses.filter((addr) => addr.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
      setFormData({ name: "", address: "", zip: "", email: "", phone: "" });
    }
    toast.success("Address removed!");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.address ||
      !formData.zip ||
      !formData.phone ||
      !formData.email
    ) {
      toast.error("Please fill all address fields.");
      return;
    }

    if (editingAddressId) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddressId ? { ...addr, ...formData } : addr,
        ),
      );
      setSelectedAddressId(editingAddressId);
      setEditingAddressId(null);
      toast.success("Address updated!");
    } else {
      const newAddr = { id: Date.now(), ...formData };
      setAddresses([...addresses, newAddr]);
      setSelectedAddressId(newAddr.id);
      toast.success("Address saved!");
    }
    setShowNewAddressForm(false);
  };

  // ── Core: save order to DB after payment ──────────────────────────────────
  /**
   * Calls POST /order with a unified payload.
   * cartItems is always an array — no single-product special case on backend.
   *
   * @param {object} extraPaymentData - razorpay IDs for online payment, empty for COD
   */
  const saveOrderToDatabase = async (extraPaymentData = {}) => {
    const token = localStorage.getItem("token");

    const mappedItems = cartItems.map((item) => ({
      _id: String(item._id || item.productId || ""),
      quantity: Number(item.quantity) || 1,
    }));

    // Debug: log exactly what we're sending so we can spot issues
    console.log("[Order] cartItems raw:", cartItems);
    console.log("[Order] mappedItems:", mappedItems);
    console.log("[Order] totalAmount:", totalAmount);

    const payload = {
      customerDetails: formData,
      cartItems: mappedItems,
      totalAmount,
      paymentMode,
      ...extraPaymentData,
    };

    const response = await axios.post(`${API_URL}/order`, payload, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  };

  // ── COD: place order directly ─────────────────────────────────────────────
  const handleCODOrder = async () => {
    setSubmitting(true);
    try {
      const response = await saveOrderToDatabase();
      if (response.status === 201) {
        toast.success("Order placed! Pay on delivery.");
        navigate("/orderplaced", {
          state: { customerDetails: formData, cartItems, totalAmount },
        });
      } else {
        toast.error("Failed to place order: " + response.data?.message);
      }
    } catch (err) {
      console.error("COD order error:", err);
      toast.error(
        "Something went wrong: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Online: create Razorpay order then open modal ─────────────────────────
  const handleOnlinePayment = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Step 1: Create a Razorpay order on our backend
      const paymentResponse = await axios.post(
        `${API_URL}/payment`,
        { price: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const razorpayOrder = paymentResponse.data;
      setSubmitting(false);

      // Step 2: Open Razorpay modal
      const options = {
        key: REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ListKaro",
        order_id: razorpayOrder.id,
        description: "Order Payment",

        handler: async function (rzpResponse) {
          // Step 3: On payment success → save order to DB
          try {
            const res = await saveOrderToDatabase({
              razorpayOrderId: razorpayOrder.id,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpaySignature: rzpResponse.razorpay_signature,
            });

            if (res.status === 201) {
              toast.success("Payment successful! Order placed.");
              navigate("/orderplaced", {
                state: { customerDetails: formData, cartItems, totalAmount },
              });
            } else {
              toast.error("Order save failed: " + res.data?.message);
            }
          } catch (err) {
            console.error("Order save error after payment:", err);
            toast.error("Payment done but order save failed. Contact support.");
          }
        },

        prefill: {
          name: formData.name || "",
          email: formData.email || "",
          contact: formData.phone || "",
        },
        notes: { address: formData.address || "" },
        theme: { color: "#00b074" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setSubmitting(false);
      console.error("Payment init error:", error);
      toast.error(
        "Failed to initiate payment: " +
          (error.response?.data?.error || error.message),
      );
    }
  };

  // ── Main submit handler ────────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (!selectedAddressId || selectedAddressId === "new") {
      toast.error("Please save and select a delivery address first!");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (paymentMode === "cashOnDelivery") {
      handleCODOrder();
    } else {
      handleOnlinePayment();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-5">
        <Truck className="text-cyan-500 dark:text-cyan-400" size={28} />
        <h2 className="text-2xl font-black tracking-tight m-0">
          Order Summary
        </h2>
      </div>

      {/* Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Address Selector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-cyan-500 dark:text-cyan-400" />
              <h3 className="text-base font-extrabold uppercase tracking-wider text-gray-400 m-0">
                Select Delivery Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative ${
                    selectedAddressId === addr.id
                      ? "bg-cyan-50/30 dark:bg-cyan-950/10 border-cyan-500 dark:border-cyan-400 shadow-sm"
                      : "border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1 pr-14">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {addr.name}
                      </span>
                      {selectedAddressId === addr.id && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {addr.address}
                    </p>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      type="button"
                      onClick={(e) => handleEditAddress(e, addr)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-cyan-500 hover:border-cyan-500/30 dark:hover:text-cyan-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAddress(e, addr.id)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-rose-500 hover:border-rose-500/30 dark:hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                    ZIP: {addr.zip}
                  </span>
                </div>
              ))}

              {/* Add New Address Card */}
              <div
                onClick={handleAddNewAddressOption}
                className={`p-4 rounded-2xl border border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[100px] ${
                  showNewAddressForm && !editingAddressId
                    ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500 text-emerald-500"
                    : "border-gray-300 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400"
                }`}
              >
                <Plus size={20} className="mb-1" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Add New Address
                </span>
              </div>
            </div>
          </div>

          {/* Address Form (conditional) */}
          {showNewAddressForm && (
            <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <User size={18} className="text-cyan-500 dark:text-cyan-400" />
                <h3 className="text-base font-extrabold uppercase tracking-wider text-gray-400 m-0">
                  {editingAddressId
                    ? "Edit Shipping Details"
                    : "New Shipping Address"}
                </h3>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Receiver's name"
                      required
                      onChange={handleChange}
                      value={formData.name}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                    />
                    <User
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                  </div>
                </div>

                {/* Address + ZIP */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Delivery Address
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative sm:col-span-2">
                      <input
                        type="text"
                        name="address"
                        placeholder="Full street address"
                        required
                        onChange={handleChange}
                        value={formData.address}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-3.5 text-gray-400"
                      />
                    </div>
                    <input
                      type="text"
                      name="zip"
                      placeholder="PIN Code"
                      required
                      onChange={handleChange}
                      value={formData.zip}
                      className="pl-4 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        required
                        onChange={handleChange}
                        value={formData.email}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-3.5 text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Phone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
                        required
                        onChange={handleChange}
                        value={formData.phone}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                      <Phone
                        size={16}
                        className="absolute left-3.5 top-3.5 text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all duration-200"
                  >
                    <Plus size={16} />
                    {editingAddressId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT: Order Invoice + Place Order */}
        <div className="lg:col-span-5 dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm lg:sticky lg:top-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <FileText
                size={18}
                className="text-cyan-500 dark:text-cyan-400"
              />
              <h3 className="text-base font-extrabold uppercase tracking-wider text-gray-400 m-0">
                Order Summary
              </h3>
            </div>

            {/* Items list */}
            <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3 border-b border-gray-200 dark:border-gray-800/80 pb-4 mb-4 scrollbar-thin scrollbar-thumb-gray-800">
              {cartItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="flex justify-between items-start gap-4 text-sm border border-gray-100 dark:border-gray-800/40 p-3 rounded-xl"
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-gray-900 dark:text-white truncate capitalize mb-0.5">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-gray-900 dark:text-white block">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 block">
                      ₹{item.price} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors cursor-pointer appearance-none bg-transparent text-inherit"
                >
                  <option value="cashOnDelivery" className="dark:bg-[#0b1426]">
                    Cash on Delivery (COD)
                  </option>
                  <option value="online" className="dark:bg-[#0b1426]">
                    Online Payment (UPI / Card / NetBanking)
                  </option>
                </select>
                <div className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none">
                  {paymentMode === "cashOnDelivery" ? (
                    <Truck size={16} />
                  ) : (
                    <CreditCard size={16} />
                  )}
                </div>
                <div className="absolute right-4 top-4 w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 pointer-events-none" />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center px-1 mb-4">
              <p className="font-black text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 m-0">
                Total Payable
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white m-0 tracking-tight">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                submitting || !selectedAddressId || selectedAddressId === "new"
              }
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_4px_rgba(16,185,129,0.35)] hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {paymentMode === "online"
                    ? "Initiating Payment..."
                    : "Placing Order..."}
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  {paymentMode === "online"
                    ? "Pay & Place Order"
                    : "Place Order (COD)"}
                </>
              )}
            </button>
            {(!selectedAddressId || selectedAddressId === "new") && (
              <p className="text-[11px] text-center text-amber-500 mt-2 font-medium">
                * Save and select a delivery address to continue.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;

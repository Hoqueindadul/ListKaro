import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { LOCAL_URL, DEPLOYMENT_URL } from "../../deploy-backend-url";
import toast from "react-hot-toast";
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

  // Address array converted to state so dynamically added addresses render immediately
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false); // Hide empty form when selecting existing address
    setEditingAddressId(null);
    setFormData({
      name: addr.name,
      address: addr.address,
      zip: addr.zip,
      email: addr.email,
      phone: addr.phone,
    });
    toast.success("Address profile applied!");
  };

  // Add brand new card address logic
  const handleAddNewAddressOption = () => {
    setSelectedAddressId("new");
    setEditingAddressId(null);
    setShowNewAddressForm(true);
    setFormData({ name: "", address: "", zip: "", email: "", phone: "" });
  };

  // Update existing address mode logic
  const handleEditAddress = (e, addr) => {
    e.stopPropagation(); // Stop parent click selection trigger
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

  // Delete address logic
  const handleDeleteAddress = (e, addressId) => {
    e.stopPropagation(); // Stop parent click selection trigger
    setAddresses(addresses.filter((addr) => addr.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
      setFormData({ name: "", address: "", zip: "", email: "", phone: "" });
    }
    toast.success("Address removed successfully!");
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic to save or update the address into state without submitting the entire order
  const handleSaveAddress = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.address ||
      !formData.zip ||
      !formData.phone ||
      !formData.email
    ) {
      toast.error("Please fill all the address fields.");
      return;
    }

    if (editingAddressId) {
      // Update existing address mode logic
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddressId ? { ...addr, ...formData } : addr,
        ),
      );
      setSelectedAddressId(editingAddressId);
      setEditingAddressId(null);
      toast.success("Address updated successfully!");
    } else {
      // Add brand new card address logic
      const newAddressObj = {
        id: Date.now(),
        name: formData.name,
        address: formData.address,
        zip: formData.zip,
        email: formData.email,
        phone: formData.phone,
      };
      setAddresses([...addresses, newAddressObj]);
      setSelectedAddressId(newAddressObj.id);
      toast.success("New address saved and selected!");
    }

    setShowNewAddressForm(false);
  };

  // Handle place order submit
  const handlePlaceOrderSubmit = async () => {
    if (!selectedAddressId || selectedAddressId === "new") {
      toast.error("Please select a saved address profile first!");
      return;
    }

    setSubmitting(true);

    const formattedCartItems = cartItems.map((item) => {
      const prodId = item.productId?._id || item.productId || item._id;
      return {
        _id: prodId,
        product: prodId,
        name: item.productId?.name || item.name,
        price: item.productId?.price || item.price,
        image: item.productId?.image || item.image,
        category: item.productId?.category || item.category,
        stock: item.productId?.stock || item.stock,
        description: item.productId?.description || item.description,
        source: item.productId?.source || item.source || "manual",
        quantity: item.quantity,
      };
    });

    const orderData = {
      customerDetails: formData,
      cartItems: formattedCartItems,
      totalAmount,
      paymentMode,
    };

    const isSingleProductOrder = !!state?.product;

    if (paymentMode === "cashOnDelivery") {
      try {
        const token = localStorage.getItem("token");
        const endpoint = isSingleProductOrder
          ? `${DEPLOYMENT_URL}/api/single-product-order`
          : `${DEPLOYMENT_URL}/api/order`;

        if (isSingleProductOrder) {
          orderData.product = state.product._id;
          orderData.quantity = state.quantity;
          delete orderData.cartItems;
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
        console.error(
          "Error placing order:",
          err.response?.data || err.message,
        );
        toast.error(
          "Something went wrong: " +
            (err.response?.data?.message || err.message),
        );
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        const token = localStorage.getItem("token");
        const paymentResponse = await axios.post(
          `${DEPLOYMENT_URL}/api/payment`,
          { price: totalAmount },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const razorpayOrder = paymentResponse.data;
        let orderWithPayment = {
          ...orderData,
          razorpayOrderId: razorpayOrder.id,
        };

        if (isSingleProductOrder) {
          orderWithPayment.product = state.product._id;
          orderWithPayment.quantity = state.quantity;
          delete orderWithPayment.cartItems;
        }

        localStorage.setItem("orderData", JSON.stringify(orderWithPayment));
        localStorage.removeItem("emailSent");

        setSubmitting(false);
        navigate("/completepayment", {
          state: {
            customerDetails: formData,
            cartItems: formattedCartItems,
            totalAmount,
            razorpayOrder,
            product: isSingleProductOrder ? state.product : null,
            quantity: isSingleProductOrder ? state.quantity : null,
            paymentMode,
          },
        });
      } catch (error) {
        setSubmitting(false);
        toast.error(
          "Failed to create payment order: " +
            (error.response?.data?.error || error.message),
        );
      }
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-5">
        <Truck className="text-cyan-500 dark:text-cyan-400" size={28} />
        <h2 className="text-2xl font-black tracking-tight m-0">
          Secure Checkout
        </h2>
      </div>

      {/* Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Shipping Form & Address Selector Matrix */}
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

                  {/* Floating Actions Panel on Card Container */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      type="button"
                      onClick={(e) => handleEditAddress(e, addr)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-cyan-500 hover:border-cyan-500/30 dark:hover:text-cyan-400 transition-colors"
                      title="Edit Address"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAddress(e, addr.id)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-rose-500 hover:border-rose-500/30 dark:hover:text-rose-400 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                    ZIP: {addr.zip}
                  </span>
                </div>
              ))}

              {/* Create / Add Custom Input Address Card option */}
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

          {/* DYNAMIC INPUT FORM FIELDS AREA (Conditional Rendering) */}
          {showNewAddressForm && (
            <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <User size={18} className="text-cyan-500 dark:text-cyan-400" />
                <h3 className="text-base font-extrabold uppercase tracking-wider text-gray-400 m-0">
                  {editingAddressId
                    ? "Modify Shipping Details"
                    : "Contact & Shipping Credentials"}
                </h3>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Customer's Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter Receiver's Name"
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

                {/* Split Address / Zip code layouts */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Delivery Address
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative sm:col-span-2">
                      <input
                        type="text"
                        name="address"
                        placeholder="Full Street Address"
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
                    <div className="relative">
                      <input
                        type="text"
                        name="zip"
                        placeholder="Pin Code"
                        required
                        onChange={handleChange}
                        value={formData.zip}
                        className="w-full pl-4 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Mobile Input Row block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Email Address
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
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit Mobile Number"
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

                {/* Local Custom Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 transform active:scale-[0.99]"
                  >
                    <Plus size={16} />
                    {editingAddressId
                      ? "Update & Apply Changes"
                      : "Save & Apply Address"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT: Order Invoice Content Feed Column */}
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

            <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3 border-b border-gray-200 dark:border-gray-800/80 pb-4 mb-4 scrollbar-thin scrollbar-thumb-gray-800">
              {cartItems.map((item) => (
                <div
                  key={item._id}
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
                      ₹{item.price * item.quantity}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 block">
                      ₹{item.price} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method Selector Dropdown in Right Column */}
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
                <div className="absolute right-4 top-4 w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 pointer-events-none"></div>
              </div>
            </div>

            <div className="flex justify-between items-center px-1 mb-4">
              <p className="font-black text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 m-0">
                Total Payable
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white m-0 tracking-tight">
                ₹{totalAmount}
              </p>
            </div>
          </div>

          {/* Place Order Button Moved Here to Right Column */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlaceOrderSubmit}
              disabled={
                submitting || !selectedAddressId || selectedAddressId === "new"
              }
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none disabled:scale-100 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18),_0_0_16px_1px_rgba(245,158,11,0.2),_0_0_20px_2px_rgba(249,115,22,0.12)] hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.3),_0_0_22px_2px_rgba(245,158,11,0.35),_0_0_26px_3px_rgba(249,115,22,0.25)] hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Place Order
                </>
              )}
            </button>
            {(!selectedAddressId || selectedAddressId === "new") && (
              <p className="text-[11px] text-center text-amber-500 mt-2 font-medium">
                * Please save and select a delivery address to enable checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;

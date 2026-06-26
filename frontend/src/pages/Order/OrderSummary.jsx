import React, { useState, useMemo, useEffect } from "react";
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

  // cart items from state
  const cartItems = useMemo(() => {
    if (state?.product && state?.quantity) {
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
    return state?.cartItems || [];
  }, [state]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Local state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cashOnDelivery");

  // Normalized field structures matching Backend requirements
  const [formData, setFormData] = useState({
    fullName: "",
    deliveryAddress: "",
    pin: "",
    email: "",
    phoneNumber: "",
  });

  // Global Config for Cookie Authentication
  const axiosConfig = {
    withCredentials: true,
  };

  // Fetch all addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/get-all-address`,
          axiosConfig,
        );
        if (response.data?.addresses) {
          setAddresses(response.data.addresses);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        if (error.response?.status !== 404) {
          toast.error(
            error.response?.data?.message || "Failed to fetch addresses",
          );
        }
      }
    };
    fetchAddresses();
  }, []);

  // Address handlers updated to use backend's MongoDB "_id"
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setShowNewAddressForm(false);
    setEditingAddressId(null);
    setFormData({
      fullName: addr.fullName,
      deliveryAddress: addr.deliveryAddress,
      pin: addr.pin,
      email: addr.email,
      phoneNumber: addr.phoneNumber,
    });
    toast.success("Address selected!");
  };

  const handleAddNewAddressOption = () => {
    setSelectedAddressId("new");
    setEditingAddressId(null);
    setShowNewAddressForm(true);
    setFormData({
      fullName: "",
      deliveryAddress: "",
      pin: "",
      email: "",
      phoneNumber: "",
    });
  };

  const handleEditAddress = (e, addr) => {
    e.stopPropagation();
    setSelectedAddressId("new");
    setEditingAddressId(addr._id);
    setShowNewAddressForm(true);
    setFormData({
      fullName: addr.fullName,
      deliveryAddress: addr.deliveryAddress,
      pin: addr.pin,
      email: addr.email,
      phoneNumber: addr.phoneNumber,
    });
  };

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/delete-address/${addressId}`, axiosConfig);

      setAddresses(addresses.filter((addr) => addr._id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setFormData({
          fullName: "",
          deliveryAddress: "",
          pin: "",
          email: "",
          phoneNumber: "",
        });
      }
      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error(error.response?.data?.message || "Failed to delete address.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.deliveryAddress ||
      !formData.pin ||
      !formData.phoneNumber ||
      !formData.email
    ) {
      toast.error("Please fill all address fields.");
      return;
    }

    if (!/^\d{6}$/.test(String(formData.pin))) {
      return toast.error("Invalid PIN code. Must be 6 digits.");
    }
    if (!/^\d{10}$/.test(String(formData.phoneNumber))) {
      return toast.error("Invalid phone number. Must be 10 digits.");
    }

    try {
      if (editingAddressId) {
        const response = await axios.put(
          `${API_URL}/update-address/${editingAddressId}`,
          formData,
          axiosConfig,
        );

        // Defensive check: validation of proper payload data architecture
        const updatedAddress = response.data?.address || response.data;
        if (!updatedAddress || (!updatedAddress._id && !updatedAddress.id)) {
          throw new Error(
            "Invalid response format from database rewrite updates.",
          );
        }

        setAddresses(
          addresses.map((addr) =>
            addr._id === editingAddressId ? updatedAddress : addr,
          ),
        );
        setSelectedAddressId(updatedAddress._id || updatedAddress.id);
        setEditingAddressId(null);
        toast.success("Address updated successfully!");
        setShowNewAddressForm(false);
      } else {
        console.log("api is calling...........");
        const response = await axios.post(
          `${API_URL}/save-address`,
          formData,
          axiosConfig,
        );
        console.log(response);
        // Fallback checks to see if backend sends database object under data root or data.address
        const newAddress =
          response.data?.address || response.data?.newAddress || response.data;

        if (!newAddress || (!newAddress._id && !newAddress.id)) {
          throw new Error(
            "Server confirmed action but missing database verification structural ID.",
          );
        }

        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(newAddress._id || newAddress.id);
        toast.success("Address saved successfully in DB!");
        setShowNewAddressForm(false);
      }
    } catch (error) {
      console.error("Submit address validation failure:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save address.",
      );
    }
  };

  const saveOrderToDatabase = async (extraPaymentData = {}) => {
    const mappedItems = cartItems.map((item) => ({
      _id: String(item._id || item.productId || ""),
      quantity: Number(item.quantity) || 1,
    }));

    const payload = {
      customerDetails: {
        name: formData.fullName,
        address: formData.deliveryAddress,
        zip: formData.pin,
        email: formData.email,
        phone: formData.phoneNumber,
      },
      cartItems: mappedItems,
      totalAmount,
      paymentMode,
      ...extraPaymentData,
    };

    return await axios.post(`${API_URL}/order`, payload, axiosConfig);
  };

  const handleCODOrder = async () => {
    setSubmitting(true);
    try {
      const response = await saveOrderToDatabase();
      if (response.status === 201 || response.status === 200) {
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

  const handleOnlinePayment = async () => {
    setSubmitting(true);
    try {
      const paymentResponse = await axios.post(
        `${API_URL}/payment`,
        { price: totalAmount },
        axiosConfig,
      );

      const razorpayOrder = paymentResponse.data;
      setSubmitting(false);

      const options = {
        key: REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ListKaro",
        order_id: razorpayOrder.id,
        description: "Order Payment",
        handler: async function (rzpResponse) {
          try {
            const res = await saveOrderToDatabase({
              razorpayOrderId: razorpayOrder.id,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpaySignature: rzpResponse.razorpay_signature,
            });

            if (res.status === 201 || res.status === 200) {
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
          name: formData.fullName || "",
          email: formData.email || "",
          contact: formData.phoneNumber || "",
        },
        notes: { address: formData.deliveryAddress || "" },
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

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 dark:bg-[#070d19] text-gray-900 dark:text-white min-h-screen">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-5">
        <Truck className="text-cyan-500 dark:text-cyan-400" size={28} />
        <h2 className="text-2xl font-black tracking-tight m-0">
          Order Summary
        </h2>
      </div>

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
                  key={addr._id || addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative ${
                    selectedAddressId === (addr._id || addr.id)
                      ? "bg-cyan-50/30 dark:bg-cyan-950/10 border-cyan-500 dark:border-cyan-400 shadow-sm"
                      : "border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1 pr-14">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {addr.fullName}
                      </span>
                      {selectedAddressId === (addr._id || addr.id) && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {addr.deliveryAddress}
                    </p>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleEditAddress(e, addr)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-cyan-500 hover:border-cyan-500/30 dark:hover:text-cyan-400"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) =>
                        handleDeleteAddress(e, addr._id || addr.id)
                      }
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-rose-500 hover:border-rose-500/30 dark:hover:text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                    PIN: {addr.pin}
                  </span>
                </div>
              ))}

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
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Receiver's name"
                      required
                      onChange={handleChange}
                      value={formData.fullName}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-cyan-500 text-white"
                    />
                    <User
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Delivery Address
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative sm:col-span-2">
                      <input
                        type="text"
                        name="deliveryAddress"
                        placeholder="Full street address"
                        required
                        onChange={handleChange}
                        value={formData.deliveryAddress}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 text-white"
                      />
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-3.5 text-gray-400"
                      />
                    </div>
                    <input
                      type="text"
                      name="pin"
                      placeholder="PIN Code"
                      required
                      onChange={handleChange}
                      value={formData.pin}
                      className="pl-4 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 text-white"
                    />
                  </div>
                </div>

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
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 text-white"
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
                        name="phoneNumber"
                        placeholder="10-digit mobile number"
                        required
                        onChange={handleChange}
                        value={formData.phoneNumber}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 text-white"
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
                    className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all"
                  >
                    <Plus size={16} />
                    {editingAddressId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT: Order Summary List */}
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

            <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3 border-b border-gray-200 dark:border-gray-800/80 pb-4 mb-4">
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
                    <span className="text-[10px] text-gray-400 block">
                      ₹{item.price} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 appearance-none bg-transparent text-inherit cursor-pointer dark:text-white"
                >
                  <option value="cashOnDelivery" className="dark:bg-[#0b1426]">
                    Cash on Delivery (COD)
                  </option>
                  <option value="online" className="dark:bg-[#0b1426]">
                    Online Payment (UPI / Card)
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

            <div className="flex justify-between items-center px-1 mb-4">
              <p className="font-black text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 m-0">
                Total Payable
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white m-0 tracking-tight">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                submitting || !selectedAddressId || selectedAddressId === "new"
              }
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md"
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

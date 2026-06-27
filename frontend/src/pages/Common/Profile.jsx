import React, { useState, useEffect } from "react";
import {
  User,
  ShoppingBag,
  Lock,
  Trash2,
  Camera,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import axios from "axios";
import { currentConfig } from "../../config.js";

const API_URL = currentConfig.API_URL;

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState(null);

  // Unified naming to avoid undefined reference crashes
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/user-profile`, {
          withCredentials: true,
        });
        setProfileData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfileData();
  }, []);

  // Fetch orders when tab is active and history is empty
  useEffect(() => {
    if (activeTab === "orders" && orderHistory.length === 0) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await axios.get(`${API_URL}//get-all-orders`, {
            withCredentials: true,
          });
          console.log(res);
          setOrderHistory(res.data.orders || res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, orderHistory.length]);

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#070d19] text-white">
        <p className="text-lg font-bold animate-pulse">
          Loading profile data...
        </p>
      </div>
    );
  }

  const userDetails = {
    name: profileData.user.name,
    email: profileData.user.email,
    phone: profileData.user.phone,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    joinedDate: new Date(profileData.user.createdAt).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ),
    tier: profileData.user.role,
  };

  return (
    <div className="min-h-screen dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT SIDEBAR PANEL ================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-300" />
            <div className="relative inline-block mx-auto mb-4">
              <img
                src={userDetails.avatar}
                alt={userDetails.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800 shadow-sm"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full transition-colors shadow-md">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="text-xl font-black tracking-tight mb-0.5">
              {userDetails.name}
            </h2>
            <p className="text-xs font-bold text-cyan-500 dark:text-cyan-400 uppercase tracking-widest mb-3">
              {userDetails.tier}
            </p>
            <p className="text-xs text-gray-400">
              Customer since {userDetails.joinedDate}
            </p>
          </div>

          <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-4 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 ${
                activeTab === "profile"
                  ? "bg-gray-800 text-cyan-500"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <User size={18} /> Account Details
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 ${
                activeTab === "orders"
                  ? "bg-gray-800 text-cyan-500"
                  : "text-gray-300 hover:bg-gray-700 "
              }`}
            >
              <ShoppingBag size={18} /> Order History
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 ${
                activeTab === "security"
                  ? " bg-gray-800 text-cyan-500"
                  : "text-gray-300 hover:bg-gray-700 "
              }`}
            >
              <Lock size={18} /> Security & Danger Zone
            </button>
          </div>
        </div>

        {/* ================= RIGHT DATA EXHIBIT CONTROLLER ================= */}
        <div className="lg:col-span-8">
          {/* SECTION A: ACCOUNT DETAILS VIEW */}
          {activeTab === "profile" && (
            <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-800/80 pb-4">
                <h3 className="text-lg font-black tracking-tight">
                  Personal Profile Settings
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage your digital workspace identity data information
                  details
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={userDetails.name}
                    className="w-full px-4 py-2.5 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={userDetails.email}
                    className="w-full px-4 py-2.5 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue={userDetails.phone}
                    className="w-full px-4 py-2.5 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-sm py-2.5 px-6 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18)]">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SECTION B: ORDER HISTORY VIEW */}
          {activeTab === "orders" && (
            <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-800/80 pb-4">
                <h3 className="text-lg font-black tracking-tight">
                  Purchase Manifests
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Track and verify current or historical system purchases
                </p>
              </div>

              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
                    Retrieving Order History...
                  </p>
                </div>
              ) : orderHistory.length === 0 ? (
                <div className="text-center py-12 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  No orders found.
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div
                      key={order._id || order.id}
                      className="border border-gray-100 dark:border-gray-800/70 rounded-2xl p-4 relative overflow-hidden group hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
                        <div>
                          <span className="text-xs font-extrabold text-cyan-500 dark:text-cyan-400 tracking-wider block mb-0.5">
                            {order.id || order._id}
                          </span>
                          <span className="text-xs text-gray-400">
                            {order.date ||
                              new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                              )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black">
                            ₹{order.totalAmount || order.total}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${order.shipmentStatus === "Delivered" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                          >
                            {order.shipmentStatus === "Delivered" ? (
                              <CheckCircle2 size={10} />
                            ) : (
                              <Clock size={10} />
                            )}
                            {order.shipmentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="dark:bg-gray-800/20 rounded-xl p-4 border border-gray-100/50 dark:border-gray-800/40 space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Order Items
                        </p>

                        <div className="space-y-3">
                          {Array.isArray(order.orderItems) &&
                          order.orderItems.length > 0 ? (
                            order.orderItems.map((item, idx) => (
                              <div
                                key={item._id || idx}
                                className="flex items-center gap-3 bg-gray-800 p-2 rounded-xl border border-gray-500 dark:border-gray-800/20"
                              >
                                {/* Item Image Layout */}
                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200/50 dark:border-gray-700/50">
                                  <img
                                    src={
                                      item.image?.[0]?.url ||
                                      item.image?.[0] ||
                                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60"
                                    }
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60"; // fallback if broken
                                    }}
                                  />
                                </div>

                                {/* Item Text Information Layout */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                                    {item.name}
                                  </h4>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    Category:{" "}
                                    <span className="font-medium text-gray-500 dark:text-gray-400">
                                      {item.category || "N/A"}
                                    </span>
                                  </p>
                                </div>

                                {/* Pricing & Quantity breakdown Layout */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-black text-gray-900 dark:text-white">
                                    ₹{item.price}
                                  </p>
                                  <p className="text-[10px] font-bold text-cyan-500 dark:text-cyan-400 mt-0.5">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic">
                              No details available for this order.
                            </p>
                          )}
                        </div>
                      </div>
                      <button className="absolute cursor-pointer bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-bold text-cyan-500 flex items-center gap-1 pt-6">
                        Invoice Details <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION C: SECURITY & DANGER ZONE VIEW */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="border-b border-gray-100 dark:border-gray-800/80 pb-4">
                  <h3 className="text-lg font-black tracking-tight">
                    Security Access Configuration
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modify system entry phrases and authentication criteria
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                  <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm py-2.5 px-6 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18)]">
                    Update Security
                  </button>
                </div>
              </div>

              <div className="bg-red-50/10 dark:bg-red-950/5 border border-red-200/30 dark:border-red-900/30 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-black text-red-500 tracking-tight">
                    Danger Zone
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Irreversible administrative pipeline structural changes
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                  Deleting your profile immediately purges all operational token
                  profiles, cached credentials, and historical logs permanently
                  from the data architecture clusters.
                </p>
                <div className="pt-2">
                  <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm py-2.5 px-5 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(239,68,68,0.15)]">
                    <Trash2 size={16} /> Delete Profile Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

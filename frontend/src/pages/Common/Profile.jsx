import React, { useState } from "react";
import {
  User,
  ShoppingBag,
  Lock,
  Trash2,
  Camera,
  MapPin,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock Data for realism
  const userDetails = {
    name: "Alex Mercer",
    email: "alex.mercer@devmail.com",
    phone: "+1 (555) 234-5678",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    joinedDate: "October 2024",
    tier: "Gold Member",
  };

  const orderHistory = [
    {
      id: "ORD-90823",
      date: "May 12, 2026",
      total: "₹12,499",
      status: "Delivered",
      items: ["Zorvex Mech Keyboard", "Ultra-wide Desk Mat"],
    },
    {
      id: "ORD-88210",
      date: "April 28, 2026",
      total: "₹3,250",
      status: "Processing",
      items: ["Ergonomic Wrist Rest"],
    },
  ];

  return (
    <div className="min-h-screen  dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT SIDEBAR PANEL ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Profile Summary Card */}
          <div className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden group">
            {/* Absolute background accent ring */}
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

          {/* Tab Navigation Matrix */}
          <div className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-4 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 ${
                activeTab === "profile"
                  ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 dark:text-cyan-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              }`}
            >
              <User size={18} />
              Account Details
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 ${
                activeTab === "orders"
                  ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 dark:text-cyan-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              }`}
            >
              <ShoppingBag size={18} />
              Order History
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 ${
                activeTab === "security"
                  ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 dark:text-cyan-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              }`}
            >
              <Lock size={18} />
              Security & Danger Zone
            </button>
          </div>
        </div>

        {/* ================= RIGHT DATA EXHIBIT CONTROLLER ================= */}
        <div className="lg:col-span-8">
          {/* SECTION A: ACCOUNT DETAILS VIEW */}
          {activeTab === "profile" && (
            <div className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-6">
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
                    className="w-full px-4 py-2.5  dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
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

              {/* Dynamic Action Button featuring Small Colorful Glow Shadows */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-sm py-2.5 px-6 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18),_0_0_16px_1px_rgba(245,158,11,0.2),_0_0_20px_2px_rgba(249,115,22,0.12)] hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.3),_0_0_22px_2px_rgba(245,158,11,0.35),_0_0_26px_3px_rgba(249,115,22,0.25)] hover:scale-[1.01]">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SECTION B: ORDER HISTORY VIEW */}
          {activeTab === "orders" && (
            <div className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-800/80 pb-4">
                <h3 className="text-lg font-black tracking-tight">
                  Purchase Manifests
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Track and verify current or historical system purchases
                </p>
              </div>

              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 dark:border-gray-800/70 rounded-2xl p-4 relative overflow-hidden group hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
                      <div>
                        <span className="text-xs font-extrabold text-cyan-500 dark:text-cyan-400 tracking-wider block mb-0.5">
                          {order.id}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black">
                          {order.total}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            order.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {order.status === "Delivered" ? (
                            <CheckCircle2 size={10} />
                          ) : (
                            <Clock size={10} />
                          )}
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className=" dark:bg-gray-800/20 rounded-xl p-3 border border-gray-100/50 dark:border-gray-800/40">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Items Container
                      </p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 line-clamp-1">
                        {order.items.join(", ")}
                      </p>
                    </div>

                    <button className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-bold text-cyan-500 flex items-center gap-1">
                      Invoice Details <ExternalLink size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION C: SECURITY & DANGER ZONE VIEW */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Security Updates Block */}
              <div className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-6">
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
                        className="w-full px-4 py-2.5  dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                  <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm py-2.5 px-6 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18),_0_0_16px_1px_rgba(245,158,11,0.2),_0_0_20px_2px_rgba(249,115,22,0.12)] hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.3),_0_0_22px_2px_rgba(245,158,11,0.35),_0_0_26px_3px_rgba(249,115,22,0.25)] hover:scale-[1.01]">
                    Update Security
                  </button>
                </div>
              </div>

              {/* Strict Danger Zone Block */}
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
                  <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm py-2.5 px-5 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(239,68,68,0.15),_0_0_16px_1px_rgba(245,158,11,0.15)] hover:shadow-[0_0_16px_4px_rgba(239,68,68,0.25),_0_0_22px_2px_rgba(245,158,11,0.25)]">
                    <Trash2 size={16} />
                    Delete Profile Permanently
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

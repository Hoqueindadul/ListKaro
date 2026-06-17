import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  CreditCard,
} from "lucide-react";

export default function OrderListing() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Real-world mock order matrix database structural data
  const ordersDatabase = [
    {
      id: "ZOR-2026-8902",
      date: "June 14, 2026",
      totalAmount: "₹14,250",
      paymentMethod: "UPI (Razorpay)",
      status: "processing", // processing | shipped | delivered | cancelled
      estimatedDelivery: "June 19, 2026",
      items: [
        {
          name: "Zorvex Mechanical Gaming Keyboard v2",
          quantity: 1,
          price: "₹12,499",
          image:
            "https://images.unsplash.com/photo-1595225476474-87563907a212?w=120&auto=format&fit=crop&q=60",
        },
        {
          name: "Minimalist Anti-Fray Desk Mat (XL)",
          quantity: 1,
          price: "₹1,751",
          image:
            "https://images.unsplash.com/photo-1632292224971-0d45778b3af8?w=120&auto=format&fit=crop&q=60",
        },
      ],
    },
    {
      id: "ZOR-2026-7731",
      date: "May 28, 2026",
      totalAmount: "₹4,890",
      paymentMethod: "Cash on Delivery",
      status: "shipped",
      estimatedDelivery: "June 18, 2026",
      items: [
        {
          name: "Ergonomic Memory Foam Wrist Rest",
          quantity: 2,
          price: "₹2,445",
          image:
            "https://images.unsplash.com/photo-1585909693684-01c36294553e?w=120&auto=format&fit=crop&q=60",
        },
      ],
    },
    {
      id: "ZOR-2026-6120",
      date: "April 12, 2026",
      totalAmount: "₹29,999",
      paymentMethod: "Credit Card",
      status: "delivered",
      estimatedDelivery: "April 16, 2026",
      items: [
        {
          name: 'NovaAdmin 34" Curved UltraWide Display',
          quantity: 1,
          price: "₹29,999",
          image:
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=120&auto=format&fit=crop&q=60",
        },
      ],
    },
  ];

  // Map backend raw states into beautiful frontend styles
  const statusConfig = {
    processing: {
      label: "Processing",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      icon: <Clock size={12} />,
    },
    shipped: {
      label: "Shipped out",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      icon: <Truck size={12} />,
    },
    delivered: {
      label: "Delivered",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      icon: <CheckCircle2 size={12} />,
    },
    cancelled: {
      label: "Cancelled",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      icon: <XCircle size={12} />,
    },
  };

  // Filter & Search computation matrix pipeline logic
  const filteredOrders = ordersDatabase.filter((order) => {
    const matchesTab = activeFilter === "all" || order.status === activeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen  dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ================= PAGE DASHBOARD HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="text-cyan-500 dark:text-cyan-400" size={24} />
              <h1 className="text-2xl font-black tracking-tight m-0">
                Your Purchase History
              </h1>
            </div>
            <p className="text-xs text-gray-400">
              Track current pipelines, review invoices, and manage past
              acquisitions
            </p>
          </div>

          {/* Real-time search element input profile */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search ID or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2  dark:bg-[#0b1426] border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all"
            />
            <Search
              size={14}
              className="absolute left-3 top-3 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* ================= TAB CONTROL SLIDERS MATRIX ================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100 dark:border-gray-800/40">
          {["all", "processing", "shipped", "delivered", "cancelled"].map(
            (filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all duration-150 ${
                  activeFilter === filterKey
                    ? " dark:bg-[#0b1426] text-cyan-500 dark:text-cyan-400 border border-gray-200 dark:border-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-transparent"
                }`}
              >
                {filterKey}
              </button>
            ),
          )}
        </div>

        {/* ================= CARD RENDER ENGINE REPEATER ================= */}
        <div className="space-y-5">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Meta-Header Strip block */}
                <div className="bg-gray-50/60 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800/60 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Order Reference
                    </p>
                    <span className="text-xs font-black tracking-wide text-gray-900 dark:text-gray-100">
                      {order.id}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Date Placed
                    </p>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      {order.date}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Total Valuation
                    </p>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {order.totalAmount}
                    </span>
                  </div>
                  <div className="sm:text-right flex sm:justify-end">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider ${statusConfig[order.status].color}`}
                    >
                      {statusConfig[order.status].icon}
                      {statusConfig[order.status].label}
                    </span>
                  </div>
                </div>

                {/* Main Content Body: Nested Products Loop */}
                <div className="p-6 divide-y divide-gray-100 dark:divide-gray-800/50">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 ${idx === 0 ? "pb-4" : "py-4"}`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-900/40 border border-gray-200/40 dark:border-gray-800/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mb-0.5 capitalize">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} <span className="mx-1.5">•</span>{" "}
                          Price: {item.price}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform Summary Footer Action Deck Container */}
                <div className="bg-gray-50/20 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CreditCard size={14} className="text-gray-400" />
                    <span>
                      Paid via{" "}
                      <strong className="text-gray-600 dark:text-gray-300 font-bold">
                        {order.paymentMethod}
                      </strong>
                    </span>
                    {order.status !== "delivered" &&
                      order.status !== "cancelled" && (
                        <>
                          <span className="text-gray-300 dark:text-gray-700">
                            |
                          </span>
                          <span className="text-amber-500/90 font-medium">
                            Est. Arrival: {order.estimatedDelivery}
                          </span>
                        </>
                      )}
                  </div>

                  {/* Operational Controls with Custom Tight Colorful Glow Shadow Button */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    {/* View Invoice Redirection Route */}
                    <Link to="/invoice" state={{ orderId: order.id }}>
                      <button className="px-4 py-2 rounded-xl font-bold border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        View Invoice
                      </button>
                    </Link>

                    {/* Track Shipment Redirection Route */}
                    <Link to="/track-shipment" state={{ orderId: order.id }}>
                      <button className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-2 px-4 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18),_0_0_16px_1px_rgba(245,158,11,0.2),_0_0_20px_2px_rgba(249,115,22,0.12)] hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.3),_0_0_22px_2px_rgba(245,158,11,0.35),_0_0_26px_3px_rgba(249,115,22,0.25)] hover:scale-[1.01]">
                        Track Shipment
                        <ArrowUpRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback Empty State Display Section
            <div className="text-center py-16 dark:bg-[#0b1426] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <Package
                size={40}
                className="mx-auto text-gray-300 dark:text-gray-700 mb-3"
              />
              <h3 className="font-bold text-sm mb-1">No Orders Discovered</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                We couldn't locate any data metrics matching the current
                filtering segment sequence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

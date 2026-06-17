import React from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Phone,
  HelpCircle,
} from "lucide-react";

export default function TrackShipment() {
  // Real-world mock tracking architecture payload
  const trackingData = {
    orderId: "ZOR-2026-8902",
    carrier: "Bluedart Express",
    trackingNumber: "BD-908123-X9",
    status: "In Transit", // Out for Delivery | In Transit | Processing
    estimatedArrival: "June 19, 2026",
    shippingAddress:
      "Alex Mercer, 452 Tech Park, Sector V, Salt Lake, Kolkata, 700091",
    milestones: [
      {
        title: "Out for Delivery",
        description:
          "Package is with the local courier agent for final drop-off.",
        time: "Pending",
        location: "Kolkata Hub, WB",
        isCompleted: false,
        isActive: false,
      },
      {
        title: "In Transit",
        description: "Consignment arrived at regional sorting facility hub.",
        time: "June 17, 2026 — 04:30 PM",
        location: "Kolkata Hub, WB",
        isCompleted: true,
        isActive: true,
      },
      {
        title: "Shipped",
        description:
          "Carrier picked up the package and updated tracking manifests.",
        time: "June 15, 2026 — 11:15 AM",
        location: "Delhi Logistics Center, DL",
        isCompleted: true,
        isActive: false,
      },
      {
        title: "Order Processed",
        description:
          "Payment validated and parcel securely ready at vendor inventory location.",
        time: "June 14, 2026 — 08:45 PM",
        location: "Zorvex Warehouse Facility",
        isCompleted: true,
        isActive: false,
      },
    ],
  };

  return (
    <div className="min-h-screen  dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ================= ACTIONS BAR DECK ================= */}
        <div className="flex items-center justify-between">
          <Link to="/orderlisting">
            <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors dark:bg-[#0b1426] border border-gray-200 dark:border-gray-800/80 px-4 py-2 rounded-xl shadow-sm">
              <ArrowLeft size={14} />
              Back to Orders
            </button>
          </Link>

          <button className="flex items-center gap-1.5 text-xs font-bold text-cyan-500 dark:text-cyan-400 hover:opacity-80 transition-opacity">
            <RefreshCw size={14} />
            Refresh Data
          </button>
        </div>

        {/* ================= SHIPMENT METRICS HERO OVERVIEW ================= */}
        <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Tracking Reference
            </p>
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              {trackingData.trackingNumber}
            </h2>
            <p className="text-xs text-gray-400">
              {trackingData.carrier} Carrier Pipeline
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Estimated Delivery
            </p>
            <h2 className="text-base font-black text-emerald-500 dark:text-emerald-400 tracking-wide">
              {trackingData.estimatedArrival}
            </h2>
            <p className="text-xs text-gray-400">
              Current Status:{" "}
              <strong className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {trackingData.status}
              </strong>
            </p>
          </div>

          <div className="flex items-center md:justify-end">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 text-xs font-extrabold uppercase tracking-wider rounded-xl">
              <Truck size={14} />
              In Global Transit
            </span>
          </div>
        </div>

        {/* ================= MAIN SPLIT TIMELINE CONTROLLER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: VISUAL STEP TIMELINE STEPPERS */}
          <div className="lg:col-span-8 dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-8 border-b border-gray-100 dark:border-gray-800/60 pb-4">
              <Package size={18} className="text-cyan-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 m-0">
                Live Tracking Manifest
              </h3>
            </div>

            <div className="space-y-0 relative pl-4 sm:pl-6">
              {trackingData.milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="relative pb-8 last:pb-0 flex gap-4 sm:gap-6 items-start group"
                >
                  {/* Structural Tracking Connecting Line Bar */}
                  {idx !== trackingData.milestones.length - 1 && (
                    <div
                      className={`absolute left-[11px] top-6 w-[2px] h-[calc(100%-12px)] transition-colors ${
                        milestone.isCompleted
                          ? "bg-cyan-500 dark:bg-cyan-400"
                          : "bg-gray-200 dark:bg-gray-800"
                      }`}
                    />
                  )}

                  {/* Structural Node Indicator Point */}
                  <div className="relative z-10 shrink-0 mt-1">
                    {milestone.isCompleted ? (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          milestone.isActive
                            ? "bg-cyan-500 text-white ring-4 ring-cyan-500/20 animate-pulse"
                            : "bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30"
                        }`}
                      >
                        <CheckCircle2 size={12} className="stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full dark:bg-[#0b1426] border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400">
                        <Clock size={10} />
                      </div>
                    )}
                  </div>

                  {/* Text Details Profile Container */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4
                        className={`text-sm font-black transition-colors ${
                          milestone.isActive
                            ? "text-cyan-500 dark:text-cyan-400"
                            : milestone.isCompleted
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-400"
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                        {milestone.time}
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-relaxed max-w-xl ${milestone.isCompleted ? "text-gray-500 dark:text-gray-400" : "text-gray-400/60"}`}
                    >
                      {milestone.description}
                    </p>

                    {milestone.location && milestone.isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400  dark:bg-gray-800/30 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800/40">
                        <MapPin size={10} />
                        {milestone.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: DISPATCH METADATA INSIGHTS */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            {/* Delivery Destination Coordinates Panel */}
            <div className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-3">
                <MapPin size={16} className="text-cyan-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider m-0">
                  Destination Address
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium m-0">
                {trackingData.shippingAddress}
              </p>
            </div>

            {/* Customer Care Hotline Support Deck */}
            <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-3">
                <ShieldCheck size={16} className="text-cyan-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider m-0">
                  Logistics Assistance
                </h4>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed m-0">
                Facing delays or processing anomalies with this delivery
                sequence? Contact our automated helpline tier immediately.
              </p>

              <div className="space-y-2 pt-1">
                {/* Contact Helpline Buttons featuring Tight Multi-Layer Colorful Glow Shadows */}
                <button className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18),_0_0_16px_1px_rgba(245,158,11,0.2),_0_0_20px_2px_rgba(249,115,22,0.12)] hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.3),_0_0_22px_2px_rgba(245,158,11,0.35),_0_0_26px_3px_rgba(249,115,22,0.25)] hover:scale-[1.01]">
                  <Phone size={12} />
                  Call Support Center
                </button>

                <button className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors">
                  <HelpCircle size={12} />
                  Raise Dispute Token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

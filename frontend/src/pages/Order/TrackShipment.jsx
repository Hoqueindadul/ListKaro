import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { currentConfig } from "../../config";
const API_URL = currentConfig.API_URL;
import axios from "axios";
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
  XCircle,
} from "lucide-react";

export default function TrackShipment() {
  const location = useLocation();
  const targetOrderId = location.state?.orderId;

  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrackerData = async () => {
    if (!targetOrderId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${API_URL}/get-order-by-id/${targetOrderId}`,
        {
          withCredentials: true,
        },
      );

      if (response.data && response.data.order) {
        setOrderData(response.data.order);
      } else {
        setOrderData(null);
      }
    } catch (error) {
      console.error("Error hydrating tracking manifest parameters:", error);
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Execution handler for updating the order document state to cancelled
  const handleCancelOrder = async () => {
    if (
      !window.confirm("Are you absolutely sure you want to cancel this order?")
    ) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${API_URL}/cancel-order/${orderData._id}`,
        {},
        { withCredentials: true },
      );
      alert(response.data?.message || "Order cancelled successfully!");
      fetchTrackerData(); // Refresh payload telemetry variables
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Failed to cancel order.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, [targetOrderId]);

  // Construct standard status milestones map based on backend status values
  const computeMilestones = (currentStatus, createdAt) => {
    const formattedDate = createdAt
      ? new Date(createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Pending";

    const statusLevels = [
      "pending",
      "confirmed",
      "preparing",
      "outForDelivery",
      "delivered",
    ];
    const currentIndex = statusLevels.indexOf(currentStatus);

    if (currentStatus === "cancelled") {
      return [
        {
          title: "Order Cancelled",
          description:
            "This structural order stream was systematically cancelled.",
          time: formattedDate,
          location: "System Void",
          isCompleted: true,
          isActive: true,
          isCancelled: true,
        },
      ];
    }

    return [
      {
        title: "Delivered",
        description:
          "Parcel dropped safely off at destination coordinates package drop.",
        time: currentStatus === "delivered" ? "Completed" : "Pending",
        location: "Customer Destination",
        isCompleted: currentIndex >= 4,
        isActive: currentStatus === "delivered",
      },
      {
        title: "Out for Delivery",
        description:
          "Package is with the local courier agent for final drop-off.",
        time: currentStatus === "outForDelivery" ? "In Progress" : "Pending",
        location: "Local Sorting Hub",
        isCompleted: currentIndex >= 3,
        isActive: currentStatus === "outForDelivery",
      },
      {
        title: "Preparing & Dispatched",
        description:
          "Consignment sorted and processed at inventory distribution lanes.",
        time: currentStatus === "preparing" ? "In Progress" : "Processed",
        location: "Regional Sorting Facility",
        isCompleted: currentIndex >= 2,
        isActive: currentStatus === "preparing",
      },
      {
        title: "Order Processed",
        description:
          "Payment validated and items passed into system routing queues.",
        time: formattedDate,
        location: "Warehouse Facility",
        isCompleted: currentIndex >= 1,
        isActive: currentStatus === "confirmed",
      },
      {
        title: "Order Placed",
        description:
          "Purchase manifest submitted successfully to the active network cloud.",
        time: formattedDate,
        location: "Digital Terminal",
        isCompleted: currentIndex >= 0,
        isActive: currentStatus === "pending",
      },
    ];
  };

  if (!targetOrderId) {
    return (
      <div className="min-h-screen dark:bg-[#070d19] text-gray-900 dark:text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 dark:bg-[#0b1426] border border-dashed border-gray-200 dark:border-gray-800 p-8 rounded-3xl max-w-sm">
          <HelpCircle size={40} className="mx-auto text-gray-400" />
          <h3 className="font-bold text-sm">No Order Context Linked</h3>
          <p className="text-xs text-gray-400">
            Please enter tracking coordinates via the main user history list
            block panels.
          </p>
          <Link to="/" className="inline-block">
            <button className="text-xs bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold">
              Go to History
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const milestones = orderData
    ? computeMilestones(orderData.shipmentStatus, orderData.createdAt)
    : [];

  return (
    <div className="min-h-screen dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ================= ACTIONS BAR DECK ================= */}
        <div className="flex items-center justify-between">
          <Link to={-1}>
            <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors dark:bg-[#0b1426] border border-gray-200 dark:border-gray-800/80 px-4 py-2 rounded-xl shadow-sm">
              <ArrowLeft size={14} />
              Back to Orders
            </button>
          </Link>

          <button
            onClick={fetchTrackerData}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-500 dark:text-cyan-400 hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-24 dark:bg-[#0b1426] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <p className="text-xs text-gray-400 animate-pulse">
              Syncing satellite telemetry tracking payloads...
            </p>
          </div>
        ) : orderData ? (
          <>
            {/* ================= SHIPMENT METRICS HERO OVERVIEW ================= */}
            <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Tracking Reference
                </p>
                <h2 className="text-base font-black text-gray-900 dark:text-white truncate max-w-[220px]">
                  {orderData._id}
                </h2>
                <p className="text-xs text-gray-400">
                  Payment:{" "}
                  <span className="uppercase font-bold text-cyan-400">
                    {orderData.paymentMode === "cashOnDelivery"
                      ? "COD"
                      : "ONLINE"}
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Total Valuation
                </p>
                <h2 className="text-base font-black text-emerald-500 dark:text-emerald-400 tracking-wide">
                  ₹{orderData.totalAmount}
                </h2>
                <p className="text-xs text-gray-400">
                  Current Status:{" "}
                  <strong className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {orderData.shipmentStatus}
                  </strong>
                </p>
              </div>

              <div className="flex items-center md:justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl border ${
                    orderData.shipmentStatus === "cancelled"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20"
                  }`}
                >
                  <Truck size={14} />
                  {orderData.shipmentStatus === "delivered"
                    ? "Delivered Safe"
                    : orderData.shipmentStatus === "cancelled"
                      ? "Cancelled Void"
                      : "In Global Transit"}
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
                  {milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="relative pb-8 last:pb-0 flex gap-4 sm:gap-6 items-start group"
                    >
                      {/* Structural Tracking Connecting Line Bar */}
                      {idx !== milestones.length - 1 && (
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
                        {milestone.isCancelled ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-rose-500 text-white ring-4 ring-rose-500/20">
                            <XCircle size={12} className="stroke-[3]" />
                          </div>
                        ) : milestone.isCompleted ? (
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
                              milestone.isCancelled
                                ? "text-rose-500"
                                : milestone.isActive
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:bg-gray-800/30 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800/40">
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
                <div className="dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <MapPin size={16} className="text-cyan-500" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider m-0">
                      Destination Address
                    </h4>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {orderData.customerDetails?.name}
                    </p>
                    <p>{orderData.customerDetails?.address}</p>
                    <p>ZIP: {orderData.customerDetails?.zip}</p>
                    <p className="text-gray-400 pt-1 text-[11px]">
                      Phone: {orderData.customerDetails?.phone}
                    </p>
                  </div>
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
                    <button className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_12px_3px_rgba(59,130,246,0.18)] hover:scale-[1.01]">
                      <Phone size={12} />
                      Call Support Center
                    </button>

                    {/* DYNAMIC CANCEL ORDER CONDITIONAL ACTION LAYER */}
                    {["pending", "confirmed"].includes(
                      orderData.shipmentStatus,
                    ) ? (
                      <button
                        onClick={handleCancelOrder}
                        className="w-full flex items-center  justify-center gap-2 border border-rose-500/30 bg-rose-500/5 hover:bg-red-800 hover:text-white text-rose-500 font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.99]"
                      >
                        <XCircle size={12} />
                        Cancel Entire Order
                      </button>
                    ) : orderData.shipmentStatus === "cancelled" ? (
                      <div className="w-full text-center py-2.5 px-4 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-black uppercase tracking-wider border border-rose-500/20">
                        Order Cancelled
                      </div>
                    ) : (
                      <button className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors">
                        <HelpCircle size={12} />
                        Raise Dispute Token
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24 dark:bg-[#0b1426] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <p className="text-xs text-gray-400">
              Order tracking parameters could not be retrieved from records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

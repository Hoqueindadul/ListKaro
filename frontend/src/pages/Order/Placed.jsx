import { useLocation, Link } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import { DEPLOYMENT_URL, LOCAL_URL } from "../../deploy-backend-url";

const Placed = () => {
  const { state } = useLocation();
  const localData = JSON.parse(localStorage.getItem("orderData") || "{}");

  const [isDownloading, setIsDownloading] = React.useState(false);
  const customerDetails = state?.customerDetails || localData.customerDetails;
  const cartItems = state?.cartItems || localData.cartItems;
  const totalAmount = state?.totalAmount || localData.totalAmount;

  const invoiceRef = useRef();

  // Generate authentic looking sequential retail tracking identifiers
  const mockOrderNo = useRef(`LK-${Date.now().toString().slice(-6)}`);
  const mockInvoiceNo = useRef(`INV-${Date.now().toString().slice(-5)}`);

  // Send confirmation email to customer
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      try {
        const response = await fetch(
          `${DEPLOYMENT_URL}/api/sendconfirmationemail`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: customerDetails.email,
              name: customerDetails.name,
              items: cartItems,
              total: totalAmount,
              address: customerDetails.address,
              zip: customerDetails.zip,
              email: customerDetails.email,
              phone: customerDetails.phone,
            }),
          },
        );

        const result = await response.json();
        if (response.ok) {
          console.log("Email sent successfully!");
          localStorage.setItem("emailSent", "true");
        } else {
          console.error("Failed to send email:", result.message);
        }
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };

    if (customerDetails && cartItems && !localStorage.getItem("emailSent")) {
      sendConfirmationEmail();
    }
  }, [customerDetails, cartItems, totalAmount]);

  // Download invoice as PDF
  const downloadInvoice = () => {
    setIsDownloading(true);
    const element = invoiceRef.current;

    const options = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `Retail_Invoice_${mockInvoiceNo.current}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2.5, // High resolution scale for crisp tabular print text
        useCORS: true,
        backgroundColor: "#ffffff", // Standard real-world white paper canvas
      },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .catch((err) => {
        console.error("PDF Generation error:", err);
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased flex items-center justify-center"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: INTERACTIVE STATUS CARD */}
        <div
          className="lg:col-span-4 border p-8 text-center flex flex-col items-center justify-between relative overflow-hidden rounded-3xl h-fit lg:sticky lg:top-8"
          style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />

          <div className="w-full flex flex-col items-center mt-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full scale-125 animate-pulse" />
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-extrabold text-white tracking-tight mb-2">
              Thank You for Your Order!
            </h1>

            <p
              className="text-xs font-semibold text-amber-400 px-3 py-1 rounded-full mb-6 inline-block"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                borderColor: "rgba(245, 158, 11, 0.2)",
                borderWidth: "1px",
              }}
            >
              We will deliver it never :)
            </p>

            <div
              className="w-full border rounded-2xl p-4 space-y-3 text-sm text-gray-300"
              style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order ID</span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {mockOrderNo.current}
                </span>
              </div>
              <div
                className="flex justify-between items-center border-t pt-2.5"
                style={{ borderColor: "#334155" }}
              >
                <span className="text-gray-400">Status</span>
                <span className="font-bold text-emerald-400">Confirmed</span>
              </div>
              <div
                className="flex justify-between items-center border-t pt-2.5"
                style={{ borderColor: "#334155" }}
              >
                <span className="text-gray-400">Date</span>
                <span className="font-medium text-gray-200">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3 mt-8">
            <button
              onClick={downloadInvoice}
              disabled={isDownloading}
              className="w-full flex items-center cursor-pointer justify-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 disabled:brightness-75 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              {isDownloading ? (
                /* Circular Spinner SVG */
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                /* Original Download Icon */
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              )}
              {isDownloading ? "Generating Invoice..." : "Download Invoice"}
            </button>

            <Link
              to="/"
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:brightness-110 active:scale-95 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 border-t border-white/10"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go to Home
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: TAX INVOICE CONTAINER */}
        <div className="lg:col-span-8 flex bg-white rounded-3xl shadow-2xl overflow-x-auto p-2">
          <div
            ref={invoiceRef}
            id="invoice-capture-area"
            className="w-full p-6 md:p-8"
            style={{
              backgroundColor: "#ffffff",
              color: "#111111",
              minWidth: "680px",
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {/* Global Override Injection forcing all child layout elements to explicitly process clean gray dashed borders */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                #invoice-capture-area * {
                  border-style: dashed !important;
                  border-color: #cbd5e1 !important;
                }
              `,
              }}
            />

            {/* Corporate Marketplace Branding Ribbon */}
            <div
              className="flex justify-between items-start pb-4"
              style={{ borderBottom: "2px dashed #000000" }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "26px",
                    fontWeight: "900",
                    color: "#000000",
                    letterSpacing: "-0.5px",
                    margin: "0",
                  }}
                >
                  List<span style={{ color: "#16a34a" }}>Karo</span>
                </h2>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    margin: "2px 0 0 0",
                  }}
                >
                  Premium Digital Supply Network · www.listkaro.up.railway.app
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    color: "#000000",
                    margin: "0",
                    letterSpacing: "0.2px",
                  }}
                >
                  Tax Invoice / Bill of Supply
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#334155",
                    margin: "2px 0 0 0",
                    fontWeight: "600",
                  }}
                >
                  Original for Recipient
                </p>
              </div>
            </div>

            {/* Vendor Corporate Metadata Hub */}
            <div
              className="grid grid-cols-2 gap-6 py-4 text-xs"
              style={{ borderBottom: "1px dashed #cbd5e1" }}
            >
              <div style={{ lineHeight: "1.6" }}>
                <p
                  style={{
                    fontWeight: "700",
                    color: "#7da316ff",
                    marginBottom: "3px",
                  }}
                >
                  Sold By:
                </p>
                <p style={{ fontWeight: "600", color: "#1e293b" }}>
                  ListKaro Commerce Private Limited
                </p>
                <p style={{ color: "#334155" }}>
                  Active Fulfillment Center, Netaji Subhash Road
                  <br />
                  Kolkata, West Bengal, India
                  <br />
                  PIN: 700001
                </p>
                <p style={{ marginTop: "4px", color: "#0f172a" }}>
                  <span style={{ fontWeight: "600" }}>GSTIN:</span>{" "}
                  19AAACL1290F1Z2
                </p>
              </div>

              <div
                style={{
                  textAlign: "right",
                  lineHeight: "1.6",
                  color: "#1e293b",
                }}
              >
                <p>
                  <span style={{ fontWeight: "700", color: "#000000" }}>
                    Invoice Number:
                  </span>{" "}
                  {mockInvoiceNo.current}
                </p>
                <p>
                  <span style={{ fontWeight: "700", color: "#000000" }}>
                    Order Number:
                  </span>{" "}
                  {mockOrderNo.current}
                </p>
                <p>
                  <span style={{ fontWeight: "700", color: "#000000" }}>
                    Order Date:
                  </span>{" "}
                  {new Date().toLocaleDateString()}
                </p>
                <p>
                  <span style={{ fontWeight: "700", color: "#000000" }}>
                    Invoice Date:
                  </span>{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Address Management Ledger Block */}
            <div
              className="grid grid-cols-2 gap-6 py-4 text-xs"
              style={{
                borderBottom: "1.5px dashed #000000",
              }}
            >
              <div style={{ lineHeight: "1.6" }}>
                <p
                  style={{
                    fontWeight: "700",
                    color: "#7da316ff",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                    letterSpacing: "0.3px",
                  }}
                >
                  Billing Details:
                </p>
                {customerDetails ? (
                  <>
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "13px",
                        color: "#000000",
                      }}
                    >
                      {customerDetails.name}
                    </p>
                    <p style={{ color: "#334155" }}>
                      {customerDetails.address}
                    </p>
                    <p style={{ color: "#334155" }}>
                      Postal PIN:{" "}
                      <span style={{ fontWeight: "600", color: "#000000" }}>
                        {customerDetails.zip}
                      </span>
                    </p>
                    <p style={{ color: "#475569" }}>
                      Email: {customerDetails.email}
                    </p>
                  </>
                ) : (
                  <p style={{ fontStyle: "italic", color: "#64748b" }}>
                    No verified client parameters parsed.
                  </p>
                )}
              </div>

              <div
                style={{
                  lineHeight: "1.6",
                  paddingLeft: "20px",
                  borderLeft: "1px dashed #cbd5e1",
                }}
              >
                <p
                  style={{
                    fontWeight: "700",
                    color: "#7da316ff",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                    letterSpacing: "0.3px",
                  }}
                >
                  Shipping Destination Address:
                </p>
                {customerDetails ? (
                  <>
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "13px",
                        color: "#000000",
                      }}
                    >
                      {customerDetails.name}
                    </p>
                    <p style={{ color: "#334155" }}>
                      {customerDetails.address}
                    </p>
                    <p style={{ color: "#334155" }}>
                      Postal PIN:{" "}
                      <span style={{ fontWeight: "600", color: "#000000" }}>
                        {customerDetails.zip}
                      </span>
                    </p>
                    <p
                      style={{
                        fontWeight: "700",
                        color: "#000000",
                        marginTop: "4px",
                      }}
                    >
                      Contact Phone: +91 {customerDetails.phone}
                    </p>
                  </>
                ) : (
                  <p style={{ fontStyle: "italic", color: "#64748b" }}>
                    Destination point metadata absent.
                  </p>
                )}
              </div>
            </div>

            {/* Line Item Spreadsheet Matrix */}
            <div className="py-5">
              <table
                className="w-full text-xs text-left"
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8fafc",
                      borderBottom: "2px dashed #000000",
                    }}
                  >
                    <th
                      style={{
                        padding: "8px 6px",
                        fontWeight: "700",
                        color: "#000000",
                        width: "8%",
                      }}
                    >
                      SI No.
                    </th>
                    <th
                      style={{
                        padding: "8px 6px",
                        fontWeight: "700",
                        color: "#000000",
                        width: "52%",
                      }}
                    >
                      Description of Goods
                    </th>
                    <th
                      style={{
                        padding: "8px 6px",
                        fontWeight: "700",
                        color: "#000000",
                        width: "12%",
                        textAlign: "center",
                      }}
                    >
                      Unit Price
                    </th>
                    <th
                      style={{
                        padding: "8px 6px",
                        fontWeight: "700",
                        color: "#000000",
                        width: "10%",
                        textAlign: "center",
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        padding: "8px 6px",
                        fontWeight: "700",
                        color: "#000000",
                        width: "18%",
                        textAlign: "right",
                      }}
                    >
                      Net Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item, index) => {
                      const computedPrice = totalAmount || 0;
                      return (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px dashed #cbd5e1" }}
                        >
                          <td style={{ padding: "12px 6px", color: "#475569" }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: "12px 6px" }}>
                            <p
                              style={{
                                fontWeight: "700",
                                margin: "0",
                                color: "#000000",
                              }}
                            >
                              {item.name}
                            </p>
                            <p
                              style={{
                                fontSize: "10px",
                                color: "#64748b",
                                margin: "2px 0 0 0",
                              }}
                            >
                              HSN: 04012000 · Retail Supermarket Food Grade
                              Category
                            </p>
                          </td>
                          <td
                            style={{
                              padding: "12px 6px",
                              textAlign: "center",
                              color: "#1e293b",
                            }}
                          >
                            ₹
                            {Math.round(computedPrice / item.quantity).toFixed(
                              2,
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 6px",
                              textAlign: "center",
                              fontWeight: "600",
                              color: "#000000",
                            }}
                          >
                            {item.quantity}
                          </td>
                          <td
                            style={{
                              padding: "12px 6px",
                              textAlign: "right",
                              fontWeight: "700",
                              color: "#000000",
                            }}
                          >
                            ₹{computedPrice.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#64748b",
                          fontStyle: "italic",
                          borderBottom: "1px dashed #cbd5e1",
                        }}
                      >
                        No line products registered inside this confirmation
                        session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Balanced Arithmetic Columns Summary */}
            <div className="flex justify-between items-start pt-2 text-xs">
              <div
                style={{
                  width: "55%",
                  lineHeight: "1.6",
                  color: "#475569",
                  fontSize: "11px",
                }}
              >
                <p
                  style={{
                    fontWeight: "700",
                    color: "#1e3a8a",
                    marginBottom: "3px",
                  }}
                >
                  Declarations & Terms:
                </p>
                <p>
                  1. Prices are comprehensive of all relevant state and central
                  infrastructure tax rates.
                </p>
                <p>
                  2. This layout operates as an automatic authentic electronic
                  billing confirmation statement receipt.
                </p>
              </div>

              <div style={{ width: "40%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px dashed #cbd5e1",
                  }}
                >
                  <span style={{ color: "#475569" }}>
                    Subtotal Gross Balance:
                  </span>
                  <span style={{ fontWeight: "600", color: "#000000" }}>
                    ₹{(totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px dashed #cbd5e1",
                  }}
                >
                  <span style={{ color: "#475569" }}>Shipping & Handling:</span>
                  <span style={{ fontWeight: "600", color: "#16a34a" }}>
                    FREE
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "2px dashed #000000",
                    fontSize: "14px",
                    fontWeight: "800",
                  }}
                >
                  <span style={{ color: "#1e3a8a" }}>Grand Total:</span>
                  <span style={{ color: "#000000" }}>
                    ₹{(totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Corporate Signature Verification Seal Block */}
            <div className="flex justify-between items-end mt-12 pt-4 text-xs">
              <div style={{ color: "#24559bff", lineHeight: "1.5" }}>
                <p>
                  Settlement Profile:{" "}
                  <span style={{ fontWeight: "700", color: "#1f1d1dff" }}>
                    Cash On Delivery (COD)
                  </span>
                </p>
                <p style={{ fontSize: "10px", color: "#94a3b8" }}>
                  Digital Security Token Hash: secure_node_verified
                </p>
              </div>
              <div style={{ textAlign: "right", minWidth: "180px" }}>
                <p
                  style={{
                    fontWeight: "700",
                    fontSize: "11px",
                    margin: "0 0 50px 0",
                    color: "#000000",
                  }}
                >
                  For ListKaro Retail Pvt Ltd:
                </p>
                <p
                  style={{
                    borderTop: "1px dashed #94a3b8",
                    paddingTop: "5px",
                    display: "inline-block",
                    width: "100%",
                    color: "#111111",
                    fontWeight: "500",
                  }}
                >
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placed;

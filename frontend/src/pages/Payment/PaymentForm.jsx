import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LOCAL_URL, DEPLOYMENT_URL } from '../../deploy-backend-url';
import toast from 'react-hot-toast';
import { REACT_APP_RAZORPAY_KEY_ID } from '../../rozorPay';
import axios from 'axios';

// Ensure Razorpay checkout script is in index.html:
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

const PaymentForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
console.log(state)
  const paymentMode = state?.paymentMode || "cashOnDelivery"; // get payment mode from previous page
  const productId = state?.product?._id; // single product ID
  const quantity = state?.quantity || 1;
  const customerDetails = state?.customerDetails || {};
  const totalAmount = state?.totalAmount || 0;
  const razorpayOrder = state?.razorpayOrder; // only for online
  

  useEffect(() => {
    if (!productId ) {
      toast.error("Missing productId");
      navigate("/order");
      return;
    }
    if (!customerDetails ) {
      toast.error("Missing customer details");
      navigate("/order");
      return;
    }
    if (!totalAmount ) {
      toast.error("Missing total amount");
      navigate("/order");
      return;
    }
    
    

    if (paymentMode === "online") {
      if (!razorpayOrder) {
        toast.error("Missing Razorpay order info, redirecting.");
        navigate("/order");
        return;
      }
      initiateOnlinePayment();
    } else if (paymentMode === "cashOnDelivery") {
      placeCODOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendConfirmationEmail = async () => {
    try {
      const response = await fetch(`${DEPLOYMENT_URL}/api/sendconfirmationemail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: customerDetails.email,
          name: customerDetails.name,
          items: [{ productId, quantity }], // basic info
          total: totalAmount,
          address: customerDetails.address,
          zip: customerDetails.zip,
          email: customerDetails.email,
          phone: customerDetails.phone,
        }),
      });

      if (response.ok) {
        toast.success("Confirmation email sent successfully!");
        localStorage.setItem("emailSent", "true");
      } else {
        const err = await response.json();
        toast.error("Failed to send confirmation email: " + err.message);
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      toast.error("Error sending confirmation email");
    }
  };

  const initiateOnlinePayment = () => {
    const options = {
      key: REACT_APP_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Your Store Name",
      order_id: razorpayOrder.id,
      description: "Order Payment",
      handler: async function (response) {
        try {
          const token = localStorage.getItem("token");
          const orderData = {
            customerDetails,
            paymentMode: "online",
            product: productId,
            quantity,
            totalAmount,
            razorpayOrderId: razorpayOrder.id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          };

          const res = await axios.post(
            `${LOCAL_URL}/api/single-product-order`,
            orderData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.status === 200 || res.status === 201) {
            toast.success("Payment successful and order saved!");
            localStorage.removeItem("orderData");
            await sendConfirmationEmail();
            navigate("/orderplaced", { state: { customerDetails, productId, quantity, totalAmount } });
          } else {
            toast.error("Failed to save order: " + (res.data?.message || 'Unknown error'));
          }
        } catch (error) {
          console.error("Error saving order:", error);
          toast.error("Payment succeeded but error saving order.");
        }
      },
      prefill: {
        name: customerDetails.name || "",
        email: customerDetails.email || "",
        contact: customerDetails.phone || "",
      },
      notes: {
        address: customerDetails.address || "",
      },
      theme: { color: "#F37254" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const placeCODOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const orderData = {
        customerDetails,
        paymentMode: "cashOnDelivery",
        product: productId,
        quantity,
        totalAmount,
      };

      const res = await axios.post(`${DEPLOYMENT_URL}/api/single-product-order`, orderData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Order placed successfully! Please pay on delivery.");
        localStorage.removeItem("orderData");
        await sendConfirmationEmail();
        navigate("/orderplaced", { state: { customerDetails, productId, quantity, totalAmount } });
      } else {
        toast.error("Failed to place order: " + (res.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error placing COD order:", error);
      toast.error("Failed to place order.");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div className="spinner-border" role="status" />
      <p>Please Wait...</p>
      <h3>{paymentMode === "online" ? "Redirecting to Razorpay Gateway" : "Placing your order..."}</h3>
    </div>
  );
};

export default PaymentForm;

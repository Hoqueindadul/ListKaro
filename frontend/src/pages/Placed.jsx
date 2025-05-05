import { useLocation } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import './PlacedSmall.css'
const Placed = () => {
    const { state } = useLocation()
    const { customerDetails, cartItems, totalAmount } = state || {};
    const invoiceRef = useRef();

    useEffect(() => {
        const sendConfirmationEmail = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/sendconfirmationemail", {
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
                        phone: customerDetails.phone
                    }),
                });

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

        // Check if email already sent
        if (customerDetails && cartItems && !localStorage.getItem("emailSent")) {
            sendConfirmationEmail();
        }
    }, [customerDetails, cartItems, totalAmount]);


    const downloadInvoice = () => {
        const element = invoiceRef.current;
        element.style.margin = '0 auto';
        const options = {
            margin: 0.1,
            filename: `ListKaro_Invoice_${customerDetails?.name || "customer"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };
        html2pdf().from(element).set(options).save()
            .then(() => {
                element.style.margin = '';
            });
    };
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#f0f0f0', }} className="placedcontainer">

                <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', }}>
                    {/* container */}
                    <div style={{ backgroundColor: 'green', maxWidth: '400px', width: '90%', color: 'white', borderRadius: '20px', padding: '20px', textAlign: 'center', }}>

                        <p style={{ fontSize: '28px', fontWeight: '600' }}>
                            Thank You for the Order!
                        </p>

                        <p style={{ fontSize: '18px', fontWeight: '300', marginBottom: '40px', }}>
                            We will deliver it never :)
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <img
                                src="/images/orderplaced.gif"
                                alt="Order Placed"
                                height="100px"
                                width="100px"
                                style={{ borderRadius: '50%', marginBottom: '20px' }}
                            />
                            <span>Order Placed ☑ at {new Date().toLocaleTimeString()}</span>
                            <span>On {new Date().toLocaleDateString()}</span>

                            <a href="/" style={{ textDecoration: 'none', color: "black", fontWeight: '500', backgroundColor: 'white', padding: '7px', borderRadius: '5px' }}>Go to Home</a>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#4CAF50', padding: '5px', borderRadius: '8px', }}>
                                <img src="/images/downloadIcon.png" alt="" width={'30px'} />
                                <button onClick={downloadInvoice} style={{
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                }}> Download Invoice</button>
                            </div>

                        </div>
                    </div>
                </div>

                <div
                    ref={invoiceRef}
                    className="invoice"
                    style={{
                        width: '600px',
                        backgroundColor: 'white',
                        padding: '20px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '10px',
                    }}
                >

                    <div className="inheader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><p style={{ fontWeight: '600', fontSize: '20px' }}>ListKaro <br />Invoice</p> </div>
                        <div style={{ fontSize: '12px', }}>
                            <p>From <b>ListKaro</b> <br /> West Bengal, India <br /> 700001 <br />Invoice Generated on <b>{new Date().toLocaleDateString()}</b> <br /> at {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <hr />

                    <div className="inbody">
                        <p>Items <br />
                            {cartItems && cartItems.length > 0 ? (
                                cartItems.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '5px' }}>
                                        {item.name} - Qty: {item.quantity}
                                    </div>
                                ))
                            ) : (
                                <p>No items found.</p>
                            )}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                            <p>Total bill : {
                                totalAmount ? (
                                    <>
                                        Rs: {totalAmount}/-
                                    </>) : (
                                    <p> 000 </p>
                                )
                            } </p>

                        </div>

                    </div>

                    <hr />

                    <div className="incustomer">
                        <p><u>Billing Details</u></p>
                        {customerDetails ? (
                            <>
                                <p style={{ fontSize: '12px' }} id="p">
                                    Customer : {customerDetails.name} <br />
                                    Delivery Location : {customerDetails.address} <br />
                                    Area Code : {customerDetails.zip} <br />
                                    Phone : {customerDetails.phone} <br />
                                    Email : {customerDetails.email}</p>
                            </>
                        ) : (
                            <p>No Details Found</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Placed;


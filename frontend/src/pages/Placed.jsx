import { useLocation } from "react-router-dom";
import React, { useEffect } from "react";


const Placed = () => {
  const {state} = useLocation()
  const { customerDetails, cartItems, totalAmount } = state || {};

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
        } else {
          console.error("Failed to send email:", result.message);
        }
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };
  
    if (customerDetails && cartItems) {
      sendConfirmationEmail();
    }
  }, [customerDetails, cartItems, totalAmount]);
  

    return (
      <>
        {/* Body */}
        <div style={{  minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', padding: '20px',}}>
          
          {/* container */}
          <div style={{ backgroundColor: 'green', maxWidth: '400px', width: '90%',color: 'white', borderRadius: '20px',padding: '20px',textAlign: 'center',}}>
            
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

              <a href="/" style={{textDecoration:'none', color:"black", fontWeight:'500', backgroundColor:'white', padding:'7px', borderRadius:'5px'}}>Go to Home</a>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  export default Placed;
  
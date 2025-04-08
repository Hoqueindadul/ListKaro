// src/PaymentForm.jsx
import React, { useState } from 'react';


const PaymentForm = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:5000/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ price }),
        });

        const data = await response.json();

        if (response.ok) {
            // Initialize Razorpay payment modal here after successful order creation
            const options = {
                key: 'rzp_test_sIWGak0qwRvULV', 
                amount: data.amount,
                currency: 'INR',
                name: name,
                order_id: data.id,
                description: 'Test Payment',
                handler: function (response) {
                    alert("Payment Successful!");
                },
                prefill: {
                    name: name,
                },
                notes: {
                    address: 'Razorpay Test Store',
                },
                theme: {
                    color: '#F37254',
                },
            };
            const rzp1 = new Razorpay(options);
            rzp1.open();
        } else {
            alert('Failed to create order');
        }
    };

    return (
        <div>
            <h2>Razorpay Payment Gateway</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <br /><br />

                <label htmlFor="price">Price:</label>
                <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                <br /><br />

                <button type="submit">Create Payment</button>
            </form>
        </div>
    );
};

export default PaymentForm;

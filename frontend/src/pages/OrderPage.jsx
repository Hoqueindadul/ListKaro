import { useState } from 'react';
import axios from 'axios';

const OrderPage = ({ cartItems, totalAmount }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');

  const handleOrder = async () => {
    if (!userInfo.name || !userInfo.email || !userInfo.phone || !address.state || !address.city) {
      alert("Please fill in all required fields");
      return;
    }

    const orderData = {
      items: cartItems,
      totalAmount,
      userAddress: address,
      paymentMethod,
      userName: userInfo.name,
      userEmail: userInfo.email,
      userPhone: userInfo.phone,
    };

    try {
      await axios.post('/api/orders/place-order', orderData);
      if (paymentMethod === 'COD') {
        alert("Order Confirmed!");
      }
      else{
        window.location.href = "http://localhost:5173/completepayment";
      }
    } catch (error) {
      console.error("Order failed", error);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4">User Information</h2>
      <input
        placeholder="Name"
        value={userInfo.name}
        onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
        className="block border p-2 my-2 w-full"
      />
      <input
        placeholder="Email"
        value={userInfo.email}
        onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
        className="block border p-2 my-2 w-full"
      />
      <input
        placeholder="Phone Number"
        value={userInfo.phone}
        onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
        className="block border p-2 my-2 w-full"
      />

      <h2 className="text-lg font-bold mt-6 mb-4">Delivery Address</h2>
      <input
        placeholder="Street"
        value={address.street}
        onChange={e => setAddress({ ...address, street: e.target.value })}
        className="block border p-2 my-2 w-full"
      />
      <input
        placeholder="City"
        value={address.city}
        onChange={e => setAddress({ ...address, city: e.target.value })}
        className="block border p-2 my-2 w-full"
      />
      <input
        placeholder="State"
        value={address.state}
        onChange={e => setAddress({ ...address, state: e.target.value })}
        className="block border p-2 my-2 w-full"
      />
      <input
        placeholder="Postal Code"
        value={address.postalCode}
        onChange={e => setAddress({ ...address, postalCode: e.target.value })}
        className="block border p-2 my-2 w-full"
      />

      <select
        value={paymentMethod}
        onChange={e => setPaymentMethod(e.target.value)}
        className="block border p-2 my-4 w-full"
      >
        <option value="COD">Cash on Delivery</option>
        <option value="Online">Online</option>
      </select>

      <button onClick={handleOrder} className="bg-blue-600 text-white px-4 py-2 rounded">
        Place Order
      </button>
    </div>
  );
};

export default OrderPage;

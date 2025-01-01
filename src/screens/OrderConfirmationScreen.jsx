// OrderConfirmationScreen.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmationScreen = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  
  // Function to parse query parameters
  const getQueryParams = () => {
    return new URLSearchParams(location.search);
  };
  
  useEffect(() => {
    const query = getQueryParams();
    const key = query.get('key');
    const syclid = query.get('syclid');
    
    console.log("Order ID:", orderId);
    console.log("Key:", key);
    console.log("syclid:", syclid);
    
    // Handle cases where key is required but missing
    if (!key) {
      setError('Invalid or missing key parameter.');
      return;
    }
    
    // Fetch order details from your backend using orderId and key
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch('http://clamare.store/api/order-details', { // Update to your backend URL if different
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId, key, syclid }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch order details.');
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, location.search]);
  
  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }
  
  if (!orderDetails) {
    return <div>Loading your order details...</div>;
  }
  
  return (
    <div>
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase! Your order ID is {orderDetails.orderNumber}.</p>
      <p>Email: {orderDetails.email}</p>
      <h3>Items:</h3>
      <ul>
        {orderDetails.lineItems.edges.map((item, index) => (
          <li key={index}>
            {item.node.title} - Quantity: {item.node.quantity}
          </li>
        ))}
      </ul>
      <p>Total Price: {orderDetails.totalPrice.amount} {orderDetails.totalPrice.currencyCode}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default OrderConfirmationScreen;

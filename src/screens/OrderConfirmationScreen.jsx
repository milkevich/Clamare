import React, { useState, useEffect } from "react";

const OrderConfirmationScreen = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const orderId = 1001

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/order-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!orderDetails) {
    return <div>No order details found.</div>;
  }

  return (
    <div>
      <h1>Order Confirmation</h1>
      <p>Order Number: #{orderDetails.orderNumber}</p>
      <p>Email: {orderDetails.email}</p>
      <ul>
        {orderDetails.lineItems.edges.map((item, index) => (
          <li key={index}>
            {item.node.title} × {item.node.quantity}
          </li>
        ))}
      </ul>
      <p>
        Total: {orderDetails.totalPrice.amount}{" "}
        {orderDetails.totalPrice.currencyCode}
      </p>
    </div>
  );
};

export default OrderConfirmationScreen;

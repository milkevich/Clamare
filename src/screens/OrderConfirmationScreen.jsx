import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const OrderConfirmationScreen = () => {
  const { shopId, orderId } = useParams();
  const [searchParams] = useSearchParams();
  const authKey = searchParams.get("key");
  const syclid = searchParams.get("syclid");

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        // Replace with your Storefront API endpoint and headers
        const response = await fetch(`https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/api/2024-10/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": import.meta.env.VITE_SHOPIFY_API_TOKEN, // Replace with your Storefront Access Token
          },
          body: JSON.stringify({
            query: `
              query OrderDetails($id: ID!) {
                order(id: $id) {
                  id
                  orderNumber
                  email
                  lineItems(first: 10) {
                    edges {
                      node {
                        title
                        quantity
                      }
                    }
                  }
                  totalPrice {
                    amount
                    currencyCode
                  }
                  statusUrl
                }
              }
            `,
            variables: { id: `gid://shopify/Order/${orderId}` }, // Format Shopify ID
          }),
        });

        const data = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        setOrderDetails(data.data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (error) {
    return <div>Error fetching order details: {error}</div>;
  }

  if (!orderDetails) {
    return <div>No order details found.</div>;
  }

  console.log("OrderConfirmationScreen mounted!");

  

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Order Confirmation</h1>
      <p>Order Number: #{orderDetails.orderNumber}</p>
      <p>Email: {orderDetails.email}</p>
      <h2>Items:</h2>
      <ul>
        {orderDetails.lineItems.edges.map((item, index) => (
          <li key={index}>
            {item.node.title} × {item.node.quantity}
          </li>
        ))}
      </ul>
      <p>
        Total: {orderDetails.totalPrice.amount} {orderDetails.totalPrice.currencyCode}
      </p>
      <a href={orderDetails.statusUrl} target="_blank" rel="noopener noreferrer">
        View Full Order Details
      </a>
    </div>
  );
};

export default OrderConfirmationScreen;

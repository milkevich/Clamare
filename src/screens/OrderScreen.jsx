// src/screens/OrderScreen.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Fade } from '@mui/material';
import client from '../utils/shopify';
import Button from '../shared/UI/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import Loader from '../shared/UI/Loader';

const OrderScreen = () => {
  const { orderId } = useParams();
  const decodedOrderId = decodeURIComponent(orderId);
  const { customer } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 600);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(() => {
    const customerAccessToken = localStorage.getItem('shopify_access_token');
    if (!customerAccessToken) {
      alert('Session expired. Please log in again.');
      navigate('/account/login'); // Redirect to login page
      return;
    }

    const fetchOrderDetails = async () => {
      const query = `
        query GetOrder($id: ID!) {
          node(id: $id) {
            ... on Order {
              id
              name
              processedAt
              fulfillmentStatus
              financialStatus
              email
              phone
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              billingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      title
                      image {
                        src
                        altText
                        width
                        height
                      }
                      priceV2 {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              subtotalPriceV2 {
                amount
                currencyCode
              }
              totalShippingPriceV2 {
                amount
                currencyCode
              }
              totalTaxV2 {
                amount
                currencyCode
              }
              totalPriceV2 {
                amount
                currencyCode
              }
            }
          }
        }
      `;

      const variables = {
        id: decodedOrderId,
      };

      try {
        const response = await client.post('', { query, variables });
        if (response.data.errors) {
          setError(`Failed to fetch order details: ${response.data.errors.map(err => err.message).join(', ')}`);
          return;
        }

        const fetchedOrder = response.data.data.node;

        if (!fetchedOrder) {
          setError('Order not found.');
          setLoading(false);
          return;
        }

        setOrderDetails(fetchedOrder);
      } catch (err) {
        setError('An error occurred while fetching order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate, customer]);

  if (loading) {
    return 
  }

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/account')}>Return to Account</button>
      </div>
    );
  }

  if (!orderDetails) {
    return <div>No order details found.</div>;
  }

  // Helper functions to format data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFulfillmentStatus = (status) => {
    const statusMap = {
      UNFULFILLED: 'Unfulfilled',
      PARTIALLY_FULFILLED: 'Partially Fulfilled',
      FULFILLED: 'Fulfilled',
      RESTOCKING: 'Restocking',
      CANCELLED: 'Cancelled',
    };
    return statusMap[status] || 'Unknown Fulfillment Status';
  };



  return (
    <Fade in={!loading}>
      <div>
        <div style={{ borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 49, backgroundColor: 'var(--main-bg-color)', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1470px', margin: 'auto', fontSize: '10px', fontWeight: '580', padding: '0rem 1.25rem' }}>
            <p style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => {
              navigate(-1)
            }}><MdKeyboardArrowLeft size={12}/> BACK TO ACCOUNT</p>
            <p style={{ color: 'var(--sec-color)' }}>{orderDetails.name} ORDER</p>
          </div>
        </div>
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '0.5rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '12px', fontWeight: '580' }}>
            <p style={{ fontSize: '32px', fontWeight: '900', marginBottom: '1.5rem', marginTop: 0 }}>ORDER {orderDetails.name}</p>
            <p style={{ margin: 0, fontWeight: '600' }}>CONFIRMED {formatDate(orderDetails.processedAt).toUpperCase()}</p>
            <p style={{ margin: 0 }}>We've recieved your order.</p>
          </div>
          {!isSmallScreen ?
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ marginTop: '4.5rem', fontSize: '12px', fontWeight: '600' }}>GENERAL</p>
                <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0 }}>Status: {getFulfillmentStatus(orderDetails.fulfillmentStatus)}</p>
                  <p style={{ margin: 0 }}>Placed On: {formatDate(orderDetails.processedAt)}</p>
                  <p style={{ margin: 0 }}>Total: {orderDetails.totalPriceV2.currencyCode === 'USD' ? '$' : ''}
                    {parseFloat(orderDetails.totalPriceV2.amount).toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p style={{ marginTop: '2.5rem', fontSize: '12px', fontWeight: '600' }}>CONTACT INFORMATION</p>
                <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0, color: !orderDetails.email && 'var(--sec-color)' }}>{orderDetails.email || 'Email address is not provided.'}</p>
                  <p style={{ margin: 0, color: !orderDetails.phone && 'var(--sec-color)' }}>{orderDetails.phone || 'Phone number is not provided.'}</p>
                </div>
              </div>
            </div>
            :
            <div>
              <p style={{ marginTop: '4.5rem', fontSize: '12px', fontWeight: '600' }}>GENERAL</p>
              <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: 0 }}>Status: {getFulfillmentStatus(orderDetails.fulfillmentStatus)}</p>
                <p style={{ margin: 0 }}>Placed On: {formatDate(orderDetails.processedAt)}</p>
                <p style={{ margin: 0 }}>Total: {orderDetails.totalPriceV2.currencyCode === 'USD' ? '$' : ''}
                  {parseFloat(orderDetails.totalPriceV2.amount).toFixed(2)}</p>
              </div>
            </div>
          }
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', marginTop: '3rem' }}>ORDER SUMMARY</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: '580', fontSize: '10px', paddingLeft: '0.5rem', paddingBottom: '0.5rem' }}>PRODUCT</th>
                  <th style={{ borderBottom: '1px solid var(--border-color)', fontWeight: '580', fontSize: '10px', paddingBottom: '0.5rem' }}>QUANTITY</th>
                  <th style={{ borderBottom: '1px solid var(--border-color)', fontWeight: '580', fontSize: '10px', paddingBottom: '0.5rem' }}>PRICE</th>
                  <th style={{ borderBottom: '1px solid var(--border-color)', fontWeight: '580', fontSize: '10px', textAlign: 'right', paddingRight: '0.5rem', paddingBottom: '0.5rem' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.lineItems.edges.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontSize: '12px' }}>
                    <td style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                      {item.node.variant.image ? (
                        <img src={item.node.variant.image.src} alt={item.node.title} style={{ width: '50px', marginRight: '10px' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', marginRight: '10px' }}></div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: '600' }}>{item.node.title.toUpperCase()}</p>
                        {item.node.variant.title !== 'Default Title' && (
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--sec-color)' }}>{item.node.variant.title}</p>
                        )}
                      </div>
                    </td>
                    <td>{item.node.quantity}</td>
                    <td>
                      {item.node.variant.priceV2.currencyCode === 'USD' ? '$' : ''}
                      {parseFloat(item.node.variant.priceV2.amount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '0.5rem' }}>
                      {item.node.variant.priceV2.currencyCode === 'USD' ? '$' : ''}
                      {(parseFloat(item.node.variant.priceV2.amount) * item.node.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <p style={{ margin: 0 }}>SUBTOTAL:</p>
                <p style={{ margin: 0 }}>
                  {orderDetails.subtotalPriceV2.currencyCode === 'USD' ? '$' : ''}
                  {parseFloat(orderDetails.subtotalPriceV2.amount).toFixed(2)}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <p style={{ margin: 0 }}>SHIPPING:</p>
                <p style={{ margin: 0 }}>
                  {orderDetails.totalShippingPriceV2.currencyCode === 'USD' ? '$' : ''}
                  {parseFloat(orderDetails.totalShippingPriceV2.amount).toFixed(2)}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <p style={{ margin: 0 }}>TAXES:</p>
                <p style={{ margin: 0 }}>
                  {orderDetails.totalTaxV2.currencyCode === 'USD' ? '$' : ''}
                  {parseFloat(orderDetails.totalTaxV2.amount).toFixed(2)}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <p style={{ margin: 0 }}>TOTAL:</p>
                <p style={{ margin: 0 }}>
                  {orderDetails.totalPriceV2.currencyCode === 'USD' ? '$' : ''}
                  {parseFloat(orderDetails.totalPriceV2.amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          {isSmallScreen &&
            <div>
              <p style={{ marginTop: '2.5rem', fontSize: '12px', fontWeight: '600' }}>CONTACT INFORMATION</p>
              <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: 0, color: !orderDetails.email && 'var(--sec-color)' }}>{orderDetails.email || 'Email address is not provided.'}</p>
                <p style={{ margin: 0, color: !orderDetails.phone && 'var(--sec-color)' }}>{orderDetails.phone || 'Phone number is not provided.'}</p>
              </div>
            </div>
          }
          {!isSmallScreen ?
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <div>
                <p style={{ marginTop: '2.5rem', fontSize: '12px', fontWeight: '600' }}>SHIPPING ADDRESS</p>
                {orderDetails.shippingAddress ? (
                  <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.address1}{orderDetails.shippingAddress.address2 && `, ${orderDetails.shippingAddress.address2}`}</p>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.province} {orderDetails.shippingAddress.zip}</p>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.country}</p>
                  </div>
                )
                  :
                  <p>NO SHIPPING ADDRESS PROVIDED.</p>
                }
              </div>

              <div>
                <p style={{ marginTop: '2.5rem', fontSize: '12px', fontWeight: '600' }}>BILLING ADDRESS</p>
                {orderDetails.billingAddress ? (
                  <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.firstName} {orderDetails.billingAddress.lastName}</p>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.address1}{orderDetails.billingAddress.address2 && `, ${orderDetails.billingAddress.address2}`}</p>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.city}, {orderDetails.billingAddress.province} {orderDetails.billingAddress.zip}</p>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.country}</p>
                  </div>
                ) : (
                  <p>NO BILLING ADDRESS PROVIDED.</p>
                )}
              </div>
            </div>
            :
            <div>
              <div>
                <p style={{ marginTop: '2.5rem', fontSize: '12px', fontWeight: '600' }}>SHIPPING ADDRESS</p>
                {orderDetails.shippingAddress ? (
                  <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.address1}{orderDetails.shippingAddress.address2 && `, ${orderDetails.shippingAddress.address2}`}</p>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.province} {orderDetails.shippingAddress.zip}</p>
                    <p style={{ margin: 0 }}>{orderDetails.shippingAddress.country}</p>
                  </div>
                )
                  :
                  <p>NO SHIPPING ADDRESS PROVIDED.</p>
                }
              </div>

              <div>
                <p style={{ marginTop: '2.5rem', fontSize: '12px', fontWeight: '600' }}>BILLING ADDRESS</p>
                {orderDetails.billingAddress ? (
                  <div style={{ fontSize: '12px', fontWeight: '580', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.firstName} {orderDetails.billingAddress.lastName}</p>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.address1}{orderDetails.billingAddress.address2 && `, ${orderDetails.billingAddress.address2}`}</p>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.city}, {orderDetails.billingAddress.province} {orderDetails.billingAddress.zip}</p>
                    <p style={{ margin: 0 }}>{orderDetails.billingAddress.country}</p>
                  </div>
                ) : (
                  <p>NO BILLING ADDRESS PROVIDED.</p>
                )}
              </div>
            </div>
          }
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <Button onClick={() => navigate('/account')}>
              RETURN TO ACCOUNT
            </Button>
            <p onClick={() => {
              navigate('/pages/support/customer-service/contact')
            }} style={{ fontSize: '12px', margin: '1rem', fontWeight: '500' }}>HAVE A QUESTION? <span style={{ cursor: 'pointer', fontWeight: '600' }}>CONTACT US HERE</span></p>
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default OrderScreen;

// src/components/AccountScreen.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import client from '../utils/shopify';
import { useNavigate } from 'react-router-dom';
import { Fade } from '@mui/material';

const AccountScreen = () => {
  const { customer, handleLogout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [error, setError] = useState(null); // General error state
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Overall loading state

  useEffect(() => {
    const customerAccessToken = localStorage.getItem('shopify_access_token');
    if (!customerAccessToken) {
      alert('Session expired. Please log in again.');
      navigate('/login'); // Redirect to login page
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (customer) {
        const query = `
          query customerOrders($customerAccessToken: String!) {
            customer(customerAccessToken: $customerAccessToken) {
              orders(first: 10) {
                edges {
                  node {
                    id
                    name
                    financialStatus
                    fulfillmentStatus
                    processedAt
                    totalPriceV2 {
                      amount
                      currencyCode
                    }
                    lineItems(first: 5) {
                      edges {
                        node {
                          title
                          quantity
                          variant {
                            title
                            priceV2 {
                              amount
                              currencyCode
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        const variables = {
          customerAccessToken: localStorage.getItem('shopify_access_token'),
        };
        try {
          const response = await client.post('', { query, variables });
          console.log('Orders Response:', response.data);
          if (response.data.errors) {
            console.error('GraphQL Errors:', response.data.errors);
            setError('Failed to fetch orders.');
            return;
          }
          const fetchedOrders = response.data.data.customer.orders.edges.map(edge => edge.node);
          setOrders(fetchedOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setError('An error occurred while fetching orders.');
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrders();
  }, [customer]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (customer) {
        const query = `
          query customerAddresses($customerAccessToken: String!) {
            customer(customerAccessToken: $customerAccessToken) {
              addresses(first: 1) {
                edges {
                  node {
                    id
                    address1
                    address2
                    city
                    province
                    country
                    zip
                    phone
                    firstName
                    lastName
                  }
                }
              }
            }
          }
        `;
        const variables = {
          customerAccessToken: localStorage.getItem('shopify_access_token'),
        };
        try {
          const response = await client.post('', { query, variables });
          console.log('Addresses Response:', response.data);
          if (response.data.errors) {
            console.error('GraphQL Errors:', response.data.errors);
            setError('Failed to fetch addresses.');
            return;
          }
          const fetchedAddresses = response.data.data.customer.addresses.edges.map(edge => edge.node);
          setAddresses(fetchedAddresses);
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setError('An error occurred while fetching addresses.');
        } finally {
          setAddressesLoading(false);
        }
      }
    };

    fetchAddresses();
  }, [customer]);

  // Helper function to map status codes to readable labels
  const getOrderStatusLabel = (financialStatus, fulfillmentStatus) => {
    const financialMap = {
      PENDING: 'Pending Payment',
      AUTHORIZED: 'Authorized',
      PAID: 'Paid',
      PARTIALLY_REFUNDED: 'Partially Refunded',
      REFUNDED: 'Refunded',
      VOIDED: 'Voided',
      PENDING_PAYMENT: 'Pending Payment',
    };

    const fulfillmentMap = {
      UNFULFILLED: 'Unfulfilled',
      PARTIALLY_FULFILLED: 'Partially Fulfilled',
      FULFILLED: 'Fulfilled',
      RESTOCKING: 'Restocking',
      CANCELLED: 'Cancelled',
    };

    const financialStatusLabel = financialMap[financialStatus] || 'Unknown Financial Status';
    const fulfillmentStatusLabel = fulfillmentMap[fulfillmentStatus] || 'Unknown Fulfillment Status';

    // Customize the label based on specific status combinations
    if (financialStatusLabel === 'Refunded') {
      return `${financialStatusLabel}`;
    } else if (fulfillmentStatusLabel === 'Fulfilled') {
      return `${fulfillmentStatusLabel}`;
    }
    return `${financialStatusLabel} - ${fulfillmentStatusLabel}`;
  };

  // Effect to manage overall loading state
  useEffect(() => {
    if (!ordersLoading && !addressesLoading) {
      setLoading(false);
    }
  }, [ordersLoading, addressesLoading]);

  if (!customer) {
    return null; // Or a loading indicator while redirecting
  }

  return (
    <Fade in={!loading}>
      <div>
        <div style={{ borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 53, backgroundColor: 'var(--main-bg-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1.25rem', fontSize: '10px', maxWidth: '1470px', margin: 'auto' }}>
            <p style={{ margin: 0 }}>WELCOME BACK, {customer?.firstName?.toUpperCase()}!</p>
            <p onClick={handleLogout} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--sec-color)', cursor: 'pointer' }}>
              {customer?.email?.toUpperCase()} <span style={{ color: 'var(--main-color)' }}>LOG OUT</span>
            </p>
          </div>
        </div>
        <div style={{ maxWidth: '1300px', margin: 'auto', display: 'flex', justifyContent: 'space-between', height: 'calc(100vh - 155px - 1.25rem)', padding: '1.25rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', maxWidth: '50%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '900' }}>MY ACCOUNT</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{`${customer?.firstName || ''} ${customer?.lastName || ''}`.toUpperCase()}</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '580' }}>{customer?.email || ''}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ fontSize: '32px', fontWeight: '900', margin: 0, marginBottom: '1.5rem' }}>ADDRESS</p>
              {addressesLoading ? (
                <p>Loading addresses...</p>
              ) : addresses.length > 0 ? (
                <ul style={{ margin: 0, float: 'left', padding: 0, fontSize: '12px' }}>
                  {addresses.map(address => (
                    <li key={address.id} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <p style={{ margin: 0 }}>{address.firstName} {address.lastName}</p>
                      <p style={{ margin: 0 }}>{address.address1}{address.address2 && `, ${address.address2}`}</p>
                      <p style={{ margin: 0 }}>{address.city}, {address.province}, {address.zip}</p>
                      <p style={{ margin: 0 }}>{address.country}</p>
                      <p style={{ margin: 0 }}>{address.phone}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No addresses found.</p>
              )}
              <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, cursor: 'pointer', padding: '1rem 0rem 0rem 0rem' }}>MANAGE ADDRESSES</p>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '50%' }}>
            <p style={{ fontSize: '32px', fontWeight: '900', marginTop: 0, marginBottom: '3rem' }}>ORDER HISTORY</p>
            <div style={{ maxHeight: 'calc(100vh - 240px - 1.25rem)', maxWidth: '400px', height: '100%', overflowY: 'scroll' }}>
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : error ? (
                <p style={{ color: 'red' }}>ERROR: {error}</p>
              ) : orders.length > 0 ? (
                <ul style={{ margin: 0, padding: "1.25rem 0rem", borderTop: '1px solid var(--border-color)', maxWidth: '400px' }}>
                  {orders.map(order => (
                    <li key={order.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{order.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '580', color: 'var(--sec-color)' }}>VIEW</p>
                      </div>
                      <br />
                      <br />
                      <p style={{ fontSize: '12px', fontWeight: '580', margin: 0 }}>Status: {getOrderStatusLabel(order.financialStatus, order.fulfillmentStatus)}</p>
                      <p style={{ fontSize: '12px', fontWeight: '580', margin: 0 }}>Placed On: {order.processedAt ? new Date(order.processedAt).toLocaleDateString() : 'N/A'}</p>
                      <p style={{ fontSize: '12px', fontWeight: '580', margin: 0 }}>
                        Total:
                        {order.totalPriceV2.currencyCode === 'USD' ? ' $' : ''}
                        {Math.floor(order.totalPriceV2.amount)}
                        {order.totalPriceV2.currencyCode === 'USD' ? '' : order.totalPriceV2.currencyCode}
                      </p>
                      <br />
                      <ul style={{ padding: 0 }}>
                        {order.lineItems.edges.map(({ node }) => (
                          <li
                            style={{
                              fontSize: '12px',
                              fontWeight: '580',
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                            key={node.id}
                          >
                            <span>
                              {node.quantity}x {node.title}
                            </span>{' '}
                            <span>
                              {order.totalPriceV2.currencyCode === 'USD' ? ' $' : ''}
                              {Math.floor(node.variant.priceV2.amount)}
                              {order.totalPriceV2.currencyCode === 'USD' ? '' : order.totalPriceV2.currencyCode}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>NO ORDERS.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default AccountScreen;

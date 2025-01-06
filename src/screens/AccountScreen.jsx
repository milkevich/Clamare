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
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isSmallScreen2, setIsSmallScreen2] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 700);
      setIsSmallScreen2(window.innerWidth <= 500);
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
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (customer) {
        const query = `
          query customerOrders($customerAccessToken: String!) {
            customer(customerAccessToken: $customerAccessToken) {
              orders(first: 100) {
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
                    lineItems(first: 100) {
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
          if (response.data.errors) {
            setError('Failed to fetch orders.');
            return;
          }
          const fetchedOrders = response.data.data.customer.orders.edges.map(edge => edge.node);
          setOrders(fetchedOrders.reverse());
        } catch (error) {
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
          if (response.data.errors) {
            setError('Failed to fetch addresses.');
            return;
          }
          const fetchedAddresses = response.data.data.customer.addresses.edges.map(edge => edge.node);
          setAddresses(fetchedAddresses);
        } catch (error) {
          setError('An error occurred while fetching addresses.');
        } finally {
          setAddressesLoading(false);
        }
      }
    };

    fetchAddresses();
  }, [customer]);

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
        <div style={{ borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 49, backgroundColor: 'var(--main-bg-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: isSmallScreen2 ? '0.5rem 0.75rem' : '0.5rem 1.25rem', fontSize: '10px', maxWidth: '1470px', margin: 'auto' }}>
            <p style={{ margin: 0 }}>WELCOME BACK, {customer?.firstName?.toUpperCase()}!</p>
            <p onClick={handleLogout} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--sec-color)', cursor: 'pointer' }}>
              {!isSmallScreen && customer?.email?.toUpperCase()} <span style={{ color: 'var(--main-color)' }}>LOG OUT</span>
            </p>
          </div>
        </div>
        <div style={{ maxWidth: '1300px', margin: 'auto', display: isSmallScreen ? 'block' : 'flex', justifyContent: 'space-between', height: isSmallScreen ? '' : 'calc(100vh - 155px - 1.25rem)', padding: isSmallScreen ? '' : '1.25rem', width: isSmallScreen && '100%', }}>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: isSmallScreen ? '' : '100%', maxWidth: !isSmallScreen && '50%', padding: isSmallScreen2 ? '0.75rem' : isSmallScreen ? '1.25rem' : '' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '900' }}>MY ACCOUNT</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{`${customer?.firstName || ''} ${customer?.lastName || ''}`.toUpperCase()}</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '580' }}>{customer?.email || ''}</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '580' }}>{customer?.phone || ''}</p>
              </div>
            </div>
            {isSmallScreen &&
              <div style={{ marginTop: '3rem' }}></div>
            }
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
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>NO ADDRESSES FOUND.</p>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '580' }}>Add address by clicking 'Manage Addresses'.</p>
                </div>)}
              <p onClick={() => {
                navigate('/account/manage/addresses')
              }} style={{ fontSize: '12px', fontWeight: '600', margin: 0, cursor: 'pointer', padding: '1rem 0rem 0rem 0rem' }}>MANAGE ADDRESSES</p>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: !isSmallScreen && '50%' }}>
            <p style={{ fontSize: '32px', fontWeight: '900', marginBottom: '3rem', marginTop: isSmallScreen ? '3rem' : '0px', padding: isSmallScreen2 ? '0rem 0.75rem' : isSmallScreen ? '0rem 1.25rem' : '' }}>ORDER HISTORY</p>
            <div style={{ maxHeight: !isSmallScreen && 'calc(100vh - 240px - 1.25rem)', maxWidth: !isSmallScreen && '400px', height: '100%', overflowY: 'scroll' }}>
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : error ? (
                <p style={{ color: 'red' }}>ERROR: {error}</p>
              ) : orders.length > 0 ? (
                <ul style={{ margin: 0, maxWidth: !isSmallScreen && '400px', padding: 0 }}>
                  {orders.map(order => (
                    <li onClick={() => {
                      const encodedOrderId = encodeURIComponent(order.id);
                      navigate(`/account/orders/${encodedOrderId}`);
                    }} style={{ padding: isSmallScreen2 ? "1.25rem 0.75rem" : isSmallScreen ? '1.25rem 1.25rem 1.25rem 1.25rem' : "1.25rem 1.25rem 1.25rem 0rem", borderTop: '1px solid var(--border-color)', }} key={order.id}>
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
                <div style={{paddingLeft: isSmallScreen ? '0.75rem' : '1.25rem'}}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>NO ORDERS.</p>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '580' }}>You haven't placed any orders yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default AccountScreen;

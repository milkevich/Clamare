// src/components/ShoppingBag.jsx
import React, { useContext } from 'react';
import Button from '../shared/UI/Button';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { RiDeleteBin5Line } from "react-icons/ri";
import client from '../utils/shopify';

const ShoppingBag = ({ onCheckout, onClose }) => {
  const navigate = useNavigate();
  const { customer } = useContext(AuthContext);
  const { cart, loading, error, removeItemFromCart, updateCartLineQuantityFn } = useContext(CartContext);

  console.log('ShoppingBag - cart:', cart);
  console.log('ShoppingBag - loading:', loading);
  console.log('ShoppingBag - error:', error);
  console.log('ShoppingBag - customer:', customer); // Added for debugging

  const handleRemoveItem = async (lineId) => {
    try {
      console.log('Removing item with lineId:', lineId);
      await removeItemFromCart(lineId);
      console.log('Item removed successfully.');
    } catch (err) {
      console.error('Error removing item from cart:', err);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const handleQuantityChange = async (lineId, delta) => {
    try {
      await updateCartLineQuantityFn(lineId, delta);
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update item quantity. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  if (!cart || cart?.lines?.edges?.length === 0) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            fontSize: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            fontWeight: '580',
          }}
        >
          <p>SHOPPING BAG (0)</p>
          <p style={{ cursor: 'pointer' }} onClick={onClose}>
            CLOSE
          </p>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 100px)'
        }}>
          <p style={{
            textAlign: 'center',
            fontSize: '12px',
            marginTop: '20px',
            marginBottom: '0px',
            fontWeight: '580'
          }}>
            LOOKS LIKE THERE IS NOTHING HERE.
          </p>
          <p
            onClick={() => {
              onClose?.();
              navigate('/products/all');
            }}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            GO TO SHOP
          </p>
        </div>
      </>
    );
  }

  const total = cart?.lines?.edges
    .reduce((acc, edge) => {
      const merchandise = edge.node.merchandise;
      if (!merchandise || !merchandise.priceV2 || !merchandise.priceV2.amount) {
        console.warn(`Missing price information for line item: ${edge.node.id}`);
        return acc;
      }
      const price = parseFloat(merchandise.priceV2.amount);
      return acc + price * edge.node.quantity;
    }, 0)
    .toFixed(2);

  const handleCheckoutClick = async () => {
    try {
      // Retrieve customerAccessToken from localStorage
      const customerAccessToken = localStorage.getItem('shopify_access_token');

      if (!customerAccessToken) {
        alert('Please log in to proceed to checkout.');
        return navigate('/account/login', { state: { from: '/checkout' } });
      }

      console.log('Customer Access Token:', customerAccessToken);

      // Check for existing checkout
      const existingCheckoutId = localStorage.getItem('shopify_checkout_id');

      let checkout;

      if (existingCheckoutId) {
        // Optionally, verify if the checkout is still valid
        // For simplicity, we'll reuse it
        checkout = { id: existingCheckoutId };
      } else {
        // Create a new checkout
        const createCheckoutMutation = `
          mutation checkoutCreate($input: CheckoutCreateInput!) {
            checkoutCreate(input: $input) {
              checkout {
                id
                webUrl
              }
              checkoutUserErrors {
                message
                field
                code
              }
            }
          }
        `;

        // Conditionally include email only if the user is NOT authenticated
        const input = {
          lineItems: cart.lines.edges.map(edge => ({
            variantId: edge.node.merchandise.id,
            quantity: edge.node.quantity,
          })),
        };

        // Since the user is authenticated, omit email
        // If you want to include email, ensure it matches the customer's email
        // input.email = customer?.email;

        const checkoutResponse = await client.post('', {
          query: createCheckoutMutation,
          variables: { input },
        });

        console.log('Checkout Creation Response:', checkoutResponse.data);

        // Check if the mutation was successful
        if (
          !checkoutResponse.data ||
          !checkoutResponse.data.data ||
          !checkoutResponse.data.data.checkoutCreate
        ) {
          console.error('Invalid response structure:', checkoutResponse.data);
          alert('Failed to create checkout. Please try again.');
          return;
        }

        const { checkout: createdCheckout, checkoutUserErrors } = checkoutResponse.data.data.checkoutCreate;

        if (checkoutUserErrors?.length > 0) {
          console.error('Checkout Creation Errors:', checkoutUserErrors);
          const errorMessages = checkoutUserErrors.map(err => err.message).join('\n');
          alert(`Checkout Creation Errors:\n${errorMessages}`);
          return;
        }

        checkout = createdCheckout;
        localStorage.setItem('shopify_checkout_id', checkout.id);
      }

      // Associate customer with the checkout
      const associateCustomerMutation = `
        mutation checkoutCustomerAssociateV2($checkoutId: ID!, $customerAccessToken: String!) {
          checkoutCustomerAssociateV2(checkoutId: $checkoutId, customerAccessToken: $customerAccessToken) {
            checkout {
              id
              webUrl
              email
            }
            checkoutUserErrors {
              message
              field
              code
            }
          }
        }
      `;
      const associateResponse = await client.post('', {
        query: associateCustomerMutation,
        variables: {
          checkoutId: checkout.id,
          customerAccessToken,
        },
      });

      console.log('Customer Association Response:', associateResponse.data);

      // Check if the association mutation was successful
      if (
        !associateResponse.data ||
        !associateResponse.data.data ||
        !associateResponse.data.data.checkoutCustomerAssociateV2
      ) {
        console.error('Invalid association response structure:', associateResponse.data);
        alert('Failed to associate your account with the checkout. Please try again.');
        return;
      }

      const {
        checkout: updatedCheckout,
        checkoutUserErrors: associateErrors,
      } = associateResponse.data.data.checkoutCustomerAssociateV2;

      if (associateErrors?.length > 0) {
        console.error('Customer Association Errors:', associateErrors);
        const errorMessages = associateErrors.map(err => err.message).join('\n');
        alert(`Customer Association Errors:\n${errorMessages}`);
        return;
      }

      console.log('Updated Checkout Email:', updatedCheckout.email);

      // Redirect to the updated checkout URL
      window.location.href = updatedCheckout.webUrl;
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An unexpected error occurred during checkout. Please try again.');
    }
  };

  const totalQuantity = cart?.lines?.edges?.reduce((sum, edge) => sum + edge.node.quantity, 0) || 0;
  return (
    <>
      <div
        style={{
          display: 'flex',
          fontSize: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          fontWeight: '580',
        }}
      >
        <p>SHOPPING BAG ({totalQuantity})</p>
        <p style={{ cursor: 'pointer' }} onClick={onClose}>
          CLOSE
        </p>
      </div>

      <div style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'scroll', height: '100%' }}>
        <div style={{
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '100%',
          justifyContent: 'space-between',
        }}>
          <div style={{maxWidth: '550px', margin: 'auto', width: '100%', marginTop: 0, }}>
          {cart?.lines?.edges?.map(({ node }) => {
            const variant = node.merchandise;
            return (
              <div
                key={node.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '0rem 1.25rem 1.25rem 1.25rem',
                  alignItems: 'center',
                  width: 'calc(100% - 2.5rem)',
                  justifyContent: 'space-between',
                  height: '249px'
                }}
              >
                <div style={{display: 'flex', height: '249px', width: '100%'}}>
                {variant?.image?.url && (
                  <img
                    src={variant.image.url}
                    alt={variant.title}
                    style={{
                      maxWidth: '200px',
                      width: '100%',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{
                  fontSize: '12px',
                  fontWeight: '580',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  height: 'calc(100% - 40px)',
                  gap: '2rem'
                }}>
                    <div>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                    {node.quantity}x {variant?.product?.title.toUpperCase() || 'Product Title'}
                    </p>
                    <p style={{ fontSize: '12px', margin: '0' }}>
                      ${variant?.priceV2?.amount || '0.00'}
                    </p>
                    </div>
                    <p style={{ fontSize: '12px', margin: '0' }}>
                      {variant?.title.toUpperCase() || 'Variant Title'}
                    </p>
                    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100px',
                    justifyContent: 'space-between'
                  }}>
                    <Button
                      secondary
                      single
                      onClick={() => handleQuantityChange(node.id, -1)}
                      disabled={node.quantity <= 1} // Disable if quantity is 1
                      style={{
                        opacity: node.quantity <= 1 ? 0.5 : 1,
                        cursor: node.quantity <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      –
                    </Button>
                    <p style={{ margin: '0 5px' }}>{node.quantity}</p>
                    <Button
                      secondary
                      single
                      onClick={() => handleQuantityChange(node.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                </div>
                
                  <RiDeleteBin5Line onClick={() => handleRemoveItem(node.id)} style={{ cursor: 'pointer' }}/>
              </div>
            );
          })}
          
          </div>
          <div style={{
              position: 'sticky',
              bottom: 74,
              padding: '10px 20px',
              backgroundColor: 'var(--main-bg-color)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              marginBottom: '-10px'
            }}>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  SUBTOTAL: ${total}
                </p>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  BAG ({totalQuantity})
                </p>
              </div>
          <div>
            <div style={{
              padding: '0px 20px',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {cart?.lines?.edges?.map(({ node }) => {
                const variant = node.merchandise;
                return (
                  <div key={node.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-color)',
                        padding: '10px 0px'
                      }}>
                      <p style={{ margin: 0 }}>
                        {node.quantity}x {variant?.product?.title.toUpperCase() || 'Product Title'} / {variant?.title || 'Variant Title'}
                      </p>
                      <p style={{ margin: 0 }}>
                        ${(parseFloat(variant?.priceV2?.amount || '0.00') * node.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <p style={{ color: 'var(--sec-color)', fontSize: '12px', marginTop: '10px' }}>
                Taxes / Fees and Shipping cost calculated at checkout.
              </p>
            </div>
            
          </div>
          <div style={{
              position: 'sticky',
              bottom: 0,
              padding: '20px',
              backgroundColor: 'var(--main-bg-color)',
              borderTop: '1px solid var(--border-color)',
              marginTop: -12
            }}>
                <Button
                  onClick={handleCheckoutClick}
                >
                  CHECKOUT
                </Button>
              </div>
        </div>
      </div>
    </>
  );
};

export default ShoppingBag;

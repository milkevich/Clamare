import React, { useContext, useEffect, useState } from 'react';
import Button from '../shared/UI/Button';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { RiDeleteBin5Line } from "react-icons/ri";
import client from '../utils/shopify';
import { AuthContext } from '../contexts/AuthContext';

const ShoppingBag = ({ onCheckout, onClose }) => {
  const navigate = useNavigate();
  const { customer } = useContext(AuthContext);
  const { cart, loading, error, removeItemFromCart, updateCartLineQuantityFn, setIsBagOpened } = useContext(CartContext);
  const [isSmallScreen, setIsSmallScreen] = useState(false)


  const handleRemoveItem = async (lineId) => {
    try {
      await removeItemFromCart(lineId);
    } catch (err) {
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 500);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleQuantityChange = async (lineId, delta) => {
    try {
      await updateCartLineQuantityFn(lineId, delta);
    } catch (err) {
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
            padding: isSmallScreen ? '0.5rem 0.75rem' : '0.5rem 1.25rem',
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
        return acc;
      }
      const price = parseFloat(merchandise.priceV2.amount);
      return acc + price * edge.node.quantity;
    }, 0)
    .toFixed(2);

    const handleCheckoutClick = async () => {
      try {
        const customerAccessToken = localStorage.getItem('shopify_access_token');
    
        const lineItems = cart.lines.edges.map((edge) => ({
          variantId: edge.node.merchandise.id,
          quantity: edge.node.quantity,
        }));
    
        const checkoutCreateInput = {
          lineItems, 
          ...(customer?.email ? { email: customer.email } : {})
        };
    
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
    
        const checkoutResponse = await client.post('', {
          query: createCheckoutMutation,
          variables: { input: checkoutCreateInput },
        });
    
        if (
          !checkoutResponse?.data ||
          !checkoutResponse.data.data ||
          !checkoutResponse.data.data.checkoutCreate
        ) {
          alert('Failed to create checkout. Please try again.');
          return;
        }
    
        const { checkout, checkoutUserErrors } = checkoutResponse.data.data.checkoutCreate;
        if (checkoutUserErrors?.length > 0) {
          const errorMessages = checkoutUserErrors.map((err) => err.message).join('\n');
          alert(`Checkout Creation Errors:\n${errorMessages}`);
          console.log(errorMessages, checkoutUserErrors)
          return;
        }
    
        if (customerAccessToken) {
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
    
          if (
            !associateResponse?.data ||
            !associateResponse.data.data ||
            !associateResponse.data.data.checkoutCustomerAssociateV2
          ) {
            alert('Failed to associate your account with the checkout. Please try again.');
            return;
          }
    
          const { checkout: updatedCheckout, checkoutUserErrors: associateErrors } =
            associateResponse.data.data.checkoutCustomerAssociateV2;
    
          if (associateErrors?.length > 0) {
            const errorMessages = associateErrors.map((err) => err.message).join('\n');
            alert(`Customer Association Errors:\n${errorMessages}`);
            console.log(errorMessages, associateErrors)
            return;
          }
    
          window.location.href = updatedCheckout.webUrl;
        } else {
          window.location.href = checkout.webUrl;
        }
      } catch (error) {
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
          padding: isSmallScreen ? '0.5rem 0.75rem' : '0.5rem 1.25rem',
          fontWeight: '580',
        }}
      >
        <p>SHOPPING BAG ({totalQuantity})</p>
        <p style={{ cursor: 'pointer' }} onClick={onClose}>
          CLOSE
        </p>
      </div>

      <div style={{ maxHeight: isSmallScreen ? 'calc(100dvh - 65px)' : 'calc(100vh - 60px)', overflowY: 'scroll', height: '100%' }}>
        <div style={{
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '100%',
          justifyContent: 'space-between',
        }}>
          <div style={{ maxWidth: '550px', margin: 'auto', width: '100%', marginTop: 0, }}>
            {cart?.lines?.edges?.map(({ node }) => {
              const variant = node.merchandise;
              return (
                <div
                  key={node.id}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: isSmallScreen ?  '0rem 0.75rem 0.75rem 0.75rem' : '0rem 1.25rem 1.25rem 1.25rem',
                    alignItems: 'center',
                    width: 'calc(100% - 2.5rem)',
                    justifyContent: 'space-between',
                    height: isSmallScreen ? '186px' : '249px'
                  }}
                >
                  <div style={{ display: 'flex', height: isSmallScreen ? '186px' : '249px', width: '100%' }}>
                    {variant?.image?.url && (
                      <img
                        src={variant.image.url}
                        alt={variant.title}
                        style={{
                          maxWidth: isSmallScreen ? '150px' : '200px',
                          width: '100%',
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
                        <p style={{ fontSize: isSmallScreen ? '12px' : '14px', margin: 0 }}>
                          {node.quantity}x {variant?.product?.title.toUpperCase() || 'Product Title'}
                        </p>
                        <p style={{ fontSize: isSmallScreen ? '10px' : '12px', margin: '0' }}>
                          ${Math.floor(variant?.priceV2?.amount)}
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

                  <RiDeleteBin5Line onClick={() => handleRemoveItem(node.id)} style={{ cursor: 'pointer' }} />
                </div>
              );
            })}

          </div>
          <div style={{
            position: 'sticky',
            bottom: 55,
            padding: isSmallScreen ? '0.5rem 0.75rem' : '0.5rem 1.25rem',
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
              padding: isSmallScreen ? '0rem 0.75rem' : '0rem 1.25rem',
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
              <p style={{ color: 'var(--sec-color)', fontSize: '12px', marginTop: '10px', paddingBottom: isSmallScreen && '20px' }}>
                Taxes / Fees and Shipping cost calculated at checkout.
              </p>
            </div>

          </div>
          <div style={{
            position: 'sticky',
            bottom: -1,
            padding: isSmallScreen ? '0.75rem' : '1.25rem',
            backgroundColor: 'var(--main-bg-color)',
            borderTop: '1px solid var(--border-color)',
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
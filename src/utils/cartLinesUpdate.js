// src/utils/cartLinesUpdate.js
export const updateCartLineQuantity = async (cartId, lineId, newQuantity) => {
    const query = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            lines(first: 250) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      priceV2 {
                        amount
                        currencyCode
                      }
                      image {
                        url
                        altText
                      }
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  
    const variables = {
      cartId,
      lines: [
        {
          id: lineId,
          quantity: newQuantity,
        },
      ],
    };
  
    try {
      const response = await fetch('https://clamare-us.myshopify.com/api/2023-10/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_API_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      });
  
      const data = await response.json();
  
      if (data.errors) {
        throw new Error(data.errors.map(error => error.message).join(', '));
      }
  
      const { cart, userErrors } = data.data.cartLinesUpdate;
  
      if (userErrors.length > 0) {
        throw new Error(userErrors.map(error => error.message).join(', '));
      }
  
      return cart;
    } catch (error) {
      console.error('Error in updateCartLineQuantity:', error);
      throw error;
    }
  };
  
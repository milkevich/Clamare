// src/utils/cartLinesAdd.js
import axios from 'axios';

const client = axios.create({
  baseURL: `https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/api/2023-04/graphql.json`,
  headers: {
    'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 25) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
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

export async function addLineToCart(cartId, variantId, quantity = 1) {
  const variables = {
    cartId,
    lines: [
      {
        merchandiseId: variantId,
        quantity,
      },
    ],
  };

  const response = await client.post('', {
    query: CART_LINES_ADD_MUTATION,
    variables,
  });

  const { cart, userErrors } = response.data.data.cartLinesAdd;
  if (userErrors && userErrors.length) {
    throw new Error(userErrors[0].message);
  }

  return cart; // updated cart object
}

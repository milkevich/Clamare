// src/utils/cartLinesRemove.js
import axios from 'axios';

const client = axios.create({
  baseURL: `https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/api/2023-04/graphql.json`,
  headers: {
    'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        lines(first: 25) {
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

export async function removeLineFromCart(cartId, lineIds) {
  const variables = {
    cartId,
    lineIds, // Array of line item IDs to remove
  };

  const response = await client.post('', {
    query: CART_LINES_REMOVE_MUTATION,
    variables,
  });

  const { cart, userErrors } = response.data.data.cartLinesRemove;
  if (userErrors.length) {
    throw new Error(userErrors[0].message);
  }

  return cart; // Updated cart object
}

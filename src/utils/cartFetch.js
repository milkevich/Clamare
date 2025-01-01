// src/utils/cartFetch.js
import axios from 'axios';

const client = axios.create({
  baseURL: `https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/api/2023-04/graphql.json`,
  headers: {
    'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

const FETCH_CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) {
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
  }
`;

export async function fetchCart(cartId) {
  const variables = { id: cartId };

  const response = await client.post('', {
    query: FETCH_CART_QUERY,
    variables,
  });

  const { cart } = response.data.data;
  if (!cart) {
    throw new Error('Cart not found.');
  }

  return cart; // { id, checkoutUrl, lines: { edges: [ { node: ... } ] } }
}

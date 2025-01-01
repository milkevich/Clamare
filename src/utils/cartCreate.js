import axios from 'axios';

const client = axios.create({
  baseURL: `https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/api/2023-04/graphql.json`,
  headers: {
    'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

const CREATE_CART_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createCart(variantId, quantity = 1) {
  const variables = {
    lines: [
      {
        merchandiseId: variantId, 
        quantity,
      },
    ],
  };

  const response = await client.post('', {
    query: CREATE_CART_MUTATION,
    variables,
  });

  const { cart, userErrors } = response.data.data.cartCreate;
  if (userErrors && userErrors.length) {
    throw new Error(userErrors[0].message);
  }

  return cart; // { id, checkoutUrl }
}

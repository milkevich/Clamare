// src/utils/shopify.js
import axios from 'axios';

// Create an Axios client for Shopify Storefront
const client = axios.create({
    baseURL: `https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/api/2023-10/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_API_TOKEN,
    },
  });
  
  export default client;

/**
 * 1) Fetch multiple products for ShopScreen 
 *    - Here we fetch each product's handle, which is critical for generating a Shopify-like URL.
 */
export const fetchProducts = async () => {
  const query = `
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle      # <--- to replicate the shopify slug (e.g. "grey-knit-sweater")
            description
            availableForSale
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  image {
                    url
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await client.post('', { query });
  const products = response.data.data.products.edges.map(edge => edge.node);
  return products;
};

/**
 * 2) Fetch a single product by its "handle".
 *    e.g., "grey-knit-sweater" => productByHandle.
 */
export const fetchProductByHandle = async (handle) => {
  const query = `
    query SingleProductHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        availableForSale
        priceRange {
          minVariantPrice {
            amount
          }
        }
        images(first: 10) {
          edges {
            node {
              url
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              image {
                url
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;
  const variables = { handle };
  const response = await client.post('', { query, variables });
  return response.data.data.productByHandle;  // returns null if not found
};

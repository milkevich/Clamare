// src/utils/shopify.js
import axios from 'axios';

// Create an Axios client for Shopify Storefront
const client = axios.create({
    baseURL: `https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/api/2023-07/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_API_TOKEN,
    },
  });
  
  export default client;

  // src/utils/shopify.js

// Add similar logs for other variables if needed


/**
 * 1) Fetch multiple products for ShopScreen 
 *    - Here we fetch each product's handle, which is critical for generating a Shopify-like URL.
 */
export const fetchProducts = async () => {
  const query = `
    {
      products(first: 100) {
        edges {
          node {
            id
            title
            handle      #
            description
            availableForSale
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 100) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 100) {
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
        images(first: 100) {
          edges {
            node {
              url
            }
          }
        }
        variants(first: 100) {
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

        metafields(identifiers: [
          {namespace: "custom", key: "modelReference"}
        ]) {
          id
          namespace
          key
          value
        }
      }
    }
  `;
  const variables = { handle };
  const response = await client.post('', { query, variables });
  return response.data.data.productByHandle;
};
// shopify.js
export const fetchLandingPage = async () => {
  const query = `
    query {
      metaobject(
        handle: {
          type: "landing_page"
          handle: "landing-page-bbxgvzio"
        }
      ) {
        fields {
          key
          value
          reference {
            __typename
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.post('', { query });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const metaobjectData = response.data?.data?.metaobject;
    if (!metaobjectData) return null;

    const heroField = metaobjectData.fields.find((field) => field.key === 'hero_image');
    if (!heroField) {
    }

    return heroField?.reference?.image?.url ?? null;
  } catch (error) {
    throw error;
  }
};
export const fetchMagazinePages = async () => {
  const query = `
    query {
      metaobjects(type: "magazine_page_chapters", first: 100) {
        edges {
          node {
            id
            handle
            fields {
              key
              value
              reference {
                __typename
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.post('', { query });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    // This returns an array of edges (each edge contains a "node")
    const edges = response.data?.data?.metaobjects?.edges;
    if (!edges || !edges.length) return [];

    // Map each edge to just the "node"
    return edges.map((edge) => edge.node);
  } catch (error) {
    throw error;
  }
};

export const fetchSingleMagazinePage = async (idNumber) => {
  const fullGID = `gid://shopify/Metaobject/${idNumber}`;

  const query = `
    query MetaobjectByID($id: ID!) {
  metaobject(id: $id) {
    id
    handle
    fields {
      key
      value
      # single ref
      reference {
        __typename
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
      # multi-refs
      references(first: 100) {
        edges {
          node {
            __typename
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
}

  `;

  const variables = { id: fullGID };
  try {
    const response = await client.post('', { query, variables });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data?.data?.metaobject ?? null;
  } catch (error) {
    throw error;
  }
};

export const fetchStoreStatus = async () => {
  const query = `
    query {
      metaobjects(type: "store_production", first: 10) {
        edges {
          node {
            id
            handle
            fields {
              key
              value
              reference {
                __typename
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.post('', { query });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const edges = response.data?.data?.metaobjects?.edges;
    if (!edges || !edges.length) return [];

    return edges.map((edge) => edge.node.fields);
  } catch (error) {
    throw error;
  }
};

export const fetchEmailInfo = async () => {
  const query = `
    query {
      metaobjects(type: "email", first: 10) {
        edges {
          node {
            id
            handle
            fields {
              key
              value
              reference {
                __typename
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.post('', { query });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const edges = response.data?.data?.metaobjects?.edges;
    if (!edges || !edges.length) return [];

    return edges.map((edge) => edge.node.fields);
  } catch (error) {
    throw error;
  }
};
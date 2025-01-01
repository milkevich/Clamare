// src/utils/auth.js
import client from './shopify';

/**
 * Sign up a new customer
 * @param {string} email
 * @param {string} password
 * @param {string} firstName
 * @param {string} lastName
 * @returns {object} Customer object or errors
 */
export const signUp = async (email, password, firstName, lastName) => {
  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = { input: { email, password, firstName, lastName } };

  try {
    const response = await client.post('', { query: mutation, variables });
    const { customer, customerUserErrors } = response.data.data.customerCreate;

    if (customerUserErrors.length > 0) {
      return { errors: customerUserErrors };
    }

    // Automatically log in the user after sign up
    const loginResult = await logIn(email, password);
    if (loginResult.customerAccessToken) {
      return { customer, customerAccessToken: loginResult.customerAccessToken };
    }

    return { customer };
  } catch (error) {
    console.error('Error signing up:', error);
    return { errors: [{ message: 'An unexpected error occurred.' }] };
  }
};

/**
 * Log in a customer
 */
export const logIn = async (email, password) => {
  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = { input: { email, password } };

  try {
    const response = await client.post('', { query: mutation, variables });
    const { customerAccessToken, customerUserErrors } = response.data.data.customerAccessTokenCreate;

    if (customerUserErrors.length > 0) {
      return { errors: customerUserErrors };
    }

    return { customerAccessToken };
  } catch (error) {
    console.error('Error logging in:', error);
    return { errors: [{ message: 'An unexpected error occurred.' }] };
  }
};

/**
 * Log out a customer
 * @param {string} accessToken
 * @returns {object} success or errors
 */
export const logOut = async (accessToken) => {
  const mutation = `
    mutation customerAccessTokenDelete($input: CustomerAccessTokenDeleteInput!) {
      customerAccessTokenDelete(input: $input) {
        deletedAccessToken
        deletedCustomerAccessTokenId
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      accessToken,
    },
  };

  try {
    const response = await client.post('', {
      query: mutation,
      variables,
    });

    const { deletedAccessToken, userErrors } = response.data.data.customerAccessTokenDelete;

    if (userErrors.length > 0) {
      return { errors: userErrors };
    }

    return { deletedAccessToken };
  } catch (error) {
    console.error('Error logging out:', error);
    return { errors: [{ message: 'An unexpected error occurred.' }] };
  }
};

/**
 * Fetch customer information using access token
 * @param {string} accessToken
 * @returns {object} Customer data or errors
 */
export const fetchCustomer = async (accessToken) => {
  const query = `
    query customer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        email
        firstName
        lastName
      }
    }
  `;

  const variables = {
    customerAccessToken: accessToken,
  };

  try {
    const response = await client.post(
      '',
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          // Including Authorization header is optional here since we're passing the token as a variable
          // 'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Fetch Customer Response:', response.data);

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      return { errors: response.data.errors };
    }

    if (!response.data.data) {
      console.error('No data returned:', response.data);
      return { errors: [{ message: 'No data returned from server.' }] };
    }

    const { customer } = response.data.data;

    if (!customer) {
      console.error('Customer not found in response:', response.data.data);
      return { errors: [{ message: 'Customer not found.' }] };
    }

    return { customer };
  } catch (error) {
    console.error('Error fetching customer:', error);
    return { errors: [{ message: 'An unexpected error occurred.' }] };
  }
};

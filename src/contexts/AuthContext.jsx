import React, { createContext, useState, useEffect } from 'react';
import { fetchCustomer, logOut, logIn as apiLogIn, signUp as apiSignUp } from '../utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Function to load customer data on app load
  const loadCustomer = async () => {
    const token = localStorage.getItem('shopify_access_token');
    const expiresAt = localStorage.getItem('shopify_access_token_expires_at');
    if (token && expiresAt && !isTokenExpired(expiresAt)) {
      const result = await fetchCustomer(token);
      if (result.customer) {
        setCustomer(result.customer);
      } else {
        // If fetching customer fails, remove tokens
        localStorage.removeItem('shopify_access_token');
        localStorage.removeItem('shopify_access_token_expires_at');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomer();
  }, []);

  // Function to handle user log out
  const handleLogout = async () => {
    const token = localStorage.getItem('shopify_access_token');
    if (token) {
      await logOut(token);
      localStorage.removeItem('shopify_access_token');
      localStorage.removeItem('shopify_access_token_expires_at');
      setCustomer(null);
    }
  };

  // Function to log in the user
  const logIn = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    const result = await apiLogIn(email, password);
    console.log('AuthContext.logIn result:', result);
    if (result.customerAccessToken) {
      const { accessToken, expiresAt } = result.customerAccessToken;
      localStorage.setItem('shopify_access_token', accessToken);
      localStorage.setItem('shopify_access_token_expires_at', expiresAt);
      const customerResult = await fetchCustomer(accessToken);
      console.log('AuthContext.logIn customerResult:', customerResult);
      if (customerResult.customer) {
        setCustomer(customerResult.customer);
        console.log('Customer set in AuthContext:', customerResult.customer);
      }
    } else if (result.errors) {
      const errorMessages = result.errors.map(err => err.message).join(' ');
      setAuthError(errorMessages);
      console.log('AuthContext.logIn errors:', errorMessages);
    }
    setAuthLoading(false);
    return result;
  };

  // Function to sign up the user
  const signUp = async (email, password, firstName, lastName) => {
    setAuthLoading(true);
    setAuthError(null);
    const result = await apiSignUp(email, password, firstName, lastName);
    console.log('AuthContext.signUp result:', result);
    if (result.customer) { 
      // After sign up, automatically log in the user
      const loginResult = await logIn(email, password);
      console.log('AuthContext.signUp loginResult:', loginResult);
      if (loginResult.customerAccessToken) {
        console.log('User successfully logged in after sign up.');
        setAuthLoading(false);
        return true;
      } else {
        // LogIn failed
        setAuthError('Sign up successful, but log in failed.');
        setAuthLoading(false);
        return false;
      }
    } else if (result.errors) {
      // Aggregate error messages
      const errorMessages = result.errors.map(err => err.message).join(' ');
      setAuthError(errorMessages);
      console.log('AuthContext.signUp errors:', errorMessages);
      setAuthLoading(false);
      return false;
    }
    setAuthLoading(false);
    return false;
  };

  // Periodically check for token expiration
  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiresAt = localStorage.getItem('shopify_access_token_expires_at');
      if (customer && expiresAt) {
        const expiryDate = new Date(expiresAt);
        const now = new Date();

        if (now > expiryDate) {
          alert('Session expired. Please log in again.');
          handleLogout();
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [customer]);

  return (
    <AuthContext.Provider
      value={{
        customer,
        setCustomer,
        handleLogout,
        loading,
        logIn,
        signUp,
        authLoading,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to check token expiration
const isTokenExpired = (expiresAt) => {
  const expiryDate = new Date(expiresAt);
  return new Date() > expiryDate;
};

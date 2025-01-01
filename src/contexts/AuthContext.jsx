// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { fetchCustomer, logOut, logIn as apiLogIn, signUp as apiSignUp } from '../utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const loadCustomer = async () => {
    const token = localStorage.getItem('shopify_access_token');
    const expiresAt = localStorage.getItem('shopify_access_token_expires_at');
    if (token && expiresAt && !isTokenExpired(expiresAt)) {
      const result = await fetchCustomer(token);
      if (result.customer) {
        setCustomer(result.customer);
      } else {
        localStorage.removeItem('shopify_access_token');
        localStorage.removeItem('shopify_access_token_expires_at');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomer();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('shopify_access_token');
    if (token) {
      await logOut(token);
      localStorage.removeItem('shopify_access_token');
      localStorage.removeItem('shopify_access_token_expires_at');
      setCustomer(null);
    }
  };

  const logIn = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    const result = await apiLogIn(email, password);
    if (result.customerAccessToken) {
      const { accessToken, expiresAt } = result.customerAccessToken;
      localStorage.setItem('shopify_access_token', accessToken);
      localStorage.setItem('shopify_access_token_expires_at', expiresAt);
      const customerResult = await fetchCustomer(accessToken);
      if (customerResult.customer) {
        setCustomer(customerResult.customer);
      }
    } else if (result.errors) {
      setAuthError(result.errors);
    }
    setAuthLoading(false);
    return result;
  };

  const signUp = async (email, password, firstName, lastName) => {
    setAuthLoading(true);
    setAuthError(null);
    const result = await apiSignUp(email, password, firstName, lastName);
    if (result.customerAccessToken) { // Ensure the signUp function returns customerAccessToken
      const { accessToken, expiresAt } = result.customerAccessToken;
      localStorage.setItem('shopify_access_token', accessToken);
      localStorage.setItem('shopify_access_token_expires_at', expiresAt);
      const customerResult = await fetchCustomer(accessToken);
      if (customerResult.customer) {
        setCustomer(customerResult.customer);
      }
    } else if (result.errors) {
      setAuthError(result.errors);
    }
    setAuthLoading(false);
    return result;
  };

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiry = () => {
      if (customer && customer.expiresAt) {
        const expiryDate = new Date(customer.expiresAt);
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

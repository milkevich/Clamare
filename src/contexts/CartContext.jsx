// src/contexts/CartContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { fetchCart } from '../utils/cartFetch';
import { removeLineFromCart } from '../utils/cartLinesRemove';
import { addLineToCart } from '../utils/cartLinesAdd';
import { createCart } from '../utils/cartCreate';
import { updateCartLineQuantity } from '../utils/cartLinesUpdate';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBagOpened, setIsBagOpened] = useState(false);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const storedCartId = localStorage.getItem('shopifyCartId');
        if (!storedCartId) {
          setCart(null);
          setLoading(false);
          return;
        }
        const fetchedCart = await fetchCart(storedCartId);
        setCart(fetchedCart);
      } catch (err) {
        setError('Failed to load cart.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  // Create a new cart
  const createNewCart = async (variantId, quantity) => {
    try {
      const newCart = await createCart(variantId, quantity);
      localStorage.setItem('shopifyCartId', newCart.id);
      setCart(newCart);
    } catch (err) {
      throw err;
    }
  };

  // Add item to cart
  const addItemToCart = async (variantId, quantity) => {
    try {
      if (!cart) {
        await createNewCart(variantId, quantity);
      } else {
        const updatedCart = await addLineToCart(cart.id, variantId, quantity);
        setCart(updatedCart);
      }
    } catch (err) {
      throw err;
    }
  };

  // Remove item from cart
  const removeItemFromCart = async (lineId) => {
    try {
      if (!cart) {
        return;
      }
      const updatedCart = await removeLineFromCart(cart.id, [lineId]);
      setCart(updatedCart);
      if (updatedCart.lines.edges.length === 0) {
        localStorage.removeItem('shopifyCartId');
        localStorage.removeItem('shopify_checkout_id'); 
        setCart(null);
      }
    } catch (err) {
      throw err;
    }
  };

  const refreshCart = async () => {
    try {
      const storedCartId = localStorage.getItem('shopifyCartId');
      if (!storedCartId) {
        setCart(null);
        return;
      }
      const fetchedCart = await fetchCart(storedCartId);
      setCart(fetchedCart);
    } catch (err) {
      setError('Failed to refresh cart.');
    }
  };

  const updateCartLineQuantityFn = async (lineId, delta) => {
    try {
      if (!cart) {
        return;
      }

      const line = cart.lines.edges.find(edge => edge.node.id === lineId);
      if (!line) {
        return;
      }

      const newQuantity = line.node.quantity + delta;

      if (newQuantity <= 0) {
        await removeItemFromCart(lineId);
      } else {
        const updatedCart = await updateCartLineQuantity(cart.id, lineId, newQuantity);
        setCart(updatedCart);
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addItemToCart,
        removeItemFromCart,
        refreshCart,
        setIsBagOpened,
        isBagOpened,
        updateCartLineQuantityFn
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

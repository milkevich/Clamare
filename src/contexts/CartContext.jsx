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

  // Fetch cart on initial load
  useEffect(() => {
    const fetchCartData = async () => {
      console.log('Fetching cart data...');
      try {
        const storedCartId = localStorage.getItem('shopifyCartId');
        if (!storedCartId) {
          console.log('No cart found in localStorage.');
          setCart(null);
          setLoading(false);
          return;
        }
        const fetchedCart = await fetchCart(storedCartId);
        console.log('Fetched cart:', fetchedCart);
        setCart(fetchedCart);
      } catch (err) {
        console.error('Error fetching cart:', err);
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
      console.log('Creating new cart with variantId:', variantId, 'quantity:', quantity);
      const newCart = await createCart(variantId, quantity);
      console.log('Created new cart:', newCart);
      localStorage.setItem('shopifyCartId', newCart.id);
      setCart(newCart);
    } catch (err) {
      console.error('Error creating cart:', err);
      throw err;
    }
  };

  // Add item to cart
  const addItemToCart = async (variantId, quantity) => {
    try {
      console.log('addItemToCart called with variantId:', variantId, 'quantity:', quantity);
      if (!cart) {
        await createNewCart(variantId, quantity);
      } else {
        const updatedCart = await addLineToCart(cart.id, variantId, quantity);
        console.log('Updated cart after adding item:', updatedCart);
        setCart(updatedCart);
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      throw err;
    }
  };

  // Remove item from cart
  const removeItemFromCart = async (lineId) => {
    try {
      if (!cart) {
        console.log('No cart to remove items from.');
        return;
      }
      console.log('Removing item with lineId:', lineId);
      const updatedCart = await removeLineFromCart(cart.id, [lineId]);
      console.log('Updated cart after removing item:', updatedCart);
      setCart(updatedCart);
      if (updatedCart.lines.edges.length === 0) {
        console.log('Cart is empty. Removing cartId from localStorage.');
        localStorage.removeItem('shopifyCartId');
        setCart(null);
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
      throw err;
    }
  };

  // Refresh cart data
  const refreshCart = async () => {
    try {
      console.log('Refreshing cart...');
      const storedCartId = localStorage.getItem('shopifyCartId');
      if (!storedCartId) {
        console.log('No cart found in localStorage.');
        setCart(null);
        return;
      }
      const fetchedCart = await fetchCart(storedCartId);
      console.log('Fetched cart during refresh:', fetchedCart);
      setCart(fetchedCart);
    } catch (err) {
      console.error('Error refreshing cart:', err);
      setError('Failed to refresh cart.');
    }
  };

  const updateCartLineQuantityFn = async (lineId, delta) => {
    try {
      if (!cart) {
        console.log('No cart available.');
        return;
      }

      const line = cart.lines.edges.find(edge => edge.node.id === lineId);
      if (!line) {
        console.warn(`Line ID ${lineId} not found in cart.`);
        return;
      }

      const newQuantity = line.node.quantity + delta;

      if (newQuantity <= 0) {
        // If new quantity is 0 or less, remove the item
        await removeItemFromCart(lineId);
      } else {
        // Otherwise, update the quantity
        const updatedCart = await updateCartLineQuantity(cart.id, lineId, newQuantity);
        console.log('Updated cart after quantity change:', updatedCart);
        setCart(updatedCart);
      }
    } catch (err) {
      console.error('Error updating cart line quantity:', err);
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

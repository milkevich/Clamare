// src/components/Header.jsx
import React, { useState, useContext } from 'react';
import clamareSingleLogo from '../assets/clamareSingleLogo.png';
import s from '../shared/Header.module.scss';
import { useNavigate } from 'react-router-dom';
import { Fade, Slide } from '@mui/material';
import ShoppingBag from './ShoppingBag';
import { CartContext } from '../contexts/CartContext';

const Header = () => {
  const navigate = useNavigate();
  // Consume CartContext
  const { cart, loading, error, isBagOpened, setIsBagOpened } = useContext(CartContext);

  const toggleBag = () => {
    setIsBagOpened((prev) => !prev);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Calculate total quantity for the "BAG" count
  const totalQuantity = cart?.lines?.edges?.reduce((sum, edge) => sum + edge.node.quantity, 0) || 0;

  return (
    <div style={{ position: 'sticky', top: 0, width: '100%', left: 0, zIndex: 100 }}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <img
            onClick={() => handleNavigate('/')}
            className={s.headerLogo}
            src={clamareSingleLogo}
            alt="Clamáre Logo"
          />
          <div className={s.headerNav}>
            <p onClick={() => handleNavigate('/products/all')} className={s.headerLink}>
              SHOP
            </p>
            <p onClick={() => handleNavigate('/pages/magazine')} className={s.headerLink}>
              MAGAZINE
            </p>
          </div>
        </div>
        <div className={s.headerRight}>
          <p onClick={() => handleNavigate('/account')} className={s.headerLink}>
            ACCOUNT
          </p>
          <p onClick={toggleBag} className={s.headerLink}>
            BAG {totalQuantity > 0 && `(${totalQuantity})`}
          </p>
        </div>
      </div>

      {/* Overlay */}
      <Fade in={isBagOpened} timeout={300}>
        <div
          onClick={toggleBag} // Close the bag when clicking outside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            zIndex: 5,
          }}
        />
      </Fade>

      {/* Shopping Bag Slide */}
      <Slide in={isBagOpened} direction="left">
        <div
          style={{
            zIndex: 10,
            position: 'fixed',
            right: 0,
            top: 0,
            height: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div
            onClick={toggleBag}
            style={{
              width: '100%',
              maxWidth: '870px',
              cursor: 'w-resize',
            }}
          />
          <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'var(--main-bg-color)' }}>
            <ShoppingBag onClose={toggleBag} onCheckout={toggleBag} />
          </div>
        </div>
      </Slide>
    </div>
  );
};

export default Header;

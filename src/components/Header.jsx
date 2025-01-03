// src/components/Header.jsx
import React, { useState, useContext, useEffect } from 'react';
import clamareSingleLogo from '../assets/clamareSingleLogo.png';
import s from '../shared/Header.module.scss';
import { useNavigate } from 'react-router-dom';
import { Fade, Slide } from '@mui/material';
import ShoppingBag from './ShoppingBag';
import { CartContext } from '../contexts/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
          const handleResize = () => {
              setIsSmallScreen(window.innerWidth <= 500);
          };
  
          handleResize();
  
          window.addEventListener('resize', handleResize);
  
          return () => {
              window.removeEventListener('resize', handleResize);
          };
      }, []);

  const { cart, loading, error, isBagOpened, setIsBagOpened } = useContext(CartContext);

  const toggleBag = () => {
    setIsBagOpened((prev) => !prev);
  };

  useEffect(() => {
    if (isBagOpened) {
      document.body.style.overflow = 'hidden';
    } else if (!isBagOpened) {
      document.body.style.overflow = '';
    }
  }, [isBagOpened])

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

      <Slide in={isBagOpened} direction={isSmallScreen ? 'up' : 'left'}>
        <div
          className={s.slideContainer}
        >
          <div
            onClick={toggleBag}
            style={{
              width: 'calc(100% - 500px)',
              cursor: 'w-resize',
            }}
          />
          <div className={s.shoppingBagContainer}>
            <ShoppingBag onClose={toggleBag} onCheckout={toggleBag} />
          </div>
        </div>
      </Slide>
    </div>
  );
};

export default Header;

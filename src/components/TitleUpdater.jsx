import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case '/clothing/shop':
        document.title = 'Shop all - Clamáre';
        break;
        case '/':
        document.title = 'Clamáre';
        break;
        case '/pages/magazine':
        document.title = 'Magazine - Clamáre';
        break;
        case '/account/login':
        document.title = 'Log In - Clamáre';
        break;
        case '/account':
        document.title = 'Account - Clamáre';
        break;
        case '/bag':
        document.title = 'Shopping bag - Clamáre';
        break;
        case '/pages/support':
        document.title = 'Customer Support - Clamáre';
        break;
        case '/pages/journey':
        document.title = 'Journey - Clamáre';
        break;
        case '/pages/contact':
        document.title = 'Contact - Clamáre';
        break;
        
      default:
        document.title = 'Clamáre';
    }
  }, [location.pathname]);

  return null;
};

export default TitleUpdater;

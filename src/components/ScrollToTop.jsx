import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const excludedRoutes = [
      '/pages/support/customer-service',
      '/pages/support/customer-service/faq',
      '/pages/support/customer-service/contact',
      '/pages/support/customer-service/legal',
    ];

    if (!excludedRoutes.includes(pathname)) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;

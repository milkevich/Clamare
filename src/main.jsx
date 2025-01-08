import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom';
import App from './App.jsx';
import ReactDOM from 'react-dom/client';
import AccountScreen from './screens/AccountScreen.jsx';
import Protected from './Protected.jsx';
import ShopScreen from './screens/ShopScreen.jsx';
import LandingScreen from './screens/LandingScreen.jsx';
import SupportScreen from './screens/SupportScreen.jsx';
import ClothingItemScreen from './screens/ClothingItemScreen.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import Magazine from './screens/Magazine.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import LogInScreen from './screens/LogInScreen.jsx';
import SignUpScreen from './screens/SignUpScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import NotFound from './screens/NotFound.jsx';
import OrderScreen from './screens/OrderScreen.jsx'; 
import MagazineItem from './screens/MagazineItem.jsx';
import ManageAddresses from './screens/ManageAddresses.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<LandingScreen />} />
      <Route path='products/all' element={<ShopScreen />} />
      <Route path='products/*' element={<ShopScreen />} />
      <Route path='pages/support/customer-service' element={<SupportScreen />} />
      <Route path='pages/support/customer-service/faq' element={<SupportScreen />} />
      <Route path='pages/support/customer-service/contact' element={<SupportScreen />} />
      <Route path='pages/support/customer-service/legal' element={<SupportScreen />} />
      <Route path="products/:handle" element={<ClothingItemScreen />} />
      <Route path="pages/magazine" element={<Magazine />} />
      <Route path="pages/magazine/:magazineId/:magazineTitle" element={<MagazineItem />} />
      <Route element={<Protected />}>
        <Route path='account' element={<AccountScreen />} />
        <Route path='account/orders/:orderId' element={<OrderScreen />} /> 
        <Route path='account/manage/addresses' element={<ManageAddresses />} /> 
      </Route>
      <Route path='account/login' element={<LogInScreen />} />
      <Route path='account/sign-up' element={<SignUpScreen />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CartProvider>
    <AuthProvider>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  </CartProvider>
);
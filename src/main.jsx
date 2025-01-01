import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom';
import App from './App.jsx'
import ReactDOM from 'react-dom/client';
import AccountScreen from './screens/AccountScreen.jsx';
import Protected from './Protected.jsx';
import ShopScreen from './screens/ShopScreen.jsx';
import LandingScreen from './screens/LandingScreen.jsx'
import SupportScreen from './screens/SupportScreen.jsx';
import ClothingItemScreen from './screens/ClothingItemScreen.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import Magazine from './screens/Magazine.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import LogInScreen from './screens/LogInScreen.jsx';
import SignUpScreen from './screens/SignUpScreen.jsx';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='/' element={<LandingScreen />} />
      <Route path='/products/all' element={<ShopScreen />} />
      <Route path='/pages/support/customer-service' element={<SupportScreen />} />
      <Route path='/pages/support/contact' element={<SupportScreen />} />
      <Route path="/products/:handle" element={<ClothingItemScreen />} />
      <Route path="/pages/magazine" element={<Magazine />} />
      <Route path="/:shopId/orders/:orderId/authenticate" element={<OrderConfirmationScreen />} />
      <Route element={<Protected />}>
        <Route path='/account' element={<AccountScreen />} />
      </Route>
      <Route path='/account/login' element={<LogInScreen />} />
      <Route path='/account/sign-up' element={<SignUpScreen />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CartProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </CartProvider>
);
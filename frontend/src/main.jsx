import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Footer from './components/Footer.jsx';
import 'virtual:windi.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/utilities.css';
import './styles/theme.css';
import { createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/features/store.js';
import { ClerkProvider } from '@clerk/clerk-react';

import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

// Private routes
import PrivateRoutes from './components/PrivateRoutes.jsx';
import Profile from './pages/Users/Profile.jsx';
import ShopLinkRewards from './pages/Users/ShopLinkRewards.jsx';

// Admin routes
import AdminRoutes from './pages/Admin/AdminRoutes.jsx';
import UserList from './pages/Admin/UserList.jsx';
import CategoryList from './pages/Admin/CategoryList.jsx';
import ProductList from './pages/Admin/ProductList.jsx';
import ProductUpdate from './pages/Admin/ProductUpdate.jsx';
import AllProducts from './pages/Admin/AllProducts.jsx';
import OrderList from './pages/Admin/OrderList.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import ShopList from './components/ShopList.jsx';
import UpdateShop from './pages/Admin/UpdateShop.jsx';
import AddShop from './pages/shops/AddShop.jsx';
import MyShopWorkspace from './pages/Admin/MyShopWorkspace.jsx';
import SellerApplications from './pages/Admin/SellerApplications.jsx';
import RiderApplications from './pages/Admin/RiderApplications.jsx';

// Frontend pages
import HomeUpdated1 from './pages/HomeUpdated1.jsx';
import ClerkAuth from './pages/Auth/ClerkAuth.jsx';
import Favorites from './pages/products/Favorites.jsx';
import ProductDetails from './pages/products/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import ShopUpdated from './pages/ShopUpdated.jsx';
import ShopDetail from './pages/shops/ShopDetail.jsx';
import Mall from './pages/shops/Mall.jsx';
const MallDirectory = lazy(() => import('./pages/shops/MallDirectory.jsx'));
const MallExperience = lazy(() => import('./pages/shops/MallExperience.jsx'));
import Shipping from './pages/Orders/Shipping.jsx';
import PlaceOrder from './pages/Orders/PlaceOrder.jsx';
import Order from './pages/Orders/Order.jsx';
import MyOrders from './pages/Orders/MyOrders.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import RideBodaPage from './pages/RideBodaPage.jsx';
import SellerApplicationPage from './pages/SellerApplicationPage.jsx';
import StudentFriendly from './pages/StudentFriendly.jsx';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorBoundary />}>
      {/* Public routes */}
      <Route index element={<HomeUpdated1 />} />
      <Route path="clerk-auth/sso-callback" element={<ClerkAuth />} />
      <Route path="clerk-auth/*" element={<ClerkAuth />} />
      <Route path="clerk-auth" element={<ClerkAuth />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="favorite" element={<Favorites />} />
      <Route path="community" element={<CommunityPage />} />
      <Route path="ride-boda" element={<RideBodaPage />} />
      <Route path="riders" element={<RideBodaPage />} />
      <Route path="student-friendly" element={<StudentFriendly />} />
      <Route path="seller/apply" element={<SellerApplicationPage />} />
      <Route path="product/:id" element={<ProductDetails />} />
      <Route path="cart" element={<Cart />} />
      <Route path="shop" element={<ShopUpdated />} />
      <Route path="shops/:id" element={<ShopDetail />} />
      <Route path="shops/all" element={<Mall />} />
      <Route path="malls" element={<Suspense fallback={<div className="p-8 text-center">Loading malls…</div>}><MallDirectory /></Suspense>} />
      <Route path="malls/:mallId" element={<Suspense fallback={<div className="p-8 text-center">Loading mall…</div>}><MallExperience /></Suspense>} />

      {/* Private routes */}
      <Route element={<PrivateRoutes />}>
        <Route path="profile" element={<Profile />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="my-rewards" element={<ShopLinkRewards />} />
      </Route>

      {/* Public routes needed for guest checkout */}
      <Route path="shipping" element={<Shipping />} />
      <Route path="placeorder" element={<PlaceOrder />} />
      <Route path="order/:id" element={<Order />} />

      {/* Admin routes */}
      <Route path="admin" element={<AdminRoutes />}>
        <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="my-shop" element={<MyShopWorkspace />} />
          <Route path="users" element={<UserList />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="sellers" element={<SellerApplications />} />
        <Route path="productlist" element={<ProductList />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />

        {/* Shop management */}
        <Route path="shops" element={<ShopList />} />
        <Route path="shop/update/:id" element={<UpdateShop />} />
        <Route path="shop/add" element={<AddShop />} />

        <Route path="orderlist" element={<OrderList />} />
        <Route path="riders" element={<RiderApplications />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <PayPalScriptProvider
        options={{
          'client-id': 'AVAGZFhfvoeAp1LJlvNDtAALlmeY5tdtTxmQJ-cFCX8TiJeSW7oEeQ_VYA32UVLlOIkz9fxV-H5XRMt8',
          currency: 'USD',
        }}
      >
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </PayPalScriptProvider>
    </ClerkProvider>
  </Provider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Link,
} from "react-router-dom";
import { FaArrowRight, FaHome } from "react-icons/fa";
import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/clerk-react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import "virtual:windi.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/utilities.css";
import "./styles/theme.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import PrivateRoutes from "./components/PrivateRoutes.jsx";
import Profile from "./pages/Users/Profile.jsx";
import AdminRoutes from "./pages/Admin/AdminRoutes.jsx";
import UserList from "./pages/Admin/UserList.jsx";
import CategoryList from "./pages/Admin/CategoryList.jsx";
import ProductList from "./pages/Admin/ProductList.jsx";
import ProductUpdate from "./pages/Admin/ProductUpdate.jsx";
import AllProducts from "./pages/Admin/AllProducts.jsx";
import OrderList from "./pages/Admin/OrderList.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import MyShopWorkspace from "./pages/Admin/MyShopWorkspace.jsx";
import SellerApplications from "./pages/Admin/SellerApplications.jsx";
import ShopList from "./components/ShopList.jsx";
import UpdateShop from "./pages/Admin/UpdateShop.jsx";
import AddShop from "./pages/shops/AddShop.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ClerkAuth from "./pages/Auth/ClerkAuth.jsx";
import HomeUpdated1 from "./pages/HomeUpdated1.jsx";
import Favorites from "./pages/products/Favorites.jsx";
import ProductDetails from "./pages/products/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import ShopUpdated from "./pages/ShopUpdated.jsx";
import ShopDetail from "./pages/shops/ShopDetail.jsx";
import Mall from "./pages/shops/Mall.jsx";
import Shipping from "./pages/Orders/Shipping.jsx";
import PlaceOrder from "./pages/Orders/PlaceOrder.jsx";
import Order from "./pages/Orders/Order.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import RideBodaPage from "./pages/RideBodaPage.jsx";
import RiderApplications from "./pages/Admin/RiderApplications.jsx";
import SellerApplicationPage from "./pages/SellerApplicationPage.jsx";
import StudentFriendly from "./pages/StudentFriendly.jsx";
import store from "./redux/features/store.js";

const NotFound = () => (
  <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
    <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-xl text-emerald-800">
      <FaHome aria-hidden="true" />
    </span>
    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Page not found</p>
    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Let’s get you back on track.</h1>
    <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">That page may have moved. Head home or explore the shops and products.</p>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-800 px-5 font-bold text-white">
        <FaHome aria-hidden="true" /> Home
      </Link>
      <Link to="/shops/all" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-5 font-bold text-slate-800">
        Explore shops <FaArrowRight aria-hidden="true" />
      </Link>
    </div>
  </main>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorBoundary />}>
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
      <Route path="shipping" element={<Shipping />} />
      <Route path="placeorder" element={<PlaceOrder />} />
      <Route path="order/:id" element={<Order />} />

      <Route element={<PrivateRoutes />}>
        <Route path="profile" element={<Profile />} />
      </Route>

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
        <Route path="shops" element={<ShopList />} />
        <Route path="shop/update/:id" element={<UpdateShop />} />
        <Route path="shop/add" element={<AddShop />} />
        <Route path="orderlist" element={<OrderList />} />
        <Route path="riders" element={<RiderApplications />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const root = document.getElementById("root");
if (!root) throw new Error("The ShopLink root element is missing.");

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <PayPalScriptProvider
          options={{
            "client-id": "AVAGZFhfvoeAp1LJlvNDtAALlmeY5tdtTxmQJ-cFCX8TiJeSW7oEeQ_VYA32UVLlOIkz9fxV-H5XRMt8",
            currency: "USD",
          }}
        >
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </PayPalScriptProvider>
      </ClerkProvider>
    </Provider>
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
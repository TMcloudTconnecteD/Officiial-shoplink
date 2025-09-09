import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Footer from './components/Footer.jsx'
import 'virtual:windi.css'
import { createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/features/store.js'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
//privateroutes
import PrivateRoutes from './components/PrivateRoutes.jsx'
import Profile from './pages/Users/Profile.jsx'
import AdminRoutes from './pages/Admin/AdminRoutes.jsx'
import UserList from './pages/Admin/UserList.jsx'
import CategoryList from './pages/Admin/CategoryList.jsx'
import ProductList from './pages/Admin/ProductList.jsx'
import ProductUpdate from './pages/Admin/ProductUpdate.jsx'
import AllProducts from './pages/Admin/AllProducts.jsx'
import Home from "./pages/Home.jsx";
import Favorites from "./pages/products/Favorites.jsx";
import ProductDetails from "./pages/products/ProductDetails.jsx";

import Cart from "./pages/Cart.jsx";

import AddShop from './pages/shops/AddShop.jsx'
import ShopDetail from './pages/shops/ShopDetail.jsx'

import Shipping from "./pages/Orders/Shipping.jsx";
import PlaceOrder from "./pages/Orders/PlaceOrder.jsx";
import Order from "./pages/Orders/Order.jsx";
import OrderList from "./pages/Admin/OrderList.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ShopUpdated from './pages/ShopUpdated.jsx'
//import HomeUpdated from './pages/HomeUpdated.jsx'
import ShopList from './components/ShopList.jsx'
import Mall from './pages/shops/Mall.jsx'
import HomeUpdated1 from './pages/HomeUpdated1.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} >
        <Route path = '/login' element = {<Login />} />
        <Route path = '/register' element = {<Register />} />
        <Route index={true} path="/" element={<HomeUpdated1 />} />
        <Route path="/favorite" element={<Favorites />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop" element={<ShopUpdated />} />
        <Route path="/shops/:id" element={<ShopDetail />} />
        <Route path='/shops/all' element={<Mall />} />

         <Route path='' element={<PrivateRoutes />}>
             <Route path='/profile' element={<Profile />} />
             <Route path="/shipping" element={<Shipping />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<Order />} />
          </Route>
         
         {/* admin routes */}
        
         <Route path='/admin' element={<AdminRoutes />} >
            <Route path='users' element={<UserList />} />
            <Route path='categories' element={<CategoryList />} />
            <Route path="productlist" element={<ProductList />} />
            <Route path='productlist/:pageNumber' element={<ProductList />} />
            <Route path='allproductslist' element={<AllProducts />} />
            <Route path='product/update/:_id' element={<ProductUpdate />} />
            <Route path='shops/all' element={<Mall />} />
            <Route path='shops' element={< AddShop/>} />
            <Route path="orderlist" element={<OrderList />} />
            <Route path="dashboard" element={<AdminDashboard />} />
         </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>

    <PayPalScriptProvider>

    <>
      <RouterProvider router={router} />
      <Footer />
    </>

    </PayPalScriptProvider>
      
  </Provider>
  
  );

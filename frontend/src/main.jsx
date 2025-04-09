import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'virtual:windi.css'
import { createRoutesFromElements, Route, RouterProvider } from 'react-router'
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
import Shop from "./pages/Shop.jsx";



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} >
        <Route path = '/login' element = {<Login />} />
        <Route path = '/register' element = {<Register />} />
        <Route index={true} path="/" element={<Home />} />
        <Route path="/favorite" element={<Favorites />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop" element={<Shop />} />

         <Route path='' element={<PrivateRoutes />}>
             <Route path='/profile' element={<Profile />} />
          </Route>
         
         {/* admin routes */}
        
         <Route path='/admin' element={<AdminRoutes />}>
            <Route path='users' element={<UserList />} />
            <Route path='categories' element={<CategoryList />} />
            <Route path="productlist" element={<ProductList />} />
            <Route path='productlist/:pageNumber' element={<ProductList />} />
            <Route path='allproductslist' element={<AllProducts />} />
            <Route path='product/update/:_id' element={<ProductUpdate />} />
         </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router} />
    
  </Provider>
  
  );
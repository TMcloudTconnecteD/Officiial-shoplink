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




const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} >
        <Route path = '/login' element = {<Login />} />
        <Route path = '/register' element = {<Register />} />

         <Route path='' element={<PrivateRoutes />}>
             <Route path='/profile' element={<Profile />} />
          </Route>
         
         {/* admin routes */}
        
         <Route path='/admin' element={<AdminRoutes />}>
            <Route path='users' element={<UserList />} />
         </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router} />
    
  </Provider>
  
  );
import React, { useState } from 'react'
import {
  AiOutlineHome, AiOutlineUserAdd, AiOutlineShopping,
  AiOutlineLogin, AiOutlineShoppingCart, AiOutlineShop,
  AiOutlineMenu
} from 'react-icons/ai'
import { FaHeartbeat } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../redux/Api/usersApiSlice.js'
import { logout } from '../../redux/features/auth/authSlice.js'
import FavoritesCount from '../products/FavoritesCount.jsx'

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoutApiCall] = useLogoutMutation()

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap()
      dispatch(logout())
      navigate('/login')
    } catch (error) {
      console.error('Logout Failed', error)
      alert('Logout failed. Please try again.')
    }
  }

  return (
    <>
      {/* Toggle button (always visible) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
      >
        <AiOutlineMenu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-black text-white flex flex-col justify-between transition-all duration-300 ease-in-out z-40
        ${open ? 'w-56' : 'w-0'} `}
      >
        {/* Links */}
        <div className="flex flex-col mt-20 space-y-6 px-3">
          <Link to="/" className="flex items-center space-x-2 hover:text-orange-400">
            <AiOutlineHome size={24} />
            {open && <span>Home</span>}
          </Link>

          <Link to="/shop" className="flex items-center space-x-2 hover:text-orange-400">
            <AiOutlineShopping size={24} />
            {open && <span>Shop</span>}
          </Link>

          <Link to="/Admin/shops" className="flex items-center space-x-2 hover:text-orange-400">
            <AiOutlineShop size={24} />
            {open && <span>Mall</span>}
          </Link>

          <Link to="/cart" className="flex items-center space-x-2 hover:text-orange-400 relative">
            <AiOutlineShoppingCart size={24} />
            {open && <span>Cart</span>}
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-xs px-1 rounded-full">
                {cartItems.reduce((a, c) => a + c.qty, 0)}
              </span>
            )}
          </Link>

          <Link to="/favorite" className="flex items-center space-x-2 hover:text-orange-400">
            <FaHeartbeat size={20} className="text-red-500" />
            {open && (
              <>
                <span>Favorites</span>
                <FavoritesCount />
              </>
            )}
          </Link>
        </div>

        {/* Bottom auth section */}
        <div className="mb-8 px-3">
          {userInfo ? (
            <div className="flex flex-col space-y-3">
              <Link to="/profile" className="hover:text-orange-400">
                {open ? 'Profile' : <AiOutlineUserAdd size={22} />}
              </Link>
              <button
                onClick={logoutHandler}
                className="text-left hover:text-orange-400"
              >
                {open ? 'Logout' : <AiOutlineLogin size={22} />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Link to="/login" className="hover:text-orange-400 flex items-center space-x-2">
                <AiOutlineLogin size={22} />
                {open && <span>Login</span>}
              </Link>
              <Link to="/register" className="hover:text-orange-400 flex items-center space-x-2">
                <AiOutlineUserAdd size={22} />
                {open && <span>Register</span>}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Navigation

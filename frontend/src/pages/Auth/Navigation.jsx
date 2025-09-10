import React, { useState } from 'react'
import {
  AiOutlineHome,
  AiOutlineUserAdd,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineShoppingCart,
  AiOutlineShop,
  AiOutlineMenu,
  AiOutlineClose,
} from 'react-icons/ai'
import { FaHeartbeat } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../redux/Api/usersApiSlice.js'
import { logout } from '../../redux/features/auth/authSlice.js'
import './Navigation.css'
import FavoritesCount from '../products/FavoritesCount.jsx'

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

  const [dropdownOpen, setDropDownOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const toggleDropdown = () => setDropDownOpen(!dropdownOpen)
  const toggleSidebar = () => setOpen(!open)
  const closeSidebar = () => setOpen(false)

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

  const handleOptionClick = () => {
    setDropDownOpen(false)
    closeSidebar()
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value)

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchTerm.trim()) {
        navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`)
        setSearchTerm('')
        closeSidebar()
      }
    }
  }

  return (
    <>
      {/* Centered Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-1/2 left-4 -translate-y-1/2 z-50 p-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
      >
        {open ? <AiOutlineClose size={26} /> : <AiOutlineMenu size={26} />}
      </button>

      {/* Sidebar */}
      <div
        style={{ zIndex: 9999 }}
        className={`fixed top-0 left-0 h-screen bg-black text-white flex flex-col justify-between p-4 transition-all duration-300 ease-in-out
        ${open ? 'w-56' : 'w-0 overflow-hidden'} `}
      >
        {/* Search Bar */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
          placeholder="Search..."
          className="mb-4 p-2 rounded bg-gray-800 text-white focus:outline-none"
        />

        {/* Menu Links */}
        <div className="flex flex-col justify-center space-y-4">
          <Link to="/" onClick={closeSidebar} className="flex items-center hover:translate-x-2 transition">
            <AiOutlineHome className="mr-2 text-cyan-500" size={26} />
            <span className="nav-item-name">Home</span>
          </Link>

          <Link to="/shop" onClick={closeSidebar} className="flex items-center hover:translate-x-2 transition">
            <AiOutlineShopping className="mr-2 text-cyan-500" size={26} />
            <span className="nav-item-name">Shop</span>
          </Link>

          <Link to="/Admin/shops" onClick={closeSidebar} className="flex items-center hover:translate-x-2 transition">
            <AiOutlineShop className="mr-2 text-cyan-500" size={26} />
            <span className="nav-item-name">Mall</span>
          </Link>

          <Link to="/cart" onClick={closeSidebar} className="flex items-center relative hover:translate-x-2 transition">
            <AiOutlineShoppingCart className="mr-2 text-cyan-500" size={26} />
            <span className="nav-item-name">Cart</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 left-6 px-1 py-0 text-sm text-white bg-pink-500 rounded-full">
                {cartItems.reduce((a, c) => a + c.qty, 0)}
              </span>
            )}
          </Link>

          <Link to="/favorite" onClick={closeSidebar} className="flex items-center hover:translate-x-2 transition">
            <FaHeartbeat className="mr-2 text-red-500" size={20} />
            <span className="nav-item-name">Favorites</span>
            <FavoritesCount />
          </Link>
        </div>

        {/* Dropdown for logged-in user */}
        <div className="relative">
          {userInfo && (
            <>
              <button onClick={toggleDropdown} className="flex items-center">
                <span className="text-white">{userInfo.username}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={dropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <ul className="absolute left-0 w-[11rem] bg-white text-gray-800 p-2 rounded shadow-lg space-y-2 z-50">
                  {userInfo.isAdmin && (
                    <>
                      <li>
                        <Link to="admin/productlist" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-gray-100">
                          Products
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/orderlist" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-gray-100">
                          Orders
                        </Link>
                      </li>
                    </>
                  )}

                  {userInfo.isSuperAdmin && (
                    <>
                      <li>
                        <Link to="/Admin/shops" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-gray-100">
                          Super Admin
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/users" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-gray-100">
                          Users
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/categories" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-gray-100">
                          Category
                        </Link>
                      </li>
                    </>
                  )}

                  <li>
                    <Link to="/profile" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button onClick={logoutHandler} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </>
          )}

          {!userInfo && (
            <ul>
              <li>
                <Link to="/login" onClick={closeSidebar} className="flex items-center hover:translate-x-2 transition">
                  <AiOutlineLogin className="mr-2 text-white" size={26} />
                  <span className="nav-item-name">Login</span>
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={closeSidebar} className="flex items-center hover:translate-x-2 transition">
                  <AiOutlineUserAdd className="mr-2 text-white" size={26} />
                  <span className="nav-item-name">Register</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default Navigation

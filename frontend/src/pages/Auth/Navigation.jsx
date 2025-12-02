import React, { useState, useEffect, useRef } from 'react'
import {
  AiOutlineHome,
  AiOutlineUserAdd,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineShoppingCart,
  AiOutlineShop,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineSearch,
} from 'react-icons/ai'
import { FaHeart, FaStore } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../redux/Api/usersApiSlice.js'
import { logout } from '../../redux/features/auth/authSlice.js'
import FavoritesCount from '../products/FavoritesCount.jsx'
import Fuse from 'fuse.js'

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoutApiCall] = useLogoutMutation()

  const [search, setSearch] = useState("")
  const searchRef = useRef()

  const [dropdownOpen, setDropdownOpen] = useState(false)

  const cartCount = cartItems?.reduce((a, c) => a + c.qty, 0) || 0

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap()
    } catch (e) {
      // ignore
    } finally {
      dispatch(logout())
      navigate("/login")
    }
  }

  const toggleDropdown = () => setDropdownOpen((prev) => !prev)

  const handleOptionClick = () => setDropdownOpen(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setSearch("")
        searchRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(search.trim())}`)
      setSearch("")
    }
  }

  return (
    <>
      <nav className="backdrop-glass border-b border-white/8 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                S
              </div>
              <div className="hidden sm:block">
                <div className="text-zinc-900 dark:text-zinc-100 font-bold">
                  Shop_Link
                </div>
                <div className="text-xs text-zinc-500">
                  Safe · Clean · Fast
                </div>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 mx-4 max-w-2xl">
            <div className="relative">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search products, brands..."
                className="w-full rounded-xl py-3 px-4 bg-white/60 placeholder:text-zinc-500 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <AiOutlineSearch className="absolute right-3 top-3 text-zinc-700" />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            <Link to="/shop" className="hidden md:inline-flex text-zinc-800 dark:text-zinc-100">
              Shop
            </Link>

            <Link to="/shops/all" className="relative ">
            <FaStore className="text-zinc-700 dark:text-zinc-100" />
              
            </Link>

            <Link to="/favorite" className="relative hidden md:inline-flex">
              <FaHeart className="text-zinc-700 dark:text-zinc-100" />
              <span className="absolute -top-2 -right-3 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs grid place-items-center">
                <FavoritesCount />
              </span>
            </Link>

            <Link to="/cart" className="relative">
              <AiOutlineShoppingCart className="text-zinc-700 dark:text-zinc-100" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs grid place-items-center">
                  {cartCount}
                </span>
              )}
            </Link>

{userInfo ? (
  <div className="relative">
    <button
      onClick={toggleDropdown}
      className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-200 px-4 py-2 rounded-xl text-white dark:text-black"
    >
      <span>{userInfo.username}</span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
      </svg>
    </button>

    {dropdownOpen && (
      <ul
        className="
          absolute right-0 mt-3 w-44
          bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100
          rounded-xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-700
          animate-fadeIn z-[9999]
        "
      >
        <li>
          <Link
            to="/profile"
            onClick={handleOptionClick}
            className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Profile
          </Link>
        </li>

        {userInfo.isAdmin && (
          <>
            <li>
              <Link
                to="/admin/productlist"
                onClick={handleOptionClick}
                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Products
              </Link>
            </li>

            <li>
              <Link
                to="/admin/orderlist"
                onClick={handleOptionClick}
                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Orders
              </Link>
            </li>
          </>
        )}

        {userInfo.isSuperAdmin && (
          <>
            <li>
              <Link
                to="/admin/shops"
                onClick={handleOptionClick}
                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Shops
              </Link>
            </li>

            <li>
              <Link
                to="/admin/users"
                onClick={handleOptionClick}
                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Users
              </Link>
            </li>

            <li>
              <Link
                to="/admin/categories"
                onClick={handleOptionClick}
                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Categories
              </Link>
            </li>
          </>
        )}

        <li>
          <button
            onClick={logoutHandler}
            className="block w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Logout
          </button>
        </li>
      </ul>
    )}
  </div>
) : (
  <Link to="/login" className="text-sm text-zinc-800 dark:text-zinc-100">
    Login
  </Link>
)}
          </div>


        </div>
      </nav>
    </>
  )
}

export default Navigation

// src/components/navigation/Navigation.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineHome,
  AiOutlineShop,
  AiOutlineShoppingCart,
  AiOutlineSearch,
} from "react-icons/ai";
import { FaHeart, FaStore } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutMutation } from "../../redux/Api/usersApiSlice.js";
import { logout } from "../../redux/features/auth/authSlice.js";
import FavoritesCount from "../products/FavoritesCount.jsx";

import {
  clearCartItems,
  loadCartForUser,
} from "../../redux/features/cart/cartSlice.js";

import {
  loadFavoritesForUser,
  clearFavorites,
} from "../../redux/features/favorites/favoriteSlice.js";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { favoriteItems } = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApiCall] = useLogoutMutation();

  const [search, setSearch] = useState("");
  const searchRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartCount = cartItems?.reduce((a, c) => a + (c.qty || 1), 0) || 0;

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (e) {}
    finally {
      dispatch(clearCartItems());
      dispatch(clearFavorites());
      dispatch(logout());
      navigate("/login");
    }
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const handleOptionClick = () => setDropdownOpen(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setSearch("");
        searchRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  // Load user-specific cart/favorites or clear for guest
  useEffect(() => {
    if (userInfo && (userInfo._id || userInfo.id)) {
      const uid = userInfo._id || userInfo.id;
      dispatch(loadCartForUser(uid));
      dispatch(loadFavoritesForUser(uid));
    } else {
      dispatch(clearCartItems());
      dispatch(clearFavorites());
    }
  }, [userInfo, dispatch]);

  // Bottom nav items - compute badge dynamically
  const bottomNavItems = [
    { name: "Home", icon: <AiOutlineHome size={24} />, path: "/" },
    { name: "Shop", icon: <AiOutlineShop size={24} />, path: "/shop" },
    { name: "Malls", icon: <FaStore size={22} />, path: "/shops/all" },
    { name: "Favorites", icon: <FaHeart size={22} />, path: "/favorite" },
    { name: "Cart", icon: <AiOutlineShoppingCart size={24} />, path: "/cart" },
  ];

  return (
    <>
      {/* Top Navigation */}
      <nav className="backdrop-blur-sm border-b border-white/10 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              S
            </div>
            <div className="hidden sm:block">
              <div className="text-zinc-900 dark:text-zinc-100 font-bold">Shop_Link</div>
              <div className="text-xs text-zinc-500">Safe · Clean · Fast</div>
            </div>
          </Link>

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

          <div className="flex items-center gap-4">
            <Link to="/shop" className="hidden md:inline-flex text-zinc-800 dark:text-zinc-100">Shop</Link>
            <Link to="/shops/all" className="relative"><FaStore className="text-zinc-700 dark:text-zinc-100" /></Link>
            <Link to="/favorite" className="relative">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <ul className="absolute right-0 mt-3 w-44 bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 rounded-xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 animate-fadeIn z-[9999]">
                    {userInfo.isAdmin && (
                      <>
                        <li><Link to="/admin/productlist" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Products</Link></li>
                        <li><Link to="/admin/orderlist" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Orders</Link></li>
                      </>
                    )}
                    {userInfo.isSuperAdmin && (
                      <>
                        <li><Link to="/admin/shops" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Shops</Link></li>
                        <li><Link to="/admin/users" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Users</Link></li>
                        <li><Link to="/admin/categories" onClick={handleOptionClick} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Categories</Link></li>
                      </>
                    )}
                    <li><button onClick={logoutHandler} className="block w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Logout</button></li>
                  </ul>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm text-zinc-800 dark:text-zinc-100">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Mobile Navigation */}
     <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-white/10 z-50 shadow-t flex justify-around py-2 lg:hidden">

        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          let badge = 0;
          if (item.name === "Favorites") badge = favoriteItems?.length || 0;
          if (item.name === "Cart") badge = cartCount;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center text-zinc-700 dark:text-zinc-100 hover:text-emerald-500 relative transition-all duration-200`}
            >
              {item.icon}
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] grid place-items-center">
                  {badge}
                </span>
              )}
              <span className="text-xs mt-1">{item.name}</span>
              {isActive && (
                <span className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-emerald-500 transition-all duration-300"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navigation;

// src/components/navigation/Navigation.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineHome,
  AiOutlineShop,
  AiOutlineShoppingCart,
  AiOutlineSearch,
} from "react-icons/ai";
import { FaHeart, FaStore, FaDownload } from "react-icons/fa";
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
    } catch (e) {
      // ignore errors; still clear local session
    } finally {
      dispatch(clearCartItems());
      dispatch(clearFavorites());
      dispatch(logout());
      navigate("/login");
    }
  };

  const handleDownloadApp = () => {
    navigate("/");
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

  const bottomNavItems = [
    { name: "Home", icon: <AiOutlineHome size={24} />, path: "/" },
    { name: "Shop", icon: <AiOutlineShop size={24} />, path: "/shop" },
    { name: "Malls", icon: <FaStore size={22} />, path: "/shops/all" },
    { name: "Favorites", icon: <FaHeart size={22} />, path: "/favorite" },
    { name: "Cart", icon: <AiOutlineShoppingCart size={24} />, path: "/cart" },
  ];

  return (
    <>
      <nav className="shoplink-header" aria-label="Main navigation">
        <div className="shoplink-shell shoplink-header__inner">
          <Link to="/" className="shoplink-brand" aria-label="ShopLink home">
            <span className="shoplink-brand__mark">S</span>
            <span className="shoplink-brand__text-wrap">
              <span className="shoplink-brand__name">ShopLink</span>
              <span className="shoplink-brand__tag">Campus shopping</span>
            </span>
          </Link>

          <div className="shoplink-header__search-wrap">
            <div className="shoplink-header__search">
              <AiOutlineSearch className="shoplink-header__search-icon" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search products, brands..."
                aria-label="Search products"
              />
            </div>
          </div>

          <div className="shoplink-header__actions">
            <Link to="/shop" className="shoplink-header__link shoplink-header__link--desktop">
              Shop
            </Link>
            <Link to="/shops/all" className="shoplink-header__icon" aria-label="Browse malls">
              <FaStore />
            </Link>
            <Link to="/favorite" className="shoplink-header__icon shoplink-header__icon--fav" aria-label="Favorites">
              <FaHeart />
              <span className="shoplink-header__badge">
                <FavoritesCount />
              </span>
            </Link>
            <Link to="/cart" className="shoplink-header__icon" aria-label="Cart">
              <AiOutlineShoppingCart />
              {cartCount > 0 && <span className="shoplink-header__badge shoplink-header__badge--cart">{cartCount}</span>}
            </Link>

            <button
              type="button"
              onClick={handleDownloadApp}
              className="shoplink-header__cta"
              title="Download ShopLink App"
            >
              <FaDownload size={14} />
              <span>App</span>
            </button>

            {userInfo ? (
              <div className="shoplink-header__profile-wrap">
                <button type="button" onClick={toggleDropdown} className="shoplink-header__profile">
                  <span>{userInfo.username}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`shoplink-header__chevron ${dropdownOpen ? 'is-open' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={dropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                  </svg>
                </button>

                {dropdownOpen && (
                  <ul className="shoplink-header__dropdown">
                    {userInfo.isAdmin && (
                      <>
                        <li><Link to="/admin/productlist" onClick={handleOptionClick}>Products</Link></li>
                        <li><Link to="/admin/orderlist" onClick={handleOptionClick}>Orders</Link></li>
                      </>
                    )}
                    {userInfo.isSuperAdmin && (
                      <>
                        <li><Link to="/admin/shops" onClick={handleOptionClick}>Shops</Link></li>
                        <li><Link to="/admin/users" onClick={handleOptionClick}>Users</Link></li>
                        <li><Link to="/admin/categories" onClick={handleOptionClick}>Categories</Link></li>
                      </>
                    )}
                    <li><button type="button" onClick={logoutHandler}>Logout</button></li>
                  </ul>
                )}
              </div>
            ) : (
              <Link to="/login" className="shoplink-header__login">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <nav className="shoplink-bottom-nav" aria-label="Mobile navigation">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          let badge = 0;
          if (item.name === 'Favorites') badge = favoriteItems?.length || 0;
          if (item.name === 'Cart') badge = cartCount;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`shoplink-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              {item.icon}
              {badge > 0 && <span className="shoplink-bottom-nav__badge">{badge}</span>}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navigation;

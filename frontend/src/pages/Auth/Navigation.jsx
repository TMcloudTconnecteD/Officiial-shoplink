// src/components/navigation/Navigation.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineHome,
  AiOutlineShop,
  AiOutlineShoppingCart,
  AiOutlineSearch,
} from "react-icons/ai";
import { FaBell, FaHeart, FaStore, FaDownload } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutMutation } from "../../redux/Api/usersApiSlice.js";
import { useGetProductsQuery } from "../../redux/Api/productApiSlice.js";
import { useFetchShopsQuery } from "../../redux/Api/shopApiSlice.js";
import { logout } from "../../redux/features/auth/authSlice.js";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "../../redux/Api/notificationApiSlice.js";

import {
  clearCartItems,
  loadCartForUser,
} from "../../redux/features/cart/cartSlice.js";
import {
  clearFavorites,
  loadFavoritesForUser,
} from "../../redux/features/favorites/favoriteSlice.js";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const favorites = useSelector((state) => Array.isArray(state.favorites) ? state.favorites : []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutApiCall] = useLogoutMutation();
  const { data: notificationData, isLoading: loadingNotifications, error: notificationError } = useGetNotificationsQuery(undefined, {
    skip: !userInfo,
    pollingInterval: 60000,
  });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const { data: searchData, isFetching: searchingProducts } = useGetProductsQuery(
    { keyword: debouncedSearch },
    { skip: debouncedSearch.length < 2 }
  );
  const { data: shopData = [] } = useFetchShopsQuery();
  const products = Array.isArray(searchData)
    ? searchData
    : Array.isArray(searchData?.products) ? searchData.products : [];
  const shops = Array.isArray(shopData?.data) ? shopData.data : Array.isArray(shopData) ? shopData : [];
  const matchingShops = shops
    .filter((shop) => [shop.name, shop.location, shop.description]
      .some((value) => String(value || "").toLowerCase().includes(debouncedSearch.toLowerCase())))
    .slice(0, 4);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const favoriteCount = Number(Array.isArray(favorites) ? favorites.length : 0);
  const cartCount = cartItems?.reduce((a, c) => a + (c.qty || 1), 0) || 0;

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (error) {
      console.error("Could not log out cleanly:", error);
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
  const openNotification = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification._id).unwrap();
      } catch (error) {
        console.error("Could not mark notification as read:", error);
      }
    }
    setNotificationsOpen(false);
    if (notification.link) navigate(notification.link);
  };

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
    { name: "Malls", icon: <FaStore size={22} />, path: "/malls" },
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
                placeholder="Search products, shops, or locations..."
                aria-label="Search products, shops, or locations"
                autoComplete="off"
              />
              {search.trim().length >= 2 && (
                <div className="shoplink-search-results" role="listbox" aria-label="Live search results">
                  {searchingProducts && <p className="shoplink-search-results__empty">Searching ShopLink…</p>}
                  {!searchingProducts && products.length === 0 && matchingShops.length === 0 && (
                    <p className="shoplink-search-results__empty">No matching products or shops yet.</p>
                  )}
                  {products.slice(0, 4).map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      role="option"
                      className="shoplink-search-results__item"
                      onClick={() => setSearch("")}
                    >
                      <img src={product.image} alt="" loading="lazy" />
                      <span><strong>{product.name}</strong><small>{product.shop?.name || "ShopLink product"} · KES {Number(product.price || 0).toLocaleString()}</small></span>
                    </Link>
                  ))}
                  {matchingShops.map((shop) => (
                    <Link
                      key={shop._id}
                      to={shop.type === "mall" ? `/malls/${shop._id}` : `/shops/${shop._id}`}
                      role="option"
                      className="shoplink-search-results__item"
                      onClick={() => setSearch("")}
                    >
                      <span className="shoplink-search-results__shop-icon"><FaStore /></span>
                      <span><strong>{shop.name}</strong><small>{shop.location} · {shop.type === "mall" ? "Mall" : "Shop"}</small></span>
                    </Link>
                  ))}
                  <Link
                    to={`/shop?keyword=${encodeURIComponent(search.trim())}`}
                    className="shoplink-search-results__all"
                    onClick={() => setSearch("")}
                  >
                    View all matches <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="shoplink-header__actions">
            <Link to="/shop" className="shoplink-header__link shoplink-header__link--desktop">
              Shop
            </Link>
            <Link to="/malls" className="shoplink-header__icon" aria-label="Browse malls">
              <FaStore />
            </Link>
            <Link to="/favorite" className="shoplink-header__icon shoplink-header__icon--fav" aria-label="Favorites">
              <FaHeart />
              {favoriteCount > 0 && (
                <span className="shoplink-header__badge">
                  {favoriteCount}
                </span>
              )}
            </Link>
            {userInfo && (
              <div className="shoplink-notifications">
                <button
                  type="button"
                  className="shoplink-header__icon shoplink-notifications__button"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <FaBell />
                  {notificationData?.count > 0 && (
                    <span className="shoplink-header__badge">{notificationData.count}</span>
                  )}
                </button>
                {notificationsOpen && (
                  <section className="shoplink-notifications__panel" aria-label="Your notifications">
                    <div className="shoplink-notifications__heading">
                      <strong>Notifications</strong>
                      <span>{notificationData?.count || 0} unread</span>
                    </div>
                    {loadingNotifications && <p className="shoplink-notifications__empty">Loading notifications…</p>}
                    {notificationError && <p className="shoplink-notifications__empty" role="alert">Notifications could not be loaded.</p>}
                    {!loadingNotifications && !notificationError && !notificationData?.notifications?.length && (
                      <p className="shoplink-notifications__empty">You’re all caught up.</p>
                    )}
                    <div className="shoplink-notifications__list">
                      {notificationData?.notifications?.slice(0, 12).map((notification) => (
                        <button
                          type="button"
                          key={notification._id}
                          className={`shoplink-notifications__item ${notification.read ? "" : "is-unread"}`}
                          onClick={() => openNotification(notification)}
                        >
                          <strong>{notification.title}</strong>
                          <span>{notification.message}</span>
                          <time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
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
                    <li><Link to="/my-orders" onClick={handleOptionClick}>My Orders</Link></li>
                    <li><Link to="/my-rewards" onClick={handleOptionClick}>My Rewards</Link></li>
                    <li><Link to="/profile" onClick={handleOptionClick}>Account settings</Link></li>
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
          if (item.name === 'Favorites') badge = favoriteCount;
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

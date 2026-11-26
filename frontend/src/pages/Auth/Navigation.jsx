// src/components/navigation/Navigation.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineHome,
  AiOutlineShop,
  AiOutlineShoppingCart,
  AiOutlineSearch,
} from "react-icons/ai";
import { FaBell, FaHeart, FaRegHeart, FaStore, FaDownload, FaGraduationCap } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGetCurrentUserProfileQuery, useLogoutMutation } from "../../redux/Api/usersApiSlice.js";
import { logout, setCredentials } from "../../redux/features/auth/authSlice.js";
import ShopLinkMark from "../../components/ShopLinkMark.jsx";

import {
  clearCartItems,
  loadCartForUser,
} from "../../redux/features/cart/cartSlice.js";
import {
  clearFavorites,
  loadFavoritesForUser,
} from "../../redux/features/favorites/favoriteSlice.js";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadMutation,
} from "../../redux/Api/notificationApiSlice.js";
import { apiSlice } from "../../redux/Api/apiSlice.js";
import { toast } from "react-toastify";
import { useGetCartNudgeStatusQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice.js";
import { reportPromoEvent } from "../../components/marketing/marketingUtils.js";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const favorites = useSelector((state) => Array.isArray(state.favorites) ? state.favorites : []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApiCall] = useLogoutMutation();
  const { data: currentProfile } = useGetCurrentUserProfileQuery(undefined, {
    skip: !userInfo,
    refetchOnMountOrArgChange: true,
  });

  const [search, setSearch] = useState("");
  const searchRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: notificationData, isError: notificationsError, refetch: refetchNotifications } = useGetNotificationsQuery(userInfo?._id || userInfo?.id, {
    skip: !userInfo,
    pollingInterval: userInfo ? 10000 : 0,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [markNotificationsRead, { isLoading: isMarkingRead }] = useMarkNotificationsReadMutation();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const notifications = notificationData?.notifications || [];
  const notificationCount = Number(notificationData?.count || 0);
  const isAdmin = Boolean(userInfo?.isAdmin || userInfo?.isSuperAdmin);
  const isSuperAdmin = Boolean(userInfo?.isSuperAdmin);

  useEffect(() => {
    const roleChanged = currentProfile && userInfo && (
      Boolean(currentProfile.isAdmin) !== Boolean(userInfo.isAdmin)
      || Boolean(currentProfile.isSuperAdmin) !== Boolean(userInfo.isSuperAdmin)
      || Boolean(currentProfile.isSeller) !== Boolean(userInfo.isSeller)
      || currentProfile.sellerStatus !== userInfo.sellerStatus
    );
    if (roleChanged) {
      dispatch(setCredentials({
        ...userInfo,
        ...currentProfile,
        token: userInfo.token,
      }));
    }
  }, [currentProfile, dispatch, userInfo]);

  const favoriteCount = favorites.filter((product) => (
    product && typeof product === "object" && typeof product._id === "string" && product._id.trim()
  )).length;
  const cartCount = cartItems?.reduce((a, c) => a + (c.qty || 1), 0) || 0;
  const { data: cartNudge } = useGetCartNudgeStatusQuery(undefined, {
    skip: !userInfo || userInfo.isAdmin || userInfo.isSuperAdmin,
    pollingInterval: userInfo && !userInfo.isAdmin && !userInfo.isSuperAdmin ? 60000 : 0,
    skipPollingIfUnfocused: true,
  });
  const [logPromoEvent] = useLogPromoEventMutation();
  const cartNudgeSeen = useRef(false);
  useEffect(() => {
    if (cartNudge?.show && !cartNudgeSeen.current) {
      reportPromoEvent(logPromoEvent, "cartNudge", "impression");
      cartNudgeSeen.current = true;
    } else if (!cartNudge?.show) {
      cartNudgeSeen.current = false;
    }
  }, [cartNudge?.show, logPromoEvent]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch {
      // ignore errors; still clear local session
    } finally {
      dispatch(clearCartItems());
      dispatch(clearFavorites());
      dispatch(logout());
      dispatch(apiSlice.util.resetApiState());
      navigate("/login");
    }
  };
  const openNotification = async (notification) => {
    const notificationId = notification._id || notification.id;
    if (notificationId && !notification.read) {
      try {
        await markNotificationRead(notificationId).unwrap();
      } catch (error) {
        toast.error(error?.data?.message || "Could not update notification status");
      }
    }

    const orderId = notification.message?.match(/order\s+([a-f\d]{24})/i)?.[1];
    const fallbackLink = notification.type === "order" || notification.type === "payment"
      ? (orderId ? `/order/${orderId}` : userInfo?.isAdmin ? "/admin/orderlist" : "/profile")
      : notification.type === "rider"
        ? (userInfo?.isAdmin ? "/admin/riders" : "/ride-boda")
        : notification.type === "seller"
        ? (userInfo?.isSuperAdmin ? "/admin/shops" : userInfo?.isAdmin ? "/admin/my-shop" : "/shops/all")
          : userInfo?.isAdmin ? "/admin/dashboard" : "/profile";
    const link = typeof notification.link === "string"
      && notification.link.startsWith("/")
      && !notification.link.startsWith("//")
      ? notification.link
      : fallbackLink;

    setNotificationsOpen(false);
    navigate(link);
  };

  const handleDownloadApp = () => {
    navigate("/");
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const handleOptionClick = () => setDropdownOpen(false);
  const toggleNotifications = () => {
    const willOpen = !notificationsOpen;
    setNotificationsOpen(willOpen);
    if (willOpen) refetchNotifications();
  };
  const handleMarkNotificationsRead = async () => {
    try {
      await markNotificationsRead().unwrap();
    } catch (error) {
      console.error("Could not mark notifications as read:", error);
      toast.error(error?.data?.message || "Could not mark notifications as read");
    }
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
    { name: "Malls", icon: <FaStore size={22} />, path: "/shops/all" },
    { name: "Favorites", icon: favoriteCount > 0 ? <FaHeart size={22} /> : <FaRegHeart size={22} />, path: "/favorite" },
    { name: "Cart", icon: <AiOutlineShoppingCart size={24} />, path: "/cart" },
  ];

  return (
    <>
      <nav className="shoplink-header" aria-label="Main navigation">
        <div className="shoplink-shell shoplink-header__inner">
          <Link to="/" className="shoplink-brand" aria-label="ShopLink home">
            <ShopLinkMark />
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
            <Link
              to="/favorite"
              className={`shoplink-header__icon${favoriteCount > 0 ? " shoplink-header__icon--fav" : " shoplink-header__icon--fav-empty"}`}
              aria-label={favoriteCount > 0 ? `Favorites, ${favoriteCount} selected` : "Favorites"}
            >
              {favoriteCount > 0 ? <FaHeart /> : <FaRegHeart className="shoplink-header__fav-empty" />}
              {favoriteCount > 0 && (
                <span className="shoplink-header__badge">
                  {favoriteCount > 99 ? "99+" : favoriteCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="shoplink-header__icon"
              aria-label={cartNudge?.show ? `Cart, ${cartNudge.itemCount} items waiting` : "Cart"}
              onClick={() => cartNudge?.show && reportPromoEvent(logPromoEvent, "cartNudge", "click")}
            >
              <AiOutlineShoppingCart />
              {cartCount > 0 && <span className="shoplink-header__badge shoplink-header__badge--cart">{cartCount}</span>}
              {cartNudge?.show && <span className="shoplink-cart-nudge">{cartNudge.itemCount} waiting</span>}
            </Link>
            {userInfo && (
              <div className="shoplink-header__notifications">
                <button
                  type="button"
                  className="shoplink-header__icon"
                  aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}
                  aria-expanded={notificationsOpen}
                  onClick={toggleNotifications}
                >
                  <FaBell />
                  {notificationCount > 0 && (
                    <span className="shoplink-header__badge">{notificationCount > 99 ? "99+" : notificationCount}</span>
                  )}
                </button>
                {notificationsOpen && (
                  <section className="shoplink-notification-panel" aria-label="Notifications">
                    <div className="shoplink-notification-panel__header">
                      <strong>Notifications</strong>
                      {notificationCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkNotificationsRead}
                          disabled={isMarkingRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notificationsError ? (
                      <p role="alert" className="shoplink-notification-empty">Notifications are unavailable right now.</p>
                    ) : notifications.length > 0 ? (
                      <ul className="shoplink-notification-list">
                        {notifications.slice(0, 8).map((notification) => (
                          <li key={notification._id || notification.id}>
                            <button
                              type="button"
                              className={`shoplink-notification-item${notification.read ? " is-read" : ""}`}
                              onClick={() => openNotification(notification)}
                            >
                              <span className="shoplink-notification-item__title">
                                <strong>{notification.title}</strong>
                                {!notification.read && <span className="shoplink-notification-item__unread" aria-label="Unread" />}
                              </span>
                              <span className="shoplink-notification-item__message">{notification.message}</span>
                              <time dateTime={notification.createdAt}>
                                {new Date(notification.createdAt).toLocaleString()}
                              </time>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="shoplink-notification-empty">You’re all caught up.</p>
                    )}
                  </section>
                )}
              </div>
            )}

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
                    {isAdmin && (
                      <>
                        <li><Link to="/admin/dashboard" onClick={handleOptionClick}>Admin dashboard</Link></li>
                        <li><Link to={isSuperAdmin ? "/admin/shops" : "/admin/my-shop"} onClick={handleOptionClick}>{isSuperAdmin ? "All shops" : "My shop"}</Link></li>
                        <li><Link to="/admin/productlist" onClick={handleOptionClick}>Create product</Link></li>
                        <li><Link to="/admin/allproductslist" onClick={handleOptionClick}>Manage products</Link></li>
                        <li><Link to="/admin/orderlist" onClick={handleOptionClick}>Orders</Link></li>
                      </>
                    )}
                    {isSuperAdmin && (
                      <>
                        <li><Link to="/admin/shop/add" onClick={handleOptionClick}>Add shop</Link></li>
                        <li><Link to="/admin/users" onClick={handleOptionClick}>Users</Link></li>
                        <li><Link to="/admin/categories" onClick={handleOptionClick}>Categories</Link></li>
                        <li><Link to="/admin/sellers" onClick={handleOptionClick}>Seller applications</Link></li>
                        <li><Link to="/admin/riders" onClick={handleOptionClick}>Rider applications</Link></li>
                      </>
                    )}
                    {!isAdmin && <li><Link to="/student-friendly" onClick={handleOptionClick}><FaGraduationCap aria-hidden="true" /> Student Friendly</Link></li>}
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
              onClick={() => item.name === "Cart" && cartNudge?.show && reportPromoEvent(logPromoEvent, "cartNudge", "click")}
              className={`shoplink-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              {item.icon}
              {badge > 0 && <span className="shoplink-bottom-nav__badge">{badge}</span>}
              {item.name === "Cart" && cartNudge?.show && <span className="shoplink-bottom-nav__badge shoplink-cart-nudge-dot">{cartNudge.itemCount}</span>}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navigation;

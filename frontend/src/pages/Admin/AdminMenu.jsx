import { useState } from "react";
import { FaBars, FaBoxOpen, FaChartLine, FaStore, FaTimes, FaUsers, FaTags, FaMotorcycle, FaUserCheck, FaSignOutAlt, FaClipboardList } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLogoutMutation } from "../../redux/Api/usersApiSlice.js";
import { logout } from "../../redux/features/auth/authSlice.js";
import "./AdminWorkspace.css";

const AdminMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall, { isLoading }] = useLogoutMutation();
  const isSuperAdmin = Boolean(userInfo?.isSuperAdmin);

  const links = [
    { to: "/admin/dashboard", label: "Overview", icon: FaChartLine },
    { to: isSuperAdmin ? "/admin/shops" : "/admin/my-shop", label: isSuperAdmin ? "All shops" : "My shop", icon: FaStore },
    { to: "/admin/productlist", label: "Add product", icon: FaBoxOpen },
    { to: "/admin/allproductslist", label: "Products", icon: FaTags },
    { to: "/admin/orderlist", label: "Orders", icon: FaClipboardList },
    ...(isSuperAdmin ? [
      { to: "/admin/shop/add", label: "Add shop", icon: FaStore },
      { to: "/admin/users", label: "Users", icon: FaUsers },
      { to: "/admin/categories", label: "Categories", icon: FaTags },
      { to: "/admin/sellers", label: "Seller applications", icon: FaUserCheck },
      { to: "/admin/riders", label: "Rider applications", icon: FaMotorcycle },
    ] : []),
  ];

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Could not log out. Please try again.");
    }
  };

  return (
    <nav className="admin-menu" aria-label="Administration">
      <div className="admin-menu__brand">
        <span className="admin-menu__eyebrow">{isSuperAdmin ? "Super admin" : "Shop admin"}</span>
        <strong>Workspace</strong>
      </div>
      <button
        type="button"
        className="admin-menu__toggle"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close admin menu" : "Open admin menu"}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`admin-menu__content${isMenuOpen ? " is-open" : ""}`}>
        <div className="admin-menu__links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) => `admin-menu__link${isActive ? " is-active" : ""}`}
            >
              <link.icon aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="admin-menu__account">
          <Link to="/" className="admin-menu__home">Marketplace</Link>
          <button type="button" onClick={logoutHandler} disabled={isLoading}>
            <FaSignOutAlt aria-hidden="true" />
            {isLoading ? "Signing out…" : "Log out"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminMenu;

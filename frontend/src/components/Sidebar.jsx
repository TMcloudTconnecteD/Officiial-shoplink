import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-4">
        <button
          onClick={onClose}
          className="mb-6 text-gray-400 hover:text-white"
        >
          Close ✖
        </button>
        <ul className="space-y-4">
          <li>
            <Link to="/" onClick={onClose} className="hover:text-pink-400">
              Home
            </Link>
          </li>
          <li>
            <Link to="/shop" onClick={onClose} className="hover:text-pink-400">
              Shop
            </Link>
          </li>
          <li>
            <Link
              to="/categories"
              onClick={onClose}
              className="hover:text-pink-400"
            >
              Categories
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

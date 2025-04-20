import React, { useState } from 'react';
import { AiOutlineHome, AiOutlineMenu, AiOutlineSearch, AiOutlineShop, AiOutlineShoppingCart } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Header = ({ onToggleSidebar }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search submit logic or navigation here if needed
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-yellow-400 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-50 space-y-3 sm:space-y-0 border-4 border-red-500 sm:border-0">
      {/* Left: Logo and branding */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Logo placeholder */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-orange-500 via-purple-400 to-blue-200 rounded-full flex items-center justify-center text-black font-extrabold text-2xl sm:text-3xl select-none shadow-lg animate-pulse">
          S
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide drop-shadow-lg">shoplink</h1>
          <p className="text-xs sm:text-sm italic text-green-300 drop-shadow-md">..connecting dreams</p>
        </div>
      </div>

      {/* Center: Search bar with toggle icon */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center bg-gray-800 bg-opacity-70 rounded-full px-4 py-2 w-full sm:w-1/2 max-w-lg shadow-inner"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow bg-transparent outline-none text-yellow-300 placeholder-yellow-500"
        />
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="text-yellow-400 hover:text-yellow-200 ml-3 focus:outline-none transition-transform transform hover:scale-110"
        >
          <AiOutlineMenu size={26} />
        </button>
        <button
          type="submit"
          aria-label="Search"
          className="text-yellow-400 hover:text-yellow-200 ml-3 focus:outline-none transition-transform transform hover:scale-110"
        >
          <AiOutlineSearch size={26} />
        </button>
      </form>

      {/* Right: Navigation links and user profile avatar */}
      <div className="flex items-center space-x-6 flex-shrink-0">
        {/* Home Link */}
        <Link to='/shop' className='flex items-center transition-transform transform hover:translate-x-2 text-orange-500'>
          <AiOutlineShop className=' text-orange-500' size={26} />
          <span className="hidden sm:inline font-semibold tracking-wide"></span>
        </Link>

        {/* Mall Link */}
        <Link to='/mall' className='flex items-center transition-transform transform hover:translate-x-2 text-green-500 ml-4' title="All Malls/Shops">
          <AiOutlineShop className='text-green-500' size={26} />
          <span className="hidden sm:inline font-semibold tracking-wide ml-1">Malls</span>
        </Link>

        {/* Cart Link */}
        <Link
          to="/cart"
          className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-200 transition-transform transform hover:scale-110 relative"
          title="Cart"
        >
          <AiOutlineShoppingCart size={28} />
          <span className="hidden sm:inline font-semibold tracking-wide"></span>
          {/* Optionally add cart count badge here if needed */}
        </Link>

        {/* User profile avatar */}
        <div className="relative group">
          {userInfo ? (
            <Link to="/profile" className="flex items-center space-x-3">
              {/* Background avatar */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-300 to-yellow-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity"></div>
              {/* Foreground avatar */}
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xl select-none shadow-lg">
                {userInfo.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-yellow-300 font-semibold drop-shadow-md">
                {userInfo.username}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-yellow-400 hover:text-white font-semibold transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

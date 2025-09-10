import React, { useState } from 'react';
import { AiOutlineMenu, AiOutlineSearch, AiOutlineShop, AiOutlineShoppingCart } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const HeaderUpdated = ({ onToggleSidebar }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // search logic
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-yellow-400 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
      
      {/* Left: Logo */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-orange-500 via-purple-400 to-blue-200 rounded-full flex items-center justify-center text-black font-extrabold text-2xl sm:text-3xl select-none shadow-lg animate-pulse">
          S
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide drop-shadow-lg">shoplink</h1>
          <p className="text-xs sm:text-sm italic text-green-300 drop-shadow-md">..connecting dreams</p>
        </div>
      </div>

      {/* Center: Search */}
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
          className="text-yellow-400 hover:text-yellow-200 ml-3 transition-transform transform hover:scale-110"
        >
          <AiOutlineMenu size={26} />
        </button>
        <button
          type="submit"
          className="text-yellow-400 hover:text-yellow-200 ml-3 transition-transform transform hover:scale-110"
        >
          <AiOutlineSearch size={26} />
        </button>
      </form>

      {/* Right: Links + Avatar */}
      <div className="flex items-center space-x-6 flex-shrink-0">
        <Link to='/shop' className='flex items-center hover:translate-x-2 transition-transform text-orange-500'>
          <AiOutlineShop size={26} />
        </Link>

        <Link to='/shops/all' className='flex items-center hover:translate-x-2 transition-transform text-green-500 ml-4'>
          <AiOutlineShop size={26} />
          <span className="hidden sm:inline ml-1">Malls</span>
        </Link>

        <Link to="/cart" className="flex items-center text-yellow-400 hover:text-yellow-200 transition-transform hover:scale-110 relative">
          <AiOutlineShoppingCart size={28} />
        </Link>

        <div className="relative group">
          {userInfo ? (
            <Link to="/profile" className="flex items-center space-x-3">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-300 to-yellow-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xl shadow-lg">
                {userInfo.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-yellow-300 font-semibold">
                {userInfo.username}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="text-yellow-400 hover:text-white font-semibold transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderUpdated;

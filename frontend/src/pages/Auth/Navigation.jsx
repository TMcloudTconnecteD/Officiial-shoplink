import React, { useState } from 'react'
import {AiOutlineHome, AiOutlineUserAdd, AiOutlineShopping, AiOutlineLogin, AiOutlineShoppingCart, AiOutlineShop, AiOutlineMenu, AiOutlineClose} from 'react-icons/ai'
import {FaHeart, FaHeartbeat} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../redux/Api/usersApiSlice.js'
import { logout } from '../../redux/features/auth/authSlice.js'
import './Navigation.css'
import FavoritesCount from '../products/FavoritesCount.jsx'

const Navigation = () => {
    const {userInfo} = useSelector(state => state.auth)
    const { cartItems } = useSelector((state) => state.cart);

    const [dropdownOpen, setDropDownOpen] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const toggleDropdown = () => {
        setDropDownOpen(!dropdownOpen)
    }
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar)
    }
    const closeSidebar = () => {
        setShowSidebar(false)
    }

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [logoutApiCall] = useLogoutMutation()
    const logoutHandler = async () => {
        try {
          const response =  await logoutApiCall().unwrap();
          console.log('logout success', response)
          dispatch(logout());
          navigate('/login');
        } catch (error) {
           console.error('Logout Failed', error)
           alert('Logout failed. Please try again.')
        }
    }

    const handleOptionClick = () => {
        setDropDownOpen(false); // Closes the dropdown when an option is clicked
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        // You can add search logic here or lift state up to parent if needed
    }

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTerm.trim()) {
                navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
                setSearchTerm('');
                closeSidebar();
            }
        }
    }

  return (
    <div style={{zIndex: 9999}} 
         className= {`${showSidebar ? 'flex' : 'hidden'}
         xl:flex lg:flex md:flex sm:flex flex-col justify-between p-4
         text-white bg-black w-[4%] hover:w-[15] h-[100%] fixed transition-width duration-300 ease-in-out`} 
         id='navigation-container'>

        {/* Sidebar toggle button for smaller screens */}
        <button 
          onClick={toggleSidebar} 
          className="absolute top-4 right-4 text-white xl:hidden lg:hidden md:hidden sm:block z-50 p-1 rounded bg-gray-800 hover:bg-gray-700 focus:outline-none"
          aria-label={showSidebar ? 'Open sidebar' : 'Open sidebar'}>
            <AiOutlineMenu size={24} />
        </button>

        {/* Search bar */}
       

        <div className="flex flex-col justify-center space-y-4">
          <Link to='/' className='flex items-center transition-transform transform hover:translate-x-2 text-orange-500'>
            <AiOutlineHome className='mr-2 mt-[3rem] text-cyan-500' size={26} />
            <span className="hidden nav-item-name mt-[3rem]">Home</span>
          </Link>

          <Link to='/shop' className='flex items-center transition-transform transform hover:translate-x-2 text-orange-500'>
            <AiOutlineShopping className='mr-2 mt-[3rem] text-cyan-500' size={26} />
            <span className="hidden nav-item-name mt-[3rem]">Shop</span>
          </Link>

          <Link to='/Admin/shops' className='flex items-center transition-transform transform hover:translate-x-2 text-orange-500'>
            <AiOutlineShop className='mr-2 mt-[3rem] text-cyan-500 color-cyan-500' size={26} />
            <span className="hidden nav-item-name mt-[3rem]">Mall</span>
          </Link>

          <Link to="/cart" className="flex relative text-orange-500">
            <div className="flex items-center transition-transform transform hover:translate-x-2">
              <AiOutlineShoppingCart className="mt-[3rem] mr-2 text-cyan-500" size={26} />
              <span className="hidden nav-item-name mt-[3rem]">Cart</span>
            </div>
            <div className="absolute top-9">
              {cartItems.length > 0 && (
                <span>
                  <span className="px-1 py-0 text-sm text-white bg-pink-500 rounded-full">
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </span>
                </span>
              )}
            </div>
          </Link>

          <Link to="/favorite" className="flex relative text-orange-500">
            <div className="flex justify-center items-center transition-transform transform hover:translate-x-2">
              <FaHeartbeat className="mt-[3rem] mr-2 text-red-500" size={20} />
              <span className="hidden nav-item-name mt-[3rem]">Favorites</span>
              <FavoritesCount />
            </div>
          </Link>
        </div>

        <div className="relative">
          <button onClick={toggleDropdown} className='flex items-center text-gray-8000 focus:outline-none'>
            {userInfo ? (<span className='text-white'>{userInfo.username}</span>) : (<></>)}
            {userInfo && (
              <svg xmlns='http://www.w3.org/2000/svg'
                className={`h-4 w-4 ml-1 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill='none'
                viewBox='0 0 24 24'
                stroke='white'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
                  d={dropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
              </svg>
            )}
          </button>

          {dropdownOpen && userInfo && (
            <ul
              className={`absolute right-[-5rem] w-[11rem] bg-white text-gray-800 p-2 rounded shadow-lg space-y-2 z-50 transition-all duration-300 ease-in-out origin-top-right
                ${dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                ${!userInfo.isSuperAdmin? '-top-50' : '-top-80'} max-h-60 overflow-y-auto`}>

              {  userInfo.isAdmin  && (
                <>
                  <li>
                    <Link to='admin/productlist' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100'>
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link to='/admin/orderlist' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100'>
                      Orders
                    </Link>
                  </li>
                </>
              )}
               {userInfo.isSuperAdmin   &&  (
                <>
                  <li>
                    <Link to='/Admin/shops' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100 text-orange-500'>
                      Super Admin
                    </Link>
                  </li>
                  <li>
                    <Link to='/admin/users' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100 text-orange-500'>
                      Users!
                    </Link>
                  </li>
                  <li>
                    <Link to='/admin/categories' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100 text-orange-500'>
                      Category
                    </Link>
                  </li>
                  <li>
                    <Link to='admin/productlist' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100'>
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link to='/admin/orderlist' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100'>
                      Orders
                    </Link>
                  </li>
                
                </>
              )}

              <li>
                <Link to='/profile' onClick={handleOptionClick} className='block px-4 py-2 hover:bg-gray-100 text-orange-500'>
                  Profile
                </Link>
              </li>

              <li>
                <button onClick={logoutHandler} className='block px-4 py-2 hover:bg-gray-100 text-orange-500'>
                  Logout
                </button>
              </li>

            </ul>
          )}
        </div>

        {!userInfo && (
          <ul>
            <li>
              <Link to='/login' className='flex items-center transition-transform transform hover:translate-x-2 text-orange-500'>
                <AiOutlineLogin className='mr-2 mt-[3rem] text-white' size={26} />
                <span className="hidden nav-item-name mt-[3rem]">Login</span>
              </Link>
            </li>

            <li>
              <Link to='/register' className='flex items-center transition-transform transform hover:translate-x-2 text-orange-500'>
                <AiOutlineUserAdd className='mr-2 mt-[3rem] text-white' size={26} />
                <span className="hidden nav-item-name mt-[3rem]">Register</span>
              </Link>
            </li>
          </ul>
        )}

    </div>
  )
}

export default Navigation;

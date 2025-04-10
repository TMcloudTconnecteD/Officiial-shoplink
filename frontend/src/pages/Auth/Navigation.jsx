import React, { useState } from 'react'
import {AiOutlineHome, AiOutlineUserAdd, AiOutlineShopping, AiOutlineLogin, AiOutlineShoppingCart, AiOutlineShop} from 'react-icons/ai'
import {FaHeart} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../redux/api/usersApiSlice.js'
import { logout } from '../../redux/features/auth/authSlice.js'
import './Navigation.css'
import FavoritesCount from '../products/FavoritesCount.jsx'

const Navigation = () => {
    const {userInfo} = useSelector(state => state.auth)
    const { cartItems } = useSelector((state) => state.cart);


    const [dropdownOpen, setDropDownOpen] = useState(false)
    const [showSidebar, setShowSidebar] = useState(false)

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
            // Optionally, you can show a success message or perform any other actions here

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


  return (
    <div style={{zIndex: 9999}} 
         className= {`${showSidebar ? 'hidden' : 'flex'}
         xl:flex lg:flex md:flex sm:flex flex-col justify-between p-4
         text-white bg-black w-[4%] hover:w-[15] h-[100%] fixed `} 
         id='navigation-container'>
            <div className="flex flex-col justify-center space-y-4">
        <Link to = '/' className='flex  items-center transition-transform transform hover:translate-x-2 text-orange-500'>

        <AiOutlineHome className='mr-2 mt-[3rem] ' size={26} />
        <span className="hidden nav-item-name mt-[3rem]">Home</span>{" "}
        </Link>

<Link to = '/shop' className='flex  items-center transition-transform transform hover:translate-x-2 text-orange-500'>

<AiOutlineShopping className='mr-2 mt-[3rem] text-orange-500 'size={26}/>
<span className="hidden nav-item-name mt-[3rem]">Shop</span>{" "}
</Link>

<Link to = '/Admin/addshop' className='flex  items-center transition-transform transform hover:translate-x-2 text-orange-500'>

<AiOutlineShop className='mr-2 mt-[3rem] text-orange-500 color-green-500'size={26}/>
<span className="hidden nav-item-name mt-[3rem]">Mall</span>{" "}
</Link>


<Link to="/cart" className="flex relative text-orange-500">
          <div className="flex items-center transition-transform transform hover:translate-x-2">
            <AiOutlineShoppingCart className="mt-[3rem] mr-2 text-orange-500" size={26} />
            <span className="hidden nav-item-name mt-[3rem]">Cart</span>{" "}
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
            <FaHeart className="mt-[3rem] mr-2 text-orange-500" size={20} />
            <span className="hidden nav-item-name mt-[3rem]">
              Favorites
            </span>{" "}
            <FavoritesCount />
          </div>
        </Link>
      </div>



            

            <div className="relative">
                <button onClick={toggleDropdown}
                className='flex items-center 
                text-gray-8000 focus:outline-none'>
                    {userInfo ? (<span className='text-white '>{userInfo.username}</span>) : (
                         <></>
                         )}

                         {userInfo  && (
                             <svg xmlns='http://www.w3.org/200/svg'
                            className={`h-4 w-4 ml-1 ${
                                dropdownOpen ? 'rotate-180' : ''
                            }`} 
                            fill='none'
                            viewBox='0 0 24 24' 
                            stroke='white'>
                                <path strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d={ dropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                                />
                                
                        </svg>
                         )}

                        </button>

                            {dropdownOpen &&  userInfo &&(
                                <ul 
                                 className={`absolute  right-[-5rem] w-[11rem] bg-white text-gray-800 p-2 rounded shadow-lg space-y-2 z-50 transition-all duration-300 ease-in-out origin-top-right
                                    ${dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                                    ${!userInfo.isAdmin ? '-top-30' : '-top-80'} max-h-60 overflow-y-auto`} >

                                    {userInfo.isAdmin &&  (
                                        <>
                                        

                                       



                                        <li>
                                        <Link to='/admin/users' 
                                        onClick={handleOptionClick}
                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' >Users!
                                        
                                        </Link>
                                        </li>

                                        <li>
                                        <button
                                        onClick={logoutHandler} 
                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' > 
                                            Logout
                                        </button>
                                        </li>


                                        <li>
                                        <Link to='/admin/categories' 
                                        onClick={handleOptionClick}

                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' > 
                                            Category

                                        </Link>
                                        </li>

                                        <li>
                                        <Link to='/profile' 
                                        onClick={handleOptionClick}
                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' >
                                            
                                             Profile
                                        </Link>
                                        </li>

                                        <li>
                                        <Link to='admin/productlist' 
                                        onClick={handleOptionClick}
                                        className='block px-4 py-2 hover:bg-gray-100' >
                                            Products
                                        </Link>
                                        </li> 
                                            
                                       

                                        <li>
                                        <Link to='/admin/ordrerlist' 
                                        onClick={handleOptionClick}
                                        className='block px-4 py-2 hover:bg-gray-100' > 
                                            Orders

                                        </Link>
                                        </li>

                                       
                                        <li>
                                        <Link to='/Admin/all' 
                                        onClick={handleOptionClick}
                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' > 
                                            Super Admin

                                        </Link>
                                        </li>
                                        


                                       



                                        </>
                                    ) }
                                    {userInfo.isAdmin.isSuperAdmin && (
                                        <li>
                                        <Link to='/Admin/shops' 
                                        onClick={handleOptionClick}
                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' > 
                                            Super Admin

                                        </Link>
                                        </li>
                                    )}
                                    
                                       <li>
                                        <Link to='/profile' 
                                        onClick={handleOptionClick}
                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' >
                                            
                                             Profile
                                        </Link>
                                        </li>

                                        <li>
                                        <button
                                        onClick={logoutHandler} 
                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' > 
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
                        <AiOutlineLogin className='mr-2 mt-[3rem] text-white' size={26}/>
                        <span className="hidden nav-item-name mt-[3rem]">Login</span>{" "}
                    </Link>
                </li>
    
    
                <li>
                    <Link to='/register' className='flex items-center transition-transform transform hover:translate-x-2 text-orange-500'>
                        <AiOutlineUserAdd className='mr-2 mt-[3rem] text-pink-500' size={26}/>
                        <span className="hidden nav-item-name mt-[3rem]">Register</span>{" "}
                    </Link>
                </li>
            </ul>
            )
              }


       


    </div>
  )
}

export default Navigation;
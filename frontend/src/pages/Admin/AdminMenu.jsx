import React, { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../redux/Api/usersApiSlice.js'
import { logout } from '../../redux/features/auth/authSlice.js'
import { Link } from 'react-router-dom'


const AdminMenu = () => {

    const[ isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
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

  return (
    <>
    <button className={`${isMenuOpen ?
    'top-2 right-2':'top-5 right-7'} bg-red-200 p-2 fixed rounded-lg`}
    onClick={toggleMenu}>{isMenuOpen ? (
        <FaTimes color='white' size={26}/>
    ):(
            <>

            <div className="w-6 h-0.5 bg-black my-1"></div>
            <div className="w-6 h-0.5 bg-black my-1"></div>
            <div className="w-6 h-0.5 bg-black my-1"></div>
            </>
    )}</button>

    {isMenuOpen && (
        <section className="bg-[#2E2D2D] p-4 fixed right-7 top-5">
            <ul className="list-none mt-2">
                <li>
                    <NavLink to="/admin/dashboard" 
                    className="list-item py-2 px-3 block mb-5 hover:bg-green-700 rounded-sm"
                    style={({isActive }) => ({
                        color: isActive ? 'greenyellow' : 'white'
                    })}>Admin Dashboard</NavLink>

                </li>

                <li>
                    <NavLink to="/admin/categories" 
                    className="list-item py-2 px-3 block mb-5 hover:bg-green-700 rounded-sm"
                    style={({isActive }) => ({
                        color: isActive ? 'greenyellow' : 'white'
                    })}>Create Category</NavLink>

                </li>

                <li>
                    <NavLink to="/admin/productlist" 
                    className="list-item py-2 px-3 block mb-5 hover:bg-green-700 rounded-sm"
                    style={({isActive }) => ({
                        color: isActive ? 'greenyellow' : 'white'
                    })}>Create Product</NavLink>

                </li>

                <li>
                    <NavLink to="/admin/allproductslist" 
                    className="list-item py-2 px-3 block mb-5 hover:bg-green-700 rounded-sm"
                    style={({isActive }) => ({
                        color: isActive ? 'greenyellow' : 'white'
                    })}>All Products</NavLink>

                </li>

                <li>
                    <NavLink to="/admin/users" 
                    className="list-item py-2 px-3 block mb-5 hover:bg-green-700 rounded-sm"
                    style={({isActive }) => ({
                        color: isActive ? 'greenyellow' : 'white'
                    })}>Manage Users</NavLink>

                </li>

                <li>
                    <NavLink to="/admin/orders" 
                    className="list-item py-2 px-3 block mb-5 hover:bg-green-700 rounded-sm"
                    style={({isActive }) => ({
                        color: isActive ? 'greenyellow' : 'white'
                    })}>ManageOrders</NavLink>

                </li>

                <li>
                                                        <Link to='/logout'
                                                        onClick={logoutHandler} 
                                                        className='block px-4 py-2 hover:bg-gray-100 text-orange-500' > 
                                                            Logout
                                                        </Link>
                                                        </li>
            </ul>
        </section>

    )
}

    </>
  )
}

export default AdminMenu;
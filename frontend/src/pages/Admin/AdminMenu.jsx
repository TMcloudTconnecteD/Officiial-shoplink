import React, { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'

const AdminMenu = () => {

    const[ isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
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
                    <NavLink to="/admin/categorylist" 
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
            </ul>
        </section>

    )
}

    </>
  )
}

export default AdminMenu;
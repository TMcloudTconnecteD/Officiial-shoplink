import React from 'react'

import { Outlet } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navigation from './pages/Auth/Navigation'

const App = () => {
  return (
    <>
        <ToastContainer />
        <Navigation  />
        < main className='bg-gray-100 py-3' >
        <Outlet />
        </main>
    
    </>
  )
}

export default App
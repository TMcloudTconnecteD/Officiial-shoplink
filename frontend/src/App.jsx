import React from 'react';

import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './pages/Auth/Navigation';
import InstallPrompt from './components/InstallPrompt.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <InstallPrompt />
      <Navigation />
      <main className="shoplink-shell" style={{ paddingTop: 'calc(var(--shoplink-header-height) + 18px)', paddingBottom: 'calc(var(--shoplink-bottom-nav-height) + 20px)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default App;
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 text-yellow-400 text-center p-4 shadow-inner z-40">
      <p className="text-sm font-semibold tracking-wide select-none">
        TMcloud &copy; <br /> aobizness@gmail.com  {currentYear}
      </p>
    </footer>
  );
};

export default Footer;

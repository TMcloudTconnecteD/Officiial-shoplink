import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 text-yellow-400 text-center py-6 px-6 shadow-inner z-40">
      <div className="flex flex-col items-center gap-2">
        {/* Centered name + year */}
        <p className="text-sm font-semibold tracking-wide select-none">
          &copy; TMcloud {currentYear}
        </p>

        {/* Email */}
        <p className="text-sm flex items-center gap-2">
          <FaEnvelope className="text-yellow-400" />
          <a
            href="mailto:aobizness@gmail.com"
            className="hover:underline hover:text-yellow-300 transition"
          >
            aobizness@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

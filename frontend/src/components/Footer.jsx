import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 text-cyan-400 text-center py-6 px-6 shadow-inner z-40">
      <div className="flex flex-col items-center gap-2">
       

        {/* Email */}
        <p className="text-sm flex items-center gap-2">
          <FaEnvelope className="text-cyan-400" />
          <a
            href="mailto:aobizness@gmail.com"
            className="hover:underline hover:text-cyan-300 transition"
          >
            aobizness@gmail.com
          </a>
        </p>

             {/* Centered name + year */}
        <p className="text-sm font-semibold tracking-wide select-none">
          &copy; TMcloud {currentYear}
        </p>

      </div>
    </footer>
  );
};

export default Footer;

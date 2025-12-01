// src/components/Footer.jsx
import React from "react";
import { FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="backdrop-glass rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/8 shadow-md">
          <div className="text-zinc-900 dark:text-zinc-100">
            <div className="font-semibold">TMcloud</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Shop smart — feel good
            </div>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-300 flex items-center gap-3">
            <FaEnvelope />
            <a href="mailto:aobizness@gmail.com" className="underline">
              aobizness@gmail.com
            </a>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            &copy; TMcloud {currentYear}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

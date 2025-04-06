import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      // Delay unmount to allow fade-out animation
      const timeout = setTimeout(() => setShowModal(false), 2000); // match transition time
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen && !showModal) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-2000 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>

      <div
        className={`bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-md z-10 transform transition-all duration-2000 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;

import React from 'react'
import { FaMotorcycle } from 'react-icons/fa'

const UltraLoader = () => {
  return (
    <div className="simple-loader">

      {/* Spinner */}
      <div className="spinner"></div>

      {/* Bike Icon */}
      <FaMotorcycle className="bike-icon" />

      <style>{`
        .simple-loader {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0c;
          z-index: 9999;
        }

        .spinner {
          width: 55px;
          height: 55px;
          border: 4px solid rgba(255,255,255,0.15);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
          margin-bottom: 18px;
        }

        .bike-icon {
          color: white;
          font-size: 30px;
          opacity: 0.9;
          animation: pulse 1.6s ease-in-out infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.6; transform: scale(0.95); }
        }
      `}</style>

    </div>
  )
}

export default UltraLoader

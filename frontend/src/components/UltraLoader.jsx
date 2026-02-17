import React from 'react'
import { FaMotorcycle } from 'react-icons/fa'

const UltraLoader = () => {
  return (
    <div className="ultra-loader">
      {/* Spinner */}
      <div className="ultra-spinner"></div>

      {/* Bike Icon */}
      <FaMotorcycle className="ultra-bike-icon" />

      <style>{`
        .ultra-loader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0c 0%, #1a1a2e 100%);
          z-index: 9999;
          overflow: hidden;
        }

        .ultra-spinner {
          width: 55px;
          height: 55px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
          margin-bottom: 18px;
        }

        .ultra-bike-icon {
          color: #10b981;
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

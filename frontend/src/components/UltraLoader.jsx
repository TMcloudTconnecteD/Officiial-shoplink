import React, { useEffect, useState } from 'react';
import { FaShoePrints, FaStore, FaMotorcycle } from 'react-icons/fa';

const UltraLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide loader after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999] animate-fadeIn">

      {/* Loader Container */}
      <div className="relative w-40 h-40 flex items-center justify-center">

        {/* Outer rotating halo */}
        <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent border-b-transparent animate-spin-slow opacity-80"></div>

        {/* Middle ring */}
        <div className="absolute inset-4 rounded-full border-4 border-primary border-r-transparent animate-spin-fast opacity-70"></div>

        {/* Inner ripple */}
        <div className="absolute w-24 h-24 rounded-full bg-accent opacity-30 animate-ping"></div>

        {/* Core orb */}
        <div className="absolute w-12 h-12 rounded-full bg-primary shadow-floating animate-pulse"></div>

        {/* ===== Floating Icons Orbiting Around ===== */}
        <FaShoePrints
          className="absolute text-primary text-2xl animate-spin-slow"
          style={{ top: '-18px', left: '50%', transform: 'translateX(-50%)' }}
        />

        <FaStore
          className="absolute text-secondary text-2xl animate-spin-slower"
          style={{ bottom: '-18px', left: '50%', transform: 'translateX(-50%)' }}
        />

        <FaMotorcycle
          className="absolute text-accent text-2xl animate-spin-fast"
          style={{ left: '-18px', top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Loading text */}
      <p className="mt-10 text-ink text-lg font-medium tracking-wide animate-floatUp opacity-90">
        Preparing your experience...
      </p>
    </div>
  );
};

export default UltraLoader;

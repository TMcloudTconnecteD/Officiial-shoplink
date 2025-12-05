import React from 'react';

const UltraLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
      
      {/* Loader Container */}
      <div className="relative w-32 h-32 flex items-center justify-center">

        {/* Outer rotating halo */}
        <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent border-b-transparent animate-spin-slow opacity-80"></div>

        {/* Mid ring shimmer */}
        <div className="absolute inset-3 rounded-full border-4 border-primary border-r-transparent animate-spin-fast opacity-70"></div>

        {/* Inner ripple effect */}
        <div className="absolute w-20 h-20 rounded-full bg-accent opacity-30 animate-ping"></div>

        {/* Core energy orb */}
        <div className="absolute w-10 h-10 rounded-full bg-primary shadow-floating animate-pulse"></div>
      </div>

      {/* Loading text */}
      <p className="mt-10 text-ink text-lg font-medium tracking-wide animate-fadeIn opacity-80">
        Preparing your experience...
      </p>

    </div>
  );
};

export default UltraLoader;

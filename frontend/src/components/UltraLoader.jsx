import React, { useEffect, useState } from 'react'
import { FaShoePrints, FaStore, FaMotorcycle } from 'react-icons/fa'

const UltraLoader = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999] animate-fadeIn">

      {/* Loader Container */}
      <div className="relative w-40 h-40 flex items-center justify-center">

        {/* Outer halo */}
        <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent border-b-transparent animate-spin-slow opacity-80"></div>
        <div className="absolute inset-4 rounded-full border-4 border-primary border-r-transparent animate-spin-fast opacity-70"></div>
        <div className="absolute w-24 h-24 rounded-full bg-accent opacity-30 animate-ping"></div>
        <div className="absolute w-12 h-12 rounded-full bg-primary shadow-floating animate-pulse"></div>

        {/* Orbiting icons */}
        <div className="absolute w-full h-full animate-bikeOrbit">
          <FaShoePrints className="text-primary text-2xl absolute top-0 left-1/2 -translate-x-1/2" />
        </div>
        <div className="absolute w-full h-full animate-bikeOrbit animate-delay-1500">
          <FaStore className="text-secondary text-2xl absolute bottom-0 left-1/2 -translate-x-1/2" />
        </div>
        <div className="absolute w-full h-full animate-bikeOrbit animate-delay-3000">
          <FaMotorcycle className="text-accent text-2xl absolute left-0 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <p className="mt-10 text-ink text-lg font-medium tracking-wide animate-floatUp opacity-90">
        Preparing your experience...
      </p>
    </div>
  )
}

export default UltraLoader

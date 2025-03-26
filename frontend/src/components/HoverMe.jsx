import React from 'react'

const HoverMe = () => {
  return (
    <div> <h1>Plaincss</h1>
    
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="group hover:bg-blue-100 p-4 rounded-lg transition-all cursor-pointer">
        <h2 className="text-2xl text-gray-700 group-hover:text-blue-600">
          Hover this entire card
        </h2>
        <p className="text-gray-500 group-hover:translate-x-2 transition-transform">
          I'll slide right →
        </p>
      </div>

    </div>
    </div>
  )
}

export default HoverMe;
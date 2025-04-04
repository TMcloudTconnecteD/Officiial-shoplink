import React from 'react'

const Messages = ({variant, children}) => {
        const getVariantClass = () => {
            switch (variant) {
        case 'success':
            return 'bg-green-100 text-green-700'
        case 'error':
            return 'bg-red-100 text-red-700'
         
         default:
             return 'bg-blue-100 text-blue-700'

    }}



  return (
   <div className={`p-4 rounded ${getVariantClass}`}>{children}</div>



  )
}

export default Messages;
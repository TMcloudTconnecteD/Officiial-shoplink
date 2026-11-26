import { FaMotorcycle } from 'react-icons/fa';
import ShopLinkMark from "./ShopLinkMark";

const UltraLoader = () => {
  return (
    <div className="ultra-loader" role="status" aria-label="Loading ShopLink">
      <div className="ultra-loader__brand">
        <ShopLinkMark className="ultra-loader__mark" />
        <strong>Shop-Link</strong>
      </div>
      <span className="ultra-loader__track" aria-hidden="true"><span /></span>
      <div className="ultra-loader__delivery">
        <FaMotorcycle aria-hidden="true" />
        <span>Getting your marketplace ready</span>
      </div>
    </div>
  )
}

export default UltraLoader

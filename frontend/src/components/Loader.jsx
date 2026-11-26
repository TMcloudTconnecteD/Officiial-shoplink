import ShopLinkMark from "./ShopLinkMark";

const Loader = ({ label = "Loading ShopLink", className = "" }) => (
  <div className={`shoplink-loader ${className}`.trim()} role="status" aria-label={label}>
    <ShopLinkMark className="shoplink-loader__mark" />
    <span className="shoplink-loader__track" aria-hidden="true">
      <span />
    </span>
    <span className="shoplink-loader__label">{label}</span>
  </div>
);

export default Loader;
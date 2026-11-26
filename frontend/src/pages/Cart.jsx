import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowRight, FaShoppingBag, FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";
import PageBackButton from "../components/PageBackButton";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems = [] } = useSelector((state) => state.cart);

  const updateQuantity = (product, quantity) => {
    dispatch(addToCart({ ...product, qty: Number(quantity) }));
  };

  const subtotal = cartItems.reduce((total, item) => total + item.qty * item.price, 0);
  const itemCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const hasUnavailableItems = cartItems.some((item) => {
    const stock = Number(item.inStock);
    return !Number.isFinite(stock) || stock < Number(item.qty);
  });

  return (
    <main className="cart-page">
      <PageBackButton />
      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <span className="cart-empty__icon" aria-hidden="true"><FaShoppingBag /></span>
          <p className="cart-eyebrow">YOUR BAG</p>
          <h1>Your cart is waiting</h1>
          <p>Explore the marketplace and add something you love.</p>
          <Link to="/shop" className="cart-primary-link">Browse shops <FaArrowRight aria-hidden="true" /></Link>
        </section>
      ) : (
        <>
          <header className="cart-header">
            <div>
              <p className="cart-eyebrow">YOUR BAG</p>
              <h1>Shopping cart</h1>
              <p>{itemCount} {itemCount === 1 ? "item" : "items"} selected</p>
            </div>
            <Link to="/shop" className="cart-continue-link">Continue shopping</Link>
          </header>
          <div className="cart-layout">
            <section className="cart-items" aria-label="Items in your cart">
              {cartItems.map((item) => {
                const stock = Number(item.inStock);
                const isOutOfStock = !Number.isFinite(stock) || stock < 1;
                const quantityExceedsStock = !isOutOfStock && item.qty > stock;
                return (
                  <article className="cart-item" key={item._id}>
                    <Link to={`/product/${item._id}`} className="cart-item__image">
                      <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                    </Link>
                    <div className="cart-item__details">
                      <Link to={`/product/${item._id}`} className="cart-item__name">{item.name}</Link>
                      {item.brand && <p className="cart-item__brand">{item.brand}</p>}
                      <p className="cart-item__price">KES {Number(item.price).toLocaleString()}</p>
                      {isOutOfStock && <p className="cart-item__warning">Currently out of stock. Remove this item to continue.</p>}
                      {quantityExceedsStock && <p className="cart-item__warning">Only {stock} available. Reduce the quantity to continue.</p>}
                    </div>
                    <div className="cart-item__controls">
                      <label htmlFor={`quantity-${item._id}`}>Quantity</label>
                      <select
                        id={`quantity-${item._id}`}
                        value={item.qty}
                        disabled={isOutOfStock}
                        aria-label={`Quantity for ${item.name}`}
                        onChange={(event) => updateQuantity(item, event.target.value)}
                      >
                        {Array.from({ length: Math.max(stock, item.qty) }, (_, index) => index + 1).map((quantity) => (
                          <option key={quantity} value={quantity}>
                            {quantity}{quantity > stock ? " (reduce)" : ""}
                          </option>
                        ))}
                      </select>
                      {quantityExceedsStock && (
                        <button className="cart-item__reduce" type="button" onClick={() => updateQuantity(item, stock)}>
                          Reduce to {stock}
                        </button>
                      )}
                    </div>
                    <p className="cart-item__total">KES {(item.qty * item.price).toLocaleString()}</p>
                    <button className="cart-item__remove" type="button" aria-label={`Remove ${item.name}`} onClick={() => dispatch(removeFromCart(item._id))}>
                      <FaTrash aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
            </section>
            <aside className="cart-summary">
              <h2>Order summary</h2>
              <div className="cart-summary__row"><span>Items ({itemCount})</span><span>KES {subtotal.toLocaleString()}</span></div>
              <div className="cart-summary__row cart-summary__note"><span>Delivery</span><span>Calculated at checkout</span></div>
              <div className="cart-summary__total"><span>Subtotal</span><strong>KES {subtotal.toLocaleString()}</strong></div>
              <button type="button" disabled={hasUnavailableItems} onClick={() => navigate("/shipping")} className="cart-checkout">
                Continue to checkout <FaArrowRight aria-hidden="true" />
              </button>
              {hasUnavailableItems && <p className="cart-summary__warning">Update or remove unavailable quantities before checkout.</p>}
              <p className="cart-summary__secure">Your final delivery cost is shown before you place your order.</p>
            </aside>
          </div>
        </>
      )}
    </main>
  );
};

export default Cart;

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  return (
    <div className="container mx-auto px-4 mt-6 overflow-x-hidden">
      {cartItems.length === 0 ? (
        <div className="text-center text-gray-600">
          Your cart is empty{" "}
          <Link to="/shop" className="text-cyan-500 underline">
            Go To Shop
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center bg-white shadow-md rounded-lg p-4 mb-4"
              >
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 sm:ml-4 text-center sm:text-left mt-3 sm:mt-0">
                  <Link
                    to={`/product/${item._id}`}
                    className="text-pink-500 font-medium block"
                  >
                    {item.name}
                  </Link>
                  <div className="text-green-500">{item.brand}</div>
                  <div className="text-cyan-600 font-bold">
                    KES {item.price}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-3 sm:mt-0 w-24">
                  <select
                    className="w-full p-2 border rounded-md text-black"
                    value={item.qty}
                    onChange={(e) =>
                      addToCartHandler(item, Number(e.target.value))
                    }
                  >
                    {[...Array(item.inStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove */}
                <button
                  className="text-red-500 ml-4 mt-3 sm:mt-0"
                  onClick={() => removeFromCartHandler(item._id)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-1/3 bg-white shadow-lg rounded-lg p-6 h-fit">
            <h2 className="text-xl font-semibold mb-2">
              Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </h2>
            <div className="text-2xl font-bold text-gray-800">
              KES{" "}
              {cartItems
                .reduce((acc, item) => acc + item.qty * item.price, 0)
                .toFixed(2)}
            </div>
            <button
              className="bg-cyan-500 hover:bg-cyan-600 transition-colors mt-4 py-3 px-6 rounded-full text-white text-lg w-full"
              disabled={cartItems.length === 0}
              onClick={checkoutHandler}
            >
              Proceed To Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

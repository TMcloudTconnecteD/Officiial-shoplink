import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/Api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import { FaMoneyCheckAlt } from "react-icons/fa";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      // Log the shop for each product in the cart
      cart.cartItems.forEach((item) => {
        console.log(`Product: ${item.name}, Shop: ${typeof item.shop === 'object' ? item.shop.name : item.shop}`);
      });

      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        shop: cart.cartItems.length > 0 ? (typeof cart.cartItems[0].shop === 'object' ? cart.cartItems[0].shop._id : cart.cartItems[0].shop) : undefined,
      }).unwrap();

      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error?.data?.message || error?.error || "Error placing order");
    }
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="container mx-auto mt-8 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 max-w-screen-lg" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px] sm:min-w-full">
              <thead>
                <tr>
                  <td className="px-1 py-2 text-left align-top">Image</td>
                  <td className="px-1 py-2 text-left">Product</td>
                  <td className="px-1 py-2 text-left">Quantity</td>
                  <td className="px-1 py-2 text-left">Price</td>
                  <td className="px-1 py-2 text-left">Total</td>
                </tr>
              </thead>

              <tbody>
                {cart.cartItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                    </td>
                    <td className="p-2">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                      <div className="text-sm text-gray-600">Shop: {typeof item.shop === 'object' ? item.shop.name : item.shop}</div>
                    </td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2">{item.price.toFixed(2)}</td>
                    <td className="p-2">
                      KES {(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-5">Order Summary</h2>
          <div className="flex flex-col sm:flex-row justify-between flex-wrap p-8 bg-purple-400 rounded-lg gap-6">
            <ul className="text-lg flex-1 min-w-[200px]">
              <li>
                <span className="font-semibold mb-4 block">Items:</span> KES {cart.itemsPrice}
              </li>
              <li>
                <span className="font-semibold mb-4 block">Shipping:</span> KES {cart.shippingPrice}
              </li>
              <li>
                <span className="font-semibold mb-4 block">Tax:</span> KES {cart.taxPrice}
              </li>
              <li>
                <span className="font-semibold mb-4 block">Total:</span> KES {cart.totalPrice}
              </li>
            </ul>

            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-semibold mb-4">Shipping</h2>
              <p>
                <strong>Address:</strong> {cart.shippingAddress.address},{" "}
                {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}
              </p>
            </div>

            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <strong>Method:</strong> {cart.paymentMethod}
            </div>
          </div>

          {error && (
            <Message variant="danger" className="mt-4">
              {error?.data?.message || error?.error || 'Your network is crazy'}
            </Message>
          )}

          <button
            type="button"
            className="bg-cyan-500 hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 text-white py-2 px-4 rounded-full text-lg w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cart.cartItems.length === 0 || isLoading}
            onClick={placeOrderHandler}
          >
            <FaMoneyCheckAlt className={isLoading ? "animate-spin text-xl" : "text-xl"} />
            Place Order
          </button>

          {isLoading }
        </div>
      </div>
    </>
  );
};

export default PlaceOrder;

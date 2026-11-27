import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/Api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { useGetPromoSettingsQuery, useGetRewardsQuery } from "../../redux/Api/marketingApiSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { data: promoSettings } = useGetPromoSettingsQuery();
  const { data: rewards, isLoading: loadingRewards, error: rewardsError } = useGetRewardsQuery(undefined, { skip: !userInfo });
  const [rewardPointsToUse, setRewardPointsToUse] = useState(0);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const availablePoints = Number(rewards?.user?.availablePoints || 0);
  const maxRedeemablePoints = Math.min(availablePoints, Math.floor(Number(cart.totalPrice || 0) * 10));
  const appliedPoints = Math.min(
    Math.max(0, Math.floor(Number(rewardPointsToUse) || 0)),
    maxRedeemablePoints
  );
  const rewardsDiscount = Number((appliedPoints / 10).toFixed(2));
  const legacyRewardCredit = rewards?.rewardCredits?.find((credit) => credit.status === "available");
  const legacyRewardDiscount = appliedPoints === 0 && legacyRewardCredit
    ? Math.min(Number(cart.totalPrice || 0), Number(legacyRewardCredit.discountAmount || 0))
    : 0;
  const finalTotal = Math.max(0, Number((Number(cart.totalPrice || 0) - rewardsDiscount - legacyRewardDiscount).toFixed(2)));
  const rewardsEnabled = promoSettings?.rewardProgramEnabled !== false
    && rewards?.rewardProgramEnabled !== false;

  useEffect(() => {
    if (!cart.shippingAddress.phone) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.phone, navigate]);

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
        rewardPointsToUse: appliedPoints,
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
                <span className="font-semibold mb-4 block">Subtotal:</span> KES {Number(cart.totalPrice || 0).toFixed(2)}
              </li>
              {appliedPoints > 0 && (
                <li className="text-emerald-950">
                  <span className="font-semibold mb-4 block">
                    Rewards discount: -KES {rewardsDiscount.toFixed(2)} (from {appliedPoints.toLocaleString()} points)
                  </span>
                </li>
              )}
              {legacyRewardDiscount > 0 && (
                <li className="text-emerald-950">
                  <span className="font-semibold mb-4 block">Existing reward credit: -KES {legacyRewardDiscount.toFixed(2)}</span>
                </li>
              )}
              <li>
                <span className="font-semibold mb-4 block">Final total:</span> KES {finalTotal.toFixed(2)}
              </li>
            </ul>

            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-semibold mb-4">Shipping</h2>
              <p>
                <strong>Phone:</strong> {cart.shippingAddress.phone},{" "}
                {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}, {cart.shippingAddress.apartment}
              </p>
            </div>

            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <strong>Method:</strong> {cart.paymentMethod}
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${userInfo ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
            <p className="font-semibold text-emerald-950">ShopLink Rewards</p>
            <p className="mt-1 text-sm text-emerald-900">
              {userInfo
                ? `${availablePoints.toLocaleString()} points available. Every point is worth KES 0.10; points are deducted after payment is confirmed.`
                : "Sign in to use your points at checkout. Earn points when you pay for orders and when friends you refer complete their first order."}
            </p>
            {userInfo && (
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="grid gap-1 text-sm font-semibold text-emerald-950">
                  Points to use
                  <input
                    type="number"
                    min="0"
                    max={maxRedeemablePoints}
                    step="1"
                    value={rewardPointsToUse}
                    disabled={!rewardsEnabled || loadingRewards || !rewards?.user || maxRedeemablePoints === 0}
                    onChange={(event) => setRewardPointsToUse(Math.max(0, Math.floor(Number(event.target.value) || 0)))}
                    className="min-h-10 w-36 rounded-lg border border-emerald-200 bg-white px-3"
                    aria-label="Reward points to use"
                  />
                </label>
                <button
                  type="button"
                  disabled={!rewardsEnabled || loadingRewards || !rewards?.user || maxRedeemablePoints === 0}
                  onClick={() => setRewardPointsToUse(maxRedeemablePoints)}
                  className="min-h-10 rounded-lg border border-emerald-700 px-3 text-sm font-bold text-emerald-800 disabled:opacity-50"
                >
                  Use maximum
                </button>
                <Link to="/my-rewards" className="text-sm font-bold text-emerald-800 underline">
                  My Rewards
                </Link>
              </div>
            )}
            {userInfo && appliedPoints > 0 && (
              <p className="mt-3 text-sm font-bold text-emerald-950">
                Rewards discount: -KES {rewardsDiscount.toFixed(2)} (from {appliedPoints.toLocaleString()} points)
              </p>
            )}
            {userInfo && legacyRewardDiscount > 0 && (
              <p className="mt-2 text-sm font-bold text-emerald-950">
                Your existing KES {Number(legacyRewardCredit?.discountAmount || 0).toFixed(2)} reward credit applies when you don't select points.
              </p>
            )}
            {userInfo && !rewardsEnabled && (
              <p className="mt-2 text-sm text-amber-800" role="status">Rewards redemption is temporarily paused.</p>
            )}
            {userInfo && rewardsError && (
              <p className="mt-2 text-sm text-red-700" role="alert">
                Your points wallet could not be loaded. Refresh checkout before applying rewards.
              </p>
            )}
            {!userInfo && <Link to="/login?redirect=%2Fplaceorder" className="mt-2 inline-flex font-semibold text-emerald-800 underline">Sign in to use points</Link>}
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

          {isLoading && <Loader />}
        </div>
      </div>
    </>
  );
};

export default PlaceOrder;

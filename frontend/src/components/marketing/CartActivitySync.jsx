import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useUpdateCartActivityMutation } from "../../redux/Api/marketingApiSlice";

const CartActivitySync = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const [updateCartActivity] = useUpdateCartActivityMutation();
  const previousSignature = useRef(null);
  const userId = userInfo?._id || userInfo?.id;
  const signature = cartItems
    .map((item) => `${item._id}:${Number(item.qty) || 1}`)
    .sort()
    .join("|");

  useEffect(() => {
    if (!userId || userInfo?.isAdmin || userInfo?.isSuperAdmin) {
      previousSignature.current = null;
      return;
    }
    if (previousSignature.current === signature) return;
    previousSignature.current = signature;

    updateCartActivity({ itemCount: cartItems.reduce((sum, item) => sum + (Number(item.qty) || 1), 0) })
      .unwrap()
      .catch((error) => console.error("Could not sync cart activity:", error));
  }, [cartItems, signature, updateCartActivity, userId, userInfo?.isAdmin, userInfo?.isSuperAdmin]);

  return null;
};

export default CartActivitySync;

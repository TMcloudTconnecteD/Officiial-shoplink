import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState("PayPal");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");
  // M-Pesa phone is collected at payment step; no longer store it here

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    dispatch(savePaymentMethod(paymentMethod));

  // Phone number collection moved to payment UI (order page)

    navigate("/placeorder");
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [navigate, shippingAddress]);

  return (
    <div className="container mx-auto bg-gray-800 mt-10">
      <ProgressSteps step1 step2 />
      <div className="mt-[10rem] flex justify-around items-center flex-wrap">
        <form onSubmit={submitHandler} className="w-[40rem]">
          <h1 className="text-2xl  text-white font-semibold mb-4">Shipping 🚀</h1>

          {/* Address Fields */}
          <div className="mb-4">
            <label className="block text-orange-500 mb-2">Address:</label>
            <input
              type="text"
              className="w-full p-2 bg-white-100 border rounded"
              placeholder="Enter address"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-orange-500 mb-2">City:</label>
            <input
              type="text"
              className="w-full p-2 border bg-white rounded"
              placeholder="Enter city"
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-orange-500 mb-2">Postal-Code:</label>
            <input
              type="text"
              className="w-full p-2 border bg-white-100 rounded"
              placeholder="Enter postal code"
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-orange-500 mb-2">Country:</label>
            <input
              type="text"
              className="w-full p-2 bg-white-100 border rounded"
              placeholder="Enter country"
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-yellow-500 font-semibold mb-2">
              Select Payment Method:
            </label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 bg-purple-200 px-4 py-3 rounded-md cursor-pointer hover:bg-purple-300 transition">
                <input
                  type="radio"
                  className="form-radio text-pink-500"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === "PayPal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="font-medium">PayPal / Credit Card</span>
              </label>

              <label className="flex items-center gap-2 bg-purple-200 px-4 py-3 rounded-md cursor-pointer hover:bg-purple-300 transition">
                <input
                  type="radio"
                  className="form-radio text-green-600"
                  name="paymentMethod"
                  value="Mpesa"
                  checked={paymentMethod === "Mpesa"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="font-medium">M-Pesa</span>
              </label>
            </div>
          </div>

          {/* M-Pesa phone is collected at payment step (Order page) */}

          {/* Submit Button */}
          <button
            className="bg-cyan-500 text-white py-2 px-4 rounded-full text-lg w-full hover:bg-pink-600 transition"
            type="submit"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;

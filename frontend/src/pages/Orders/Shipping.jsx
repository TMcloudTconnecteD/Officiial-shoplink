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
  const [apartment, setApartment] = useState(shippingAddress.apartment || "");


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [navigate, shippingAddress]);

  return (
    <div className="container mx-auto mt-10 px-6">
      <ProgressSteps step1 step2 />

      <div className="mt-24 flex justify-center items-center">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 backdrop-blur-md border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-center text-cyan-400 mb-8 tracking-wide">
            Shipping 🚀
          </h1>

          {/* Address Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Address
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-500"
                placeholder="Enter address"
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                City
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-500"
                placeholder="Enter city"
                value={city}
                required
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Postal Code
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-500"
                placeholder="Enter postal code"
                value={postalCode}
                required
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Country
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-500"
                placeholder="Enter country"
                value={country}
                required
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

              <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Apartment
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-500"
                placeholder="Enter Apartment name, number, landpoint"
                value={apartment}
                required={false}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>

          </div>

          {/* Payment Methods */}
          <div className="mt-8">
            <label className="block text-gray-200 font-semibold mb-4 text-lg">
              Select Payment Method
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 bg-gray-800 border border-gray-600 px-5 py-4 rounded-xl cursor-pointer hover:border-cyan-400 transition">
                <input
                  type="radio"
                  className="accent-cyan-400"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === "PayPal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="text-gray-200 font-medium">
                  PayPal / Credit Card
                </span>
              </label>

              <label className="flex items-center gap-3 bg-gray-800 border border-gray-600 px-5 py-4 rounded-xl cursor-pointer hover:border-cyan-400 transition">
                <input
                  type="radio"
                  className="accent-green-500"
                  name="paymentMethod"
                  value="Mpesa"
                  checked={paymentMethod === "Mpesa"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="text-gray-200 font-medium">M-Pesa</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="mt-10 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-xl text-lg w-full font-semibold tracking-wide shadow-lg hover:scale-105 hover:shadow-cyan-500/40 transition-all"
            type="submit"
          >
            Continue ➝
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { useInitiateMpesaPaymentMutation, useCheckMpesaPaymentStatusQuery } from "../redux/Api/mpesaApiSlice";

const formatPhone = (value) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 10); // Max 10 digits
  const parts = [];

  if (digitsOnly.length > 0) parts.push(digitsOnly.slice(0, 4));
  if (digitsOnly.length > 4) parts.push(digitsOnly.slice(4, 7));
  if (digitsOnly.length > 7) parts.push(digitsOnly.slice(7, 10));

  return parts.join(" ");
};

const isValidSafaricom = (number) => /^07[01249]\d{7}$/.test(number);

const MpesaButton = ({ totalPrice, orderId, initialPhone = "", onPhoneChange, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const { data: paymentStatus } = useCheckMpesaPaymentStatusQuery(checkoutRequestId, {
    skip: !checkoutRequestId,
  });
  const [initiatePayment] = useInitiateMpesaPaymentMutation();

  useEffect(() => {
    if (!checkoutRequestId) return;

    if (paymentStatus) {
      if (paymentStatus.success && paymentStatus.data.ResultCode === '0') {
        setLoading(false);
        toast.success('Payment completed successfully!');
        onSuccess?.();
        setCheckoutRequestId(null);
      } else if (paymentStatus.data.ResultCode !== '1032') {
        setLoading(false);
        toast.error(paymentStatus.data.ResultDesc || 'Payment failed');
        setCheckoutRequestId(null);
      }
    }
  }, [paymentStatus, onSuccess]);

  const handleChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const formatted = formatPhone(digits);
    setPhoneNumber(formatted);

    if (digits.length === 10) {
      if (isValidSafaricom(digits)) {
        onPhoneChange?.(digits);
      } else {
        toast.error("Invalid Safaricom number.");
      }
    }
  };

  const handleMpesaPayment = async () => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (!digits || digits.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const formattedPhone = digits.startsWith("254")
      ? digits
      : digits.replace(/^0/, "254");

    try {
      setLoading(true);

      const res = await initiatePayment({
        phoneNumber: formattedPhone,
        amount: totalPrice,
        orderId: orderId,
      }).unwrap();

      if (res.success) {
        toast.success("Payment initiated - Check your phone");
        setCheckoutRequestId(res.data.CheckoutRequestID);
      } else {
        toast.error(res.message || "Payment initiation failed");
        setLoading(false);
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="flex items-center mb-4">
        <svg 
          className="w-8 h-8 mr-2 text-green-600" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
        <h3 className="text-lg font-semibold text-gray-800">M-Pesa Payment</h3>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mpesa-number">
          Phone Number
        </label>
        <input
          id="mpesa-number"
          type="tel"
          value={phoneNumber}
          onChange={handleChange}
          placeholder="e.g. 0712 345 678"
          pattern="[0-9]{10,13}"
          inputMode="numeric"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
        />
      </div>

      <button
        className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center space-x-2 transition-all ${
          loading || !phoneNumber 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 shadow-md'
        }`}
        onClick={handleMpesaPayment}
        disabled={loading || !phoneNumber}
      >
        {loading ? (
          <>
            <Loader />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-5 h-5 text-white" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <span>Pay KES {totalPrice.toLocaleString()}</span>
          </>
        )}
      </button>
      
      <p className="mt-3 text-xs text-gray-500 text-center">
        You'll receive an M-Pesa prompt on your phone to complete payment
      </p>
    </div>
  );
};

export default MpesaButton;

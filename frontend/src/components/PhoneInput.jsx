import { useState } from "react";

const PhoneInput = ({ onValidNumber }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  // Format as user types
  const formatPhone = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10); // Max 10 digits
    const parts = [];

    if (digitsOnly.length > 0) parts.push(digitsOnly.slice(0, 4));
    if (digitsOnly.length > 4) parts.push(digitsOnly.slice(4, 7));
    if (digitsOnly.length > 7) parts.push(digitsOnly.slice(7, 10));

    return parts.join(" ");
  };

  // Validate number
  const isValidSafaricom = (number) => /^07[01249]\d{7}$/.test(number);

  const handleChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const formatted = formatPhone(digits);
    setInput(formatted);

    if (digits.length === 10) {
      if (isValidSafaricom(digits)) {
        setError("");
        onValidNumber(digits); // callback with clean number
      } else {
        setError("Invalid Safaricom number.");
      }
    } else {
      setError("");
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Phone Number (Safaricom)</label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={13}
        value={input}
        onChange={handleChange}
        placeholder="e.g. 0712 345 678"
        className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PhoneInput;

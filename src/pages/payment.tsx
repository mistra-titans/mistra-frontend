
import React, { useState } from "react";
import AdminLayout from "../components/layout";
import { CreditCard } from "lucide-react";
import Button from "../components/button";
import Card from "../components/card";
import OTPModal from "../components/OTPmodal"; // Import the new OTP modal component

type PaymentErrors = {
  cardNumber?: string;
  amount?: string;
  description?: string;
};

const Payment = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    cardNumber: string;
    amount: string;
    description: string;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: { target: { value: string } }) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: "" }));
    }
  };

  const handleDescriptionChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  const handleAmountChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setAmount(e.target.value);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: PaymentErrors = {};

    // Validate card number (basic validation)
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanCardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (numAmount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (numAmount > 100000) {
      newErrors.amount = "Amount cannot exceed ₵100,000";
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 3) {
      newErrors.description = "Description must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Store payment data and open modal for OTP verification
    const data = {
      cardNumber,
      amount,
      description,
    };
    setPaymentData(data);
    setIsModalOpen(true);
  };

  // Handle OTP verification and actual payment
  const handleOtpVerification = async (data: {
    cardNumber: string;
    amount: string;
    description: string;
  }) => {
    try {
      setPaymentLoading(true);
      
      // Your payment processing logic here
      console.log("Processing payment:", data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Close modal on success
      setIsModalOpen(false);
      setPaymentData(null);

      // Reset form
      setCardNumber("");
      setAmount("");
      setDescription("");

      alert("Payment successful!");
    } catch (error) {
      console.error("Payment submission error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setPaymentData(null);
    setPaymentLoading(false);
  };

  // Custom resend OTP function
  const handleResendOtp = async () => {
    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: "user@example.com", // You might want to pass this as prop
          // transactionId: paymentData?.transactionId 
        }),
      });
      
      if (response.ok) {
        alert("OTP has been resent to your email address");
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error) {
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <AdminLayout title="payment">
      <div className="p-4 min-h-screen">
        {/* Main Content - Centered on mobile, side-by-side on desktop */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {/* Using Card component for both image and form */}
            <Card width="w-full" className="max-w-4xl" height="h-auto">
              <div className="lg:flex lg:items-center lg:gap-8">
                {/* Image - Only visible on desktop */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-center">
                  <div className="w-full max-w-lg">
                    <img
                      src="image_5.jpg"
                      alt="Secure Payment"
                      className="w-full h-auto max-h-[500px] rounded-xl object-cover"
                    />
                  </div>
                </div>

                {/* Payment Form */}
                <div className="w-full lg:flex-1 lg:max-w-2xl">
                  <div className="flex flex-row justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
                      Transaction
                    </h2>

                    <div className="min-w-16 min-h-16 sm:min-w-5 sm:min-h-5 bg-gradient-to-br from-indigo-600 rounded-full flex items-center justify-center animate-pulse -mt-3">
                      <img
                        src="image_7.jpg"
                        alt="qr code"
                        className="w-16 h-16 object-cover opacity-30 rounded-full"
                      />
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                  >
                    {/* Card Number */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`w-full pl-3 pr-10 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.cardNumber
                              ? "border-red-300"
                              : "border-gray-200"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                      </div>
                      {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base font-medium">
                          ₵
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className={`w-full pl-7 pr-3 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.amount ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={description}
                          onChange={handleDescriptionChange}
                          placeholder="What's this payment for?"
                          maxLength={100}
                          className={`w-full pl-3 pr-10 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.description
                              ? "border-red-300"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Send Payment Button */}
                    <Button
                      name="Send Transaction"
                      loading={false}
                      type="submit"
                      className="w-full bg-blue-600 text-white px-4 py-4 sm:py-5 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] touch-manipulation"
                    />
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* OTP Modal using the new separate component */}
      <OTPModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onVerify={handleOtpVerification}
        loading={paymentLoading}
        paymentData={paymentData}
        title="Verify Transaction"
        subtitle="Enter the 6-digit OTP sent to your registered email address"
        showTransactionSummary={true}
        otpLength={6}
        modalSize="md"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        onResendOtp={handleResendOtp}
        customOtpEndpoint="/api/verify-otp" // Update with your actual endpoint
      />
    </AdminLayout>
  );
};

export default Payment;
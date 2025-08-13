import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout';
import { CreditCard, X, Shield } from 'lucide-react';
import { usePayment } from '../contexts/authpayment.tsx';
import Button from '../components/button.tsx';

type OTPModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (paymentData: any) => void;
  loading: boolean;
  paymentData: any;
};

const OTPModal: React.FC<OTPModalProps> = ({ isOpen, onClose, onVerify, loading, paymentData }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
    }
  }, [isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const newInput = document.getElementById(`otp-${index + 1}`);
      newInput?.focus();
    }
    if (otpError) setOtpError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length != 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    try {
      const response = await fetch('###', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpString })
      });

      const data = await response.json();

      if (data.ok) {
        onVerify(paymentData);
      }
      else {
        setOtpError('Invalid OTP. Please try again');
      }
    }
    catch (error) {
      setOtpError('Network Error');
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);

    setTimeout(() => {
      setResendLoading(false);
      alert('OTP has been resent to your email address');
    }, 2000);
  };
  if (!isOpen) return null;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 relative animate-in fade-in duration-200">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Transaction</h2>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit OTP sent to your registered email address
          </p>
        </div>

        {/* Transaction Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">${paymentData?.amount}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">To:</span>
            <span className="font-semibold text-gray-900">
              {paymentData?.cardNumber?.replace(/(\d{4})/g, '$1 ').trim()}
            </span>
          </div>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter OTP
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 border-2 border-gray-200 rounded-lg text-center text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            ))}
          </div>
          {otpError && (
            <p className="text-red-500 text-sm text-center mt-2">{otpError}</p>
          )}
        </div>

        {/* Resend OTP */}
        <div className="text-center mb-6">
          <button
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            name= 'Cancel'
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-blue-500 transition-colors"

          />
          <Button
            name= 'Verify and Send'
            type= "submit"
            loading = {loading}
            onClick={handleVerifyOtp}
            className= "flex-1 px-4 py-3  text-white rounded-xl font-semibold  disabled:opacity-75 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          />
        </div>
      </div>
    </div>
  );
};

const Payment = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  type PaymentErrors = {
    cardNumber?: string;
    amount?: string;
    description?: string;
  };
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{ cardNumber: string; amount: string; description: string } | null>(null);

  // Use the payment context
  const { sendPayment, loading } = usePayment();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: { target: { value: string; }; }) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleDescriptionChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  const handleAmountChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setAmount(e.target.value);
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: PaymentErrors = {};

    // Validate card number (basic validation)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (numAmount > 100000) {
      newErrors.amount = 'Amount cannot exceed $10,000';
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Modified handleSubmit to open modal instead of direct payment
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Store payment data and open modal for OTP verification
    const data = {
      cardNumber,
      amount,
      description
    };
    setPaymentData(data);
    setIsModalOpen(true);
  };

  // Handle OTP verification and actual payment
  const handleOtpVerification = async (data: { cardNumber: string; amount: string; description: string }) => {
    try {
      const result = await sendPayment(data);

      if (result.success) {
        // Clear form on success
        setCardNumber('');
        setAmount('');
        setDescription('');
        setErrors({});
        setIsModalOpen(false);

        // Show success message
        alert(`Payment sent successfully! Transaction ID: ${result.transactionId}`);
      } else {
        // Show error message but keep modal open
        alert(`Payment failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setPaymentData(null);
  };

  return (
    <AdminLayout title='payment'>
      <div className='p-4  min-h-screen'>
        {/* Header */}
        <div className='mb-6 text-left ml-2 md:ml-35 '>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Make a Transaction
          </h1>
          <p className='text-gray-600 text-base'>
            Send money quickly and securely
          </p>
        </div>

        {/* Main Content - Centered on mobile, side-by-side on desktop */}
        <div className='flex justify-center'>
          <div className='w-full max-w-4xl'>
            {/* Container with image and form */}
            <div className='lg:flex lg:items-center lg:gap-8 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:p-6'>
              
              {/* Image - Only visible on desktop */}
              <div className='hidden lg:flex lg:flex-1 lg:justify-center'>
                <div className='w-full max-w-lg'>
                  <img 
                    src="image_5.jpg" 
                    alt="Secure Payment" 
                    className="w-full h-auto max-h-[500px] rounded-xl object-cover"
                  />
                </div>
              </div>

              {/* Payment Form */}
              <div className='w-full lg:flex-1 lg:max-w-2xl'>
                <div className='bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:shadow-none lg:bg-transparent lg:p-0'>
                  <div className='flex flex-row justify-between'>
                    <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center'>
                       Transaction
                    </h2>

                    <div className='min-w-16 min-h-16 sm:min-w-5 sm:min-h-5    bg-gradient-to-br from-indigo-600  rounded-full flex items-center justify-center animate-pulse -mt-3'>
                      <img src="image_7.jpg" alt="qr code" className='w-16 h-16 object-cover opacity-30 rounded-full' />
                  </div>
                  </div>

                  <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-5'>
                    {/* Card Number */}
                    <div>
                      <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-2'>
                        Account Number
                      </label>
                      <div className='relative'>
                        <input
                          type='text'
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder='1234 5678 9012 3456'
                          maxLength={19}
                          className={`w-full pl-3 pr-10 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.cardNumber ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                        <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                          <CreditCard className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400' />
                        </div>
                      </div>
                      {errors.cardNumber && (
                        <p className='text-red-500 text-xs mt-1'>{errors.cardNumber}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-2'>
                        Amount
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base font-medium'>
                          ₵
                        </span>
                        <input
                          type='number'
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder='0.00'
                          step='0.01'
                          min='0'
                          className={`w-full pl-7 pr-3 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.amount ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                      </div>
                      {errors.amount && (
                        <p className='text-red-500 text-xs mt-1'>{errors.amount}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-2'>
                        Description
                      </label>
                      <div className='relative'>
                        <input
                          type='text'
                          value={description}
                          onChange={handleDescriptionChange}
                          placeholder="What's this payment for?"
                          maxLength={100}
                          className={`w-full pl-3 pr-10 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.description ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                      </div>
                      {errors.description && (
                        <p className='text-red-500 text-xs mt-1'>{errors.description}</p>
                      )}
                    </div>

                    {/* Send Payment Button */}
                    <Button
                      name='Send Transaction'
                      loading={false}
                      type="submit"
                      className={`w-full text-white px-4 py-4 sm:py-5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] touch-manipulation`}
                    />
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onVerify={handleOtpVerification}
        loading={loading}
        paymentData={paymentData}
      />
    </AdminLayout>
  );
};

export default Payment;
import React, { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import Modal from "./modal"; // Adjust import path as needed
import Button from "./button"; // Adjust import path as needed

export type OTPModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otpValue: string) => void; // Changed to pass OTP string directly
  loading?: boolean;
  paymentData?: any;
  title?: string;
  subtitle?: string;
  showTransactionSummary?: boolean;
  otpLength?: number;
  modalSize?: "sm" | "md" | "lg";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  onResendOtp?: () => Promise<void>;
};

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  loading = false,
  paymentData,
  title = "Verify Transaction",
  subtitle = "Enter the 6-digit OTP sent to your registered phone number",
  showTransactionSummary = true,
  otpLength = 6,
  modalSize = "md",
  closeOnOverlayClick = false,
  closeOnEscape = true,
  showCloseButton = true,
  onResendOtp,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // Reset OTP when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(otpLength).fill(""));
      setOtpError("");
    }
  }, [isOpen, otpLength]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < otpLength - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Clear error when user starts typing
    if (otpError) setOtpError("");
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== otpLength) {
      setOtpError(`Please enter all ${otpLength} digits`);
      return;
    }

    // Call the parent's onVerify function with the OTP string
    onVerify(otpString);
  };

  const handleResendOtp = async () => {
    if (onResendOtp) {
      try {
        setResendLoading(true);
        await onResendOtp();
      } catch (error) {
        console.error("Error resending OTP:", error);
      } finally {
        setResendLoading(false);
      }
    } else {
      // Default resend behavior
      setResendLoading(true);
      setTimeout(() => {
        setResendLoading(false);
        alert("OTP has been resent to your phone number");
      }, 2000);
    }
  };

  const formatAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return "";
    return accountNumber.replace(/(\d{4})/g, "$1 ").trim();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
      showCloseButton={showCloseButton}
      className="animate-in fade-in duration-200"
    >
      <div className="text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>

        {/* Transaction Summary */}
        {showTransactionSummary && paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            {paymentData.amount && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  ₵{paymentData.amount}
                </span>
              </div>
            )}
            {paymentData.account && (
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Account:</span>
                <span className="font-semibold text-gray-900">
                  {formatAccountNumber(paymentData.account)}
                </span>
              </div>
            )}
            {paymentData.phone && (
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold text-gray-900">
                  {paymentData.phone}
                </span>
              </div>
            )}
            {paymentData.provider && (
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Provider:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {paymentData.provider}
                </span>
              </div>
            )}
          </div>
        )}

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
                onChange={(e) =>
                  handleOtpChange(index, e.target.value.replace(/\D/, ""))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 border-2 border-gray-200 rounded-lg text-center text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
          {otpError && (
            <p className="text-red-500 text-sm text-center mt-2" role="alert">
              {otpError}
            </p>
          )}
        </div>

        {/* Resend OTP */}
        <div className="text-center mb-6">
          <button
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {resendLoading ? "Sending..." : "Didn't receive OTP? Resend"}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            name="Cancel"
            onClick={onClose}
            disabled={loading}
            className="flex-1 !bg-gray-500 hover:!bg-gray-600"
          />
          <Button
            name="Verify"
            type="button"
            loading={loading}
            onClick={handleVerifyOtp}
            disabled={loading || otp.join("").length !== otpLength}
            className="flex-1"
          />
        </div>
      </div>
    </Modal>
  );
};

export default OTPModal;
import React, { useState } from "react";
import Button from "./button";
import Modal from "./modal";
import Input from "./Input";
import { useTransaction } from "../contexts/use-transactions";
import { useAccount } from "../contexts/use-account";
import { useMutation } from "@tanstack/react-query";
import { API } from "../contexts/api"; // Adjust import path as needed

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const { createTransaction } = useTransaction();
  const { accounts } = useAccount();

  const [transferData, setTransferData] = useState({
    recipient_account: "",
    sender_account: "",
    amount: 1,
    currency: "",
    type: "",
  });

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);

  // OTP Verification mutation
  const verifyTransaction = useMutation({
    mutationKey: ["verifyTransaction"],
    mutationFn: async (otp: string) => {
      const res = await API.post(`/transaction/verify/${otp}`);
      return res.data;
    },
  });

  const resetForm = () => {
    setTransferData({
      recipient_account: "",
      sender_account: "",
      amount: 1,
      currency: "",
      type: "",
    });
    setOtpValue("");
    setPendingTransactionId(null);
  };

  const handleTransfer = async () => {
    if (
      !transferData.recipient_account.trim() ||
      !transferData.sender_account.trim() ||
      !transferData.amount ||
      !transferData.currency ||
      !transferData.type
    ) {
      onError("Please fill in all fields");
      return;
    }

    try {
      createTransaction.mutate(transferData, {
        onSuccess: (response: any) => {
          // If transaction creation is successful, show OTP modal
          setPendingTransactionId(response?.data?.transaction_id || response?.id);
          setShowOTPModal(true);
        },
        onError: (error: any) => {
          onError(error?.message || "Transfer failed");
        },
      });
    } catch (error: any) {
      console.error("Error processing transfer:", error);
      onError(error?.message || "Error processing transfer");
    }
  };

  const handleOTPVerification = async () => {
    if (!otpValue.trim()) {
      onError("Please enter the OTP code");
      return;
    }

    if (otpValue.length !== 6) {
      onError("OTP must be 6 digits");
      return;
    }

    try {
      await verifyTransaction.mutateAsync(otpValue);
      onSuccess("Transaction verified and completed successfully!");
      setShowOTPModal(false);
      resetForm();
      onClose();
    } catch (error: any) {
      onError(error?.response?.data?.message || error?.message || "OTP verification failed");
    }
  };

  const handleClose = () => {
    resetForm();
    setShowOTPModal(false);
    onClose();
  };

  const handleOTPClose = () => {
    setShowOTPModal(false);
    setOtpValue("");
    // Don't reset the form here in case user wants to try again
  };

  const isFormValid =
    transferData.recipient_account.trim() &&
    transferData.sender_account.trim() &&
    transferData.amount &&
    transferData.currency &&
    transferData.type;

  const isOTPValid = otpValue.trim().length === 6;

  // Format OTP input to add spaces for better readability
  const formatOTP = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 6);
    return v.replace(/(\d{3})(\d{1,3})/, "$1 $2").trim();
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatOTP(e.target.value);
    setOtpValue(formatted.replace(/\s/g, "")); // Store without spaces
  };

  return (
    <>
      {/* Main Transfer Modal */}
      <Modal
        isOpen={isOpen && !showOTPModal}
        onClose={handleClose}
        title="Transfer Money"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Transfer money between accounts securely.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Account
                </label>
                <select
                  value={transferData.sender_account}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      sender_account: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                >
                  <option value="">Select sender account</option>
                  {accounts.data?.data?.map((account: any) => (
                    <option key={account.id} value={account.account_number}>
                      {account.account_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Account
                </label>
                <Input
                  type="text"
                  placeholder="Enter recipient account number"
                  value={transferData.recipient_account}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      recipient_account: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={transferData.amount.toString()}
                onChange={(e) =>
                  setTransferData((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={transferData.currency}
                onChange={(e) =>
                  setTransferData((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              >
                <option value="">Select currency</option>
                <option value="GHC">GHS - Ghanaian Cedi (₵)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Type
              </label>
              <select
                value={transferData.type}
                onChange={(e) =>
                  setTransferData((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              >
                <option value="">Select transfer type</option>
                <option value="TRANSFER">Transfer</option>
                <option value="wire">Wire Transfer</option>
                <option value="instant">Instant Transfer</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              name="Cancel"
              onClick={handleClose}
              className="!bg-gray-500 hover:!bg-gray-600"
            />
            <Button
              name="Continue to Verification"
              disabled={!isFormValid}
              onClick={handleTransfer}
              loading={createTransaction.isPending}
            />
          </div>
        </div>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={showOTPModal}
        onClose={handleOTPClose}
        title="Verify Transaction"
        size="md"
      >
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Enter Verification Code
            </h3>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit code to your registered contact. Please enter it below to complete the transaction.
            </p>
          </div>

          {/* Transaction Summary */}
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">Transaction Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{transferData.sender_account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{transferData.recipient_account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{transferData.currency} {transferData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{transferData.type}</span>
              </div>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="flex justify-center">
              <input
                type="text"
                value={formatOTP(otpValue)}
                onChange={handleOTPChange}
                placeholder="000 000"
                maxLength={7} // 6 digits + 1 space
                className="w-40 p-3 text-center text-lg font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter the 6-digit code sent to your contact
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              name="Cancel"
              onClick={handleOTPClose}
              className="!bg-gray-500 hover:!bg-gray-600"
            />
            <Button
              name="Verify & Complete"
              disabled={!isOTPValid}
              onClick={handleOTPVerification}
              loading={verifyTransaction.isPending}
            />
          </div>

          {/* Resend OTP */}
          <div className="pt-2">
            <button
              onClick={() => {
                // You can add a resend OTP API call here
                onSuccess("OTP resent successfully!");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransferModal;
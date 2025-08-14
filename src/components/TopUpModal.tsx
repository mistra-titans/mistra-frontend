import React, { useState } from "react";
import Button from "./button";
import Modal from "./modal";
import Input from "./Input";
import OTPModal from "./OTPmodal";
import { useAccount } from "../contexts/use-account";
import { useCreditAccount } from "../contexts/use-creditAccount";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const { accounts, verifyCredit } = useAccount();
  const { creditAccount } = useCreditAccount();

  const [topUpData, setTopUpData] = useState({
    account_number: "",
    amount: 1,
    phone: "",
    currency: "",
    provider: "",
  });

  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpReference, setOtpReference] = useState("");
  const [pendingTopUpData, setPendingTopUpData] = useState<any>(null);

  const resetForm = () => {
    setTopUpData({
      account_number: "",
      amount: 1,
      phone: "",
      currency: "",
      provider: "",
    });
  };

  const handleTopUp = async () => {
    if (
      !topUpData.phone.trim() ||
      !topUpData.amount ||
      !topUpData.currency ||
      !topUpData.account_number ||
      !topUpData.provider
    ) {
      onError("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        account_number: topUpData.account_number,
        amount: topUpData.amount,
        phone: topUpData.phone,
        currency: topUpData.currency,
        provider: topUpData.provider,
      };

      creditAccount.mutate(payload, {
        onSuccess: (response) => {
          console.log(response);

          if (response?.data?.action === "otp") {
            setOtpReference(response.data.reference);
            setPendingTopUpData(payload);
            onClose(); // Close top-up modal
            setIsOTPModalOpen(true);
          } else if (response?.data?.action === "ussd") {
            verifyCredit.mutate(
              {
                otp: "",
                reference: response.data.reference,
              },
              {
                onSuccess: () => {
                  onSuccess("Top up successful!");
                  accounts.refetch();
                  resetForm();
                  onClose();
                },
                onError: (verifyError: any) => {
                  onError(verifyError?.message || "Verification failed");
                },
              }
            );
          } else {
            onSuccess("Top up successful!");
            accounts.refetch();
            resetForm();
            onClose();
          }
        },
        onError: (error: any) => {
          onError(error?.message || "Top up failed");
        },
      });
    } catch (error: any) {
      console.error("Error processing top up:", error);
      onError(error?.message || "Error processing top up");
    }
  };

  const handleOTPVerification = async (otpValue: string) => {
    if (!otpReference || !otpValue) {
      onError("Invalid OTP or reference");
      return;
    }

    verifyCredit.mutate(
      {
        otp: otpValue,
        reference: otpReference,
      },
      {
        onSuccess: () => {
          onSuccess("Top up completed successfully!");
          accounts.refetch();
          resetForm();
          setIsOTPModalOpen(false);
          setOtpReference("");
          setPendingTopUpData(null);
        },
        onError: (error: any) => {
          onError(error?.message || "OTP verification failed");
        },
      }
    );
  };

  const handleOTPModalClose = () => {
    setIsOTPModalOpen(false);
    setOtpReference("");
    setPendingTopUpData(null);
    // Reopen the top up modal
    // Note: You might want to handle this differently based on your UX requirements
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid =
    topUpData.phone.trim() &&
    topUpData.amount &&
    topUpData.currency &&
    topUpData.account_number &&
    topUpData.provider;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Top Up Account"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Add money to your account via mobile money.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account to Credit
                </label>
                <select
                  value={topUpData.account_number}
                  onChange={(e) =>
                    setTopUpData((prev) => ({
                      ...prev,
                      account_number: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                >
                  <option value="">Select account to credit</option>
                  {accounts.data?.data?.map((account: any) => (
                    <option key={account.id} value={account.account_number}>
                      {account.account_number} - {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topUpData.amount.toString()}
                  onChange={(e) =>
                    setTopUpData((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={topUpData.phone}
                onChange={(e) =>
                  setTopUpData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={topUpData.currency}
                onChange={(e) =>
                  setTopUpData((prev) => ({
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
                Mobile Money Provider
              </label>
              <select
                value={topUpData.provider || ""}
                onChange={(e) =>
                  setTopUpData((prev) => ({
                    ...prev,
                    provider: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              >
                <option value="">Select provider</option>
                <option value="mtn">MTN Mobile Money</option>
                <option value="vodafone">Vodafone Cash</option>
                <option value="airteltigo">AirtelTigo Money</option>
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
              name="Top Up"
              disabled={!isFormValid || creditAccount.isPending}
              loading={creditAccount.isPending}
              onClick={handleTopUp}
            />
          </div>
        </div>
      </Modal>

      {/* OTP Modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={handleOTPModalClose}
        onVerify={handleOTPVerification}
        loading={verifyCredit.isPending}
        paymentData={{
          amount: pendingTopUpData?.amount,
          account: pendingTopUpData?.account_number,
          phone: pendingTopUpData?.phone,
          provider: pendingTopUpData?.provider,
        }}
        title="Verify Top Up"
        subtitle="Enter the OTP sent to your phone to complete the top up"
        showTransactionSummary={true}
        modalSize="md"
      />
    </>
  );
};

export default TopUpModal;
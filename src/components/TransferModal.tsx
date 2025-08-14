import React, { useState } from "react";
import Button from "./button";
import Modal from "./modal";
import Input from "./Input";
import { useTransaction } from "../contexts/use-transactions";
import { useAccount } from "../contexts/use-account";

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

  const resetForm = () => {
    setTransferData({
      recipient_account: "",
      sender_account: "",
      amount: 1,
      currency: "",
      type: "",
    });
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
        onSuccess: () => {
          onSuccess("Transaction successful!");
          resetForm();
          onClose();
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid =
    transferData.recipient_account.trim() &&
    transferData.sender_account.trim() &&
    transferData.amount &&
    transferData.currency &&
    transferData.type;

  return (
    <Modal
      isOpen={isOpen}
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
                    {account.account_number} - {account.name}
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
            name="Transfer"
            disabled={!isFormValid}
            onClick={handleTransfer}
            loading={createTransaction.isPending}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TransferModal;
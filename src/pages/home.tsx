import React, { useState } from "react";
import Button from "../components/button";
import AdminLayout from "../components/layout";
import Card from "../components/card";
import AccountCard from "../components/AccountCard";
import Modal from "../components/modal";
import Input from "../components/Input"; // Import the Input component
import OTPModal from "../components/OTPmodal"; // Import the OTP Modal
import { useSwipeable } from "react-swipeable";
import { useAccount } from "../contexts/use-account";
import { useTransaction } from "../contexts/use-transactions";
import { useCreditAccount } from "../contexts/use-creditAccount";
import Toast from "../components/Toast";

const HomePage: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = React.useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false); // Transfer modal state
  const [isTopUpModalOpen, setIsTopUpModalOpen] = React.useState(false); // Top Up modal state
  const [isOTPModalOpen, setIsOTPModalOpen] = React.useState(false); // OTP modal state
  const [walletName, setWalletName] = React.useState("");
  const [walletCurrency, setWalletCurrency] = React.useState("");
  const { createAccount, accounts, verifyCredit } = useAccount(); // Add verifyCredit
  const { createTransaction } = useTransaction();
  const { creditAccount } = useCreditAccount();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);

  // OTP related state
  const [otpReference, setOtpReference] = useState("");
  const [pendingTopUpData, setPendingTopUpData] = useState<any>(null);

  // Transfer form state
  const [transferData, setTransferData] = useState({
    recipient_account: "",
    sender_account: "",
    amount: 1,
    currency: "",
    type: "",
  });

  const [topUpData, setTopUpData] = useState({
    account_number: "",
    amount: 1,
    phone: "",
    currency: "",
    provider: "", // Add this field
  });

  const handleCreateWallet = async () => {
    if (!walletName.trim() || !walletCurrency) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await createAccount.mutateAsync({
        name: walletName,
        currency: walletCurrency,
      });

      // Reset form and close modal
      setWalletName("");
      setWalletCurrency("");
      setIsAddWalletModalOpen(false);

      // Refetch accounts to show the new account
      accounts.refetch();

      setSuccess("Account successfully created");
      setShowToast(true);
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      setError(error?.message || "Error creating wallet");
      setShowToast(true);
    }
  };

  const handleTransfer = async () => {
    if (
      !transferData.recipient_account.trim() ||
      !transferData.sender_account.trim() ||
      !transferData.amount ||
      !transferData.currency ||
      !transferData.type
    ) {
      setError("Please fill in all fields");
      setShowToast(true);
      return;
    }
    // console.log(transferData);

    try {
      // Add your transfer logic here

      createTransaction.mutate(transferData, {
        onSuccess: () => {
          setSuccess("Transaction successful!");
          setShowToast(true);
        },
        onError: (error: any) => {
          setError(error?.message || "Registration failed");
          setShowToast(true);
        },
      });

      // setSuccess("Transfer completed successfully");
      // setShowToast(true);
    } catch (error: any) {
      console.error("Error processing transfer:", error);
      setError(error?.message || "Error processing transfer");
      setShowToast(true);
    }
  };

  const handleTopUp = async () => {
    if (
      !topUpData.phone.trim() ||
      !topUpData.amount ||
      !topUpData.currency ||
      !topUpData.account_number ||
      !topUpData.provider
    ) {
      setError("Please fill in all fields");
      setShowToast(true);
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
            setIsTopUpModalOpen(false);
            setIsOTPModalOpen(true);
          } else if (response?.data?.action === "ussd") {
            // Use the reference from the response, not otpReference
            verifyCredit.mutate(
              {
                otp: "",
                reference: response.data.reference, // ✅ Fixed
              },
              {
                onSuccess: () => {
                  // Handle verification success
                  setSuccess("Top up successful!");
                  setShowToast(true);
                  accounts.refetch();

                  // Reset form and close modal
                  setTopUpData({
                    account_number: "",
                    amount: 1,
                    phone: "",
                    currency: "",
                    provider: "",
                  });
                  setIsTopUpModalOpen(false);
                },
                onError: (verifyError: any) => {
                  setError(verifyError?.message || "Verification failed");
                  setShowToast(true);
                },
              }
            );
          } else {
            // Handle other success cases or direct success
            setSuccess("Top up successful!");
            setShowToast(true);
            accounts.refetch();

            setTopUpData({
              account_number: "",
              amount: 1,
              phone: "",
              currency: "",
              provider: "",
            });
            setIsTopUpModalOpen(false);
          }
        },
        onError: (error: any) => {
          setError(error?.message || "Top up failed");
          setShowToast(true);
        },
      });
    } catch (error: any) {
      console.error("Error processing top up:", error);
      setError(error?.message || "Error processing top up");
      setShowToast(true);
    }
  };
  // Handle OTP verification
  const handleOTPVerification = async (otpValue: string) => {
    if (!otpReference || !otpValue) {
      setError("Invalid OTP or reference");
      setShowToast(true);
      return;
    }

    verifyCredit.mutate(
      {
        otp: otpValue,
        reference: otpReference,
      },
      {
        onSuccess: () => {
          // Success
          setSuccess("Top up completed successfully!");
          setShowToast(true);

          // Refetch accounts to update balances
          accounts.refetch();

          // Reset everything and close modals
          setTopUpData({
            account_number: "",
            amount: 1,
            phone: "",
            currency: "",
            provider: "",
          });
          setIsOTPModalOpen(false);
          setOtpReference("");
          setPendingTopUpData(null);
        },
        onError: (error: any) => {
          setError(error?.message || "OTP verification failed");
          setShowToast(true);
        },
      }
    );
  };

  // Handle OTP modal close
  const handleOTPModalClose = () => {
    setIsOTPModalOpen(false);
    setOtpReference("");
    setPendingTopUpData(null);
    // Optionally reopen the top up modal
    setIsTopUpModalOpen(true);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentCardIndex < accountCards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentCardIndex > 0) {
        setCurrentCardIndex((prev) => prev - 1);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const accountCards = [
    {
      totalBalance: "₵ 56,100",
      cardNumber: "**** **** **** 2415",
      cardHolder: "M. Wildan Wari",
      cardType: "visa",
      expiryDate: "12/25",
    },
    {
      totalBalance: "₵ 23,450",
      cardNumber: "**** **** **** 8742",
      cardHolder: "M. Wildan Wari",
      cardType: "mastercard",
      expiryDate: "09/26",
    },
    {
      totalBalance: "₵ 15,800",
      cardNumber: "**** **** **** 9631",
      cardHolder: "M. Wildan Wari",
      cardType: "visa",
      expiryDate: "03/27",
    },
  ];

  // Get currency symbol based on currency code
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "GHC":
        return "GHC";
      // case "USD":
      //   return "$";
      // case "EUR":
      //   return "€";
      // case "GBP":
      //   return "£";
      // case "NGN":
      //   return "₦";
      default:
        return "";
    }
  };

  // Get wallet subtext based on name
  const getWalletSubtext = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("saving")) {
      return "Savings Account";
    } else if (lowerName.includes("investment")) {
      return "Investment Portfolio";
    } else if (lowerName.includes("business")) {
      return "Business Account";
    } else {
      return "Digital Wallet";
    }
  };

  return (
    <>
      <AdminLayout title="Home">
        <div className="space-y-6 p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Account Card Carousel */}
            <div className="w-full md:w-[400px] relative mx-auto">
              <div
                {...handlers}
                className="relative overflow-hidden touch-pan-y"
              >
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentCardIndex * 100}%)`,
                  }}
                >
                  {accountCards.map((card, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <AccountCard {...card} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center space-x-2 mt-4">
                {accountCards.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 
                    ${
                      currentCardIndex === index
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentCardIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <Card width="w-full md:w-2/3" height="h-[225px]">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  name="Transfer"
                  icon={
                    <div className="i-solar:transfer-horizontal-bold-duotone size-5" />
                  }
                  height="44px"
                  onClick={() => setIsTransferModalOpen(true)} // Open transfer modal
                />
                <Button
                  name="Pay Bills"
                  icon={
                    <div className="i-solar:bill-list-bold-duotone size-5" />
                  }
                  height="44px"
                />
                <Button
                  name="Top Up"
                  icon={
                    <div className="i-solar:wallet-money-bold-duotone size-5" />
                  }
                  height="44px"
                  onClick={() => setIsTopUpModalOpen(true)} // Open top up modal
                />
                <Button
                  name="Withdraw"
                  icon={<div className="i-solar:card-bold-duotone size-5" />}
                  height="44px"
                />
              </div>
            </Card>
          </div>

          {/* Wallets Section */}
          <Card width="w-full" height="auto" className="!p-0">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  My Wallets
                </h2>
                <Button
                  name="Add Wallet"
                  icon={
                    <div className="i-solar:add-circle-bold-duotone size-5" />
                  }
                  width="140px"
                  height="36px"
                  onClick={() => setIsAddWalletModalOpen(true)}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {accounts.isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading wallets...</p>
                </div>
              ) : accounts.isError ? (
                <div className="p-6 text-center">
                  <p className="text-red-500">Error loading wallets</p>
                </div>
              ) : accounts.data?.data?.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <div className="i-solar:wallet-bold-duotone size-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No wallets found</p>
                  <p className="text-sm text-gray-400">
                    Create your first wallet to get started
                  </p>
                </div>
              ) : (
                accounts.data?.data?.map((account: any) => (
                  <div
                    key={account.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <div
                            className={`i-solar:wallet-bold-duotone size-6 text-indigo-600`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {account.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getWalletSubtext(account.name)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {account.account_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {getCurrencySymbol(account.currency)}
                          {account.balance.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-xs text-gray-400 uppercase">
                          {account.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Add Wallet Modal */}
        <Modal
          isOpen={isAddWalletModalOpen}
          onClose={() => setIsAddWalletModalOpen(false)}
          title="Add New Wallet"
          size="xl"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Create a new wallet to manage your finances better.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  placeholder="Enter wallet name"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={walletCurrency}
                  onChange={(e) => setWalletCurrency(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                >
                  <option value="">Select currency</option>
                  <option value="GHC">GHS - Ghanaian Cedi (₵)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="NGN">NGN - Nigerian Naira (₦)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                name="Cancel"
                onClick={() => {
                  setWalletName("");
                  setWalletCurrency("");
                  setIsAddWalletModalOpen(false);
                }}
                className="!bg-gray-500 hover:!bg-gray-600"
              />
              <Button
                name="Create Wallet"
                loading={createAccount.isPending}
                disabled={
                  !walletName.trim() ||
                  !walletCurrency ||
                  createAccount.isPending
                }
                onClick={handleCreateWallet}
              />
            </div>
          </div>
        </Modal>

        {/* Transfer Modal */}
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title="Transfer Money"
          size="xl"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Transfer money between accounts securely.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ">
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
                    className="w-full p-3 pr-6 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                  >
                    <option value="">Select sender account</option>
                    {accounts.data?.data?.map((account: any) => (
                      <option key={account.id} value={account.account_number}>
                        {account.account_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-4">
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
                    className="ml-2"
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
                  {/* <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="NGN">NGN - Nigerian Naira (₦)</option> */}
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
                onClick={() => {
                  setTransferData({
                    recipient_account: "",
                    sender_account: "",
                    amount: 1,
                    currency: "",
                    type: "",
                  });
                  setIsTransferModalOpen(false);
                }}
                className="!bg-gray-500 hover:!bg-gray-600"
              />
              <Button
                name="Transfer"
                disabled={
                  !transferData.recipient_account.trim() ||
                  !transferData.sender_account.trim() ||
                  !transferData.amount ||
                  !transferData.currency ||
                  !transferData.type
                }
                onClick={handleTransfer}
                loading={createTransaction.isPending}
              />
            </div>
          </div>
        </Modal>

        {/* Top Up Modal */}
        <Modal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
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
                        {account.account_number}
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
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="NGN">NGN - Nigerian Naira (₦)</option>
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
                onClick={() => {
                  setTopUpData({
                    account_number: "",
                    amount: 1,
                    phone: "",
                    currency: "",
                    provider: "",
                  });
                  setIsTopUpModalOpen(false);
                }}
                className="!bg-gray-500 hover:!bg-gray-600"
              />
              <Button
                name="Top Up"
                disabled={
                  !topUpData.phone.trim() ||
                  !topUpData.amount ||
                  !topUpData.currency ||
                  !topUpData.account_number ||
                  !topUpData.provider ||
                  creditAccount.isPending
                }
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
      </AdminLayout>

      {/* Toast for success and error messages */}
      {showToast && (error || success) && (
        <Toast
          message={error || success}
          type={error ? "error" : "success"}
          duration={3000}
          onClose={() => {
            setShowToast(false);
            setError("");
            setSuccess("");
          }}
        />
      )}
    </>
  );
};

export default HomePage;

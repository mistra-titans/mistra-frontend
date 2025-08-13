import React, { useState } from "react";
import Button from "../components/button";
import AdminLayout from "../components/layout";
import Card from "../components/card";
import AccountCard from "../components/AccountCard";
import Modal from "../components/modal"; // Import the Modal component
import { useSwipeable } from "react-swipeable";
import { useAccount } from "../contexts/use-account";
import Toast from "../components/Toast";

const HomePage: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = React.useState(false); // Modal state
  const [walletName, setWalletName] = React.useState("");
  const [walletCurrency, setWalletCurrency] = React.useState("");
  const { createAccount, accounts } = useAccount();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);

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
      case "GHS":
      case "GHC":
        return "₵";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "NGN":
        return "₦";
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
                  onClick={() => setIsAddWalletModalOpen(true)} // Open modal on click
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
          size="md"
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
                  <option value="GHS">GHS - Ghanaian Cedi (₵)</option>
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

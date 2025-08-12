import React from "react";
import Button from "../components/button";
import AdminLayout from "../components/layout";
import Card from "../components/card";
import AccountCard from "../components/AccountCard";
import { useSwipeable } from "react-swipeable";

const HomePage: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);

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

  const wallets = [
    {
      type: "Primary Wallet",
      subtext: "Digital Wallet",
      balance: "₵2,450.00",
      icon: "i-solar:wallet-bold-duotone",
    },
    {
      type: "Savings Wallet",
      subtext: "Savings Account",
      balance: "₵8,750.50",
      icon: "i-solar:saving-bold-duotone",
    },
    {
      type: "Investment Wallet",
      subtext: "Investment Portfolio",
      balance: "₵15,200.25",
      icon: "i-solar:chart-2-bold-duotone",
    },
  ];

  return (
    <AdminLayout title="Home">
      <div className="space-y-6 p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Account Card Carousel */}
          <div className="w-full md:w-[400px] relative mx-auto">
            <div {...handlers} className="relative overflow-hidden touch-pan-y">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
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
                icon={<div className="i-solar:bill-list-bold-duotone size-5" />}
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
              <h2 className="text-lg font-medium text-gray-900">My Wallets</h2>
              <Button
                name="Add Wallet"
                icon={
                  <div className="i-solar:add-circle-bold-duotone size-5" />
                }
                width="140px"
                height="36px"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {wallets.map((wallet, index) => (
              <div
                key={index}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <div
                        className={`${wallet.icon} size-6 text-indigo-600`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {wallet.type}
                      </h3>
                      <p className="text-sm text-gray-500">{wallet.subtext}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {wallet.balance}
                    </p>
                    <p className="text-sm text-gray-500">Balance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default HomePage;

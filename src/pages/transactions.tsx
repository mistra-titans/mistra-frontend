import React from "react";
import AdminLayout from "../components/layout";
import { useTransaction } from "../contexts/use-transactions"; // Import the hook

// Card Component
interface CardProps {
  width?: string;
  height?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  width = "w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0",
  height = "lg:h-screen",
  children,
  className = "",
}) => {
  return (
    <div className={`${width} ${height} ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-6 h-full">{children}</div>
    </div>
  );
};

// Transaction interface
interface Transaction {
  id: string;
  user_id: string;
  amount_base: number;
  currency: string;
  recipient_account: string;
  sender_account: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Main Transactions Component
const Transactions: React.FC = () => {
  const { transaction } = useTransaction();

  return (
    <AdminLayout title="Transaction">
      <div className="space-y-6">
        {/* Transactions Display using Card Component */}
        <Card width="w-full" height="auto" className="!p-0">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
            {transaction.data?.data?.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {transaction.data.data.length} transaction{transaction.data.data.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {transaction.isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading transactions...</p>
              </div>
            ) : transaction.isError ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl text-red-400">⚠️</div>
                </div>
                <p className="text-red-600 font-medium">Failed to load transactions</p>
                <p className="text-sm text-gray-500 mt-1">
                  Please try again later or contact support
                </p>
                <button
                  onClick={() => transaction.refetch()}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : transaction.data?.data?.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl text-gray-400">💳</div>
                </div>
                <p className="text-gray-500">No transactions found</p>
                <p className="text-sm text-gray-400">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              transaction.data?.data?.map((transactionItem: Transaction) => (
                <div
                  key={transactionItem.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transactionItem.type === "DEPOSIT"
                            ? "bg-green-100"
                            : transactionItem.type === "WITHDRAWAL"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <div
                          className={`text-xl ${
                            transactionItem.type === "DEPOSIT"
                              ? "text-green-600"
                              : transactionItem.type === "WITHDRAWAL"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {transactionItem.type === "DEPOSIT"
                            ? "↓"
                            : transactionItem.type === "WITHDRAWAL"
                            ? "↑"
                            : "↔"}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {transactionItem.type.toLowerCase()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {transactionItem.recipient_account ||
                            transactionItem.sender_account ||
                            "N/A"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transactionItem.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {transactionItem.currency}{" "}
                        {(transactionItem.amount_base / 100).toFixed(2)}
                      </p>
                      <p
                        className={`text-sm ${
                          transactionItem.status === "COMPLETED"
                            ? "text-green-500"
                            : transactionItem.status === "PENDING"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {transactionItem.status}
                      </p>
                      <p className="text-xs text-gray-400 uppercase">
                        {transactionItem.currency}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Transactions;
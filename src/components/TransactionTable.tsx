import React, { useState, useEffect } from 'react';
import type { Transaction } from '../data/dummyTransactions';
import { dummyTransactions } from '../data/dummyTransactions';

interface TransactionsTableProps {
  useBackendData?: boolean; // Toggle between dummy data and backend data
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ useBackendData = false }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useBackendData) {
      fetchTransactions();
    } else {
      // Use dummy data
      setTransactions(dummyTransactions);
    }
  }, [useBackendData]);

  // Format amount with commas and dollar sign
  const formatAmount = (amount: number): string => {
    return `₵${amount.toLocaleString()}`;
  };

  // Get status badge styling
  const getStatusBadge = (status: Transaction['status']) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    
    switch (status) {
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get amount color based on transaction type (positive = green, negative = red)
  const getAmountColor = (amount: number) => {
    return amount > 0 ? 'text-black-600' : 'text-red-600';
  };

  // Get transaction icon based on amount (income/expense)
  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? (
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ) : (
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Error loading transactions</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => fetchTransactions()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No transactions found</p>
          <p className="text-sm">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#8093EB] text-white">
              <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Account Number
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction, index) => (
              <tr 
                key={transaction.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.account_number}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {transaction.date}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {transaction.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-semibold ${getAmountColor(transaction.amount)}`}>
                    {formatAmount(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4  hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              {/* Transaction Icon */}
              
              
              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description}
                  </p>
                  <p className={`text-lg font-bold ${getAmountColor(transaction.amount)}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">
                    Account: {transaction.account_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.date}
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <span className={getStatusBadge(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsTable;
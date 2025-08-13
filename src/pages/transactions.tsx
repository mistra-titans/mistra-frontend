import React from 'react';
import AdminLayout from '../components/layout';
import TransactionsTable from '../components/TransactionTable';

const Transactions: React.FC = () => {
  return (
    <AdminLayout title="Transactions" >
      <div className="p-4  min-h-screen">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600">
            View and manage all your recent transactions
          </p>
        </div>

        {/* Transactions Table */}
        <div className="max-w-7xl  mx-auto md:">
          <TransactionsTable useBackendData={false} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Transactions;
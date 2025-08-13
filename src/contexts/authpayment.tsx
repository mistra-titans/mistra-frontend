import { createContext, useContext, useState } from 'react';

interface PaymentData {
  cardNumber: string;
  amount: string;
  description: string;
  recipientId?: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'sent' | 'received';
  createdAt: string;
  recipientEmail?: string;
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
}

interface PaymentContextType {
  transactions: Transaction[];
  loading: boolean;
  sendPayment: (paymentData: PaymentData) => Promise<PaymentResponse>;
  getTransactions: () => Promise<void>;
  getTransactionById: (id: string) => Promise<Transaction | null>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const sendPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
    setLoading(true);
    try {
      const res = await fetch('### /api/payments/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cardNumber: paymentData.cardNumber.replace(/\s/g, ''), // Remove spaces
          amount: parseFloat(paymentData.amount),
          description: paymentData.description,
          recipientId: paymentData.recipientId
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Add the new transaction to local state
        const newTransaction: Transaction = {
          id: data.transactionId,
          amount: parseFloat(paymentData.amount),
          description: paymentData.description,
          status: 'pending',
          type: 'sent',
          createdAt: new Date().toISOString(),
          recipientEmail: data.recipientEmail
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        return { 
          success: true, 
          message: data.message || 'Payment sent successfully',
          transactionId: data.transactionId
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Payment failed' 
        };
      }
    } catch (err) {
      console.error('Payment error:', err);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('### /api/transactions', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      
      if (res.ok) {
        setTransactions(data.transactions || []);
      } else {
        console.error('Failed to fetch transactions:', data.message);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionById = async (id: string): Promise<Transaction | null> => {
    setLoading(true);
    try {
      const res = await fetch(`### /api/transactions/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      
      if (res.ok) {
        return data.transaction;
      } else {
        console.error('Failed to fetch transaction:', data.message);
        return null;
      }
    } catch (err) {
      console.error('Error fetching transaction:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    transactions,
    loading,
    sendPayment,
    getTransactions,
    getTransactionById
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
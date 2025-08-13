export interface Transaction {
    id: string;
    account_number: string;
    date: string;
    description: string;
    amount: number;
    status: 'accepted' | 'rejected' | 'pending';
}

export const dummyTransactions: Transaction[] = [
     {
    id: '1',
    account_number: '123 23456 123',
    date: '8/16/13',
    description: 'Over the Phone',
    amount: 1784,
    status: 'rejected'
  },
  {
    id: '2',
    account_number: '123 23456 123',
    date: '9/14/12',
    description: 'Personal account',
    amount: 43434343,
    status: 'accepted'
  },
  {
    id: '3',
    account_number: '123 23456 123',
    date: '9/14/16',
    description: 'Over the Phone',
    amount: 1439,
    status: 'pending'
  },
  {
    id: '4',
    account_number: '123 23456 123',
    date: '12/4/17',
    description: 'Personal account',
    amount: 6690,
    status: 'accepted'
  },
  {
    id: '5',
    account_number: '123 23456 123',
    date: '7/23/13',
    description: 'Personal account',
    amount: 8861,
    status: 'accepted'
  },
  {
    id: '6',
    account_number: '123 23456 123',
    date: '11/7/16',
    description: 'Personal account',
    amount: 9359,
    status: 'accepted'
  },
  {
    id: '7',
    account_number: '123 23456 123',
    date: '5/22/14',
    description: 'Online Transfer',
    amount: 2250,
    status: 'pending'
  },
  {
    id: '8',
    account_number: '123 23456 123',
    date: '3/18/15',
    description: 'Mobile Banking',
    amount: 5670,
    status: 'rejected'
  }
]
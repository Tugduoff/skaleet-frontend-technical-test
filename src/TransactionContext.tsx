import React, { createContext, useState, useContext, ReactNode } from 'react';

import type { Account, Transaction } from './types';

interface TransactionContextValue {
  transactions: Transaction[];
  balance: number;
  addTransaction: (amount: string, account: Account) => void;
}

const TransactionContext = createContext<TransactionContextValue | undefined>(
  undefined,
);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      'useTransactions must be used within a TransactionProvider',
    );
  }
  return context;
};

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(1000);

  const addTransaction = (amount: string, account: Account) => {
    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      account,
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    setBalance(prevBalance => prevBalance - parseFloat(amount));
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, balance }}>
      {children}
    </TransactionContext.Provider>
  );
};

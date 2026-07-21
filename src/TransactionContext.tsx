import React, {
  createContext,
  useState,
  useContext,
  useRef,
  ReactNode,
} from 'react';

import { normalizeIban } from './utils/iban';
import type { Account, Beneficiary, Transaction } from './types';

interface TransactionContextValue {
  transactions: Transaction[];
  balance: number;
  addTransaction: (amount: string, account: Account) => void;
  beneficiaries: Beneficiary[];
  addBeneficiary: (name: string, iban: string) => void;
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
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  // Monotonic ids: Date.now() can repeat within the same millisecond.
  const lastId = useRef(0);
  const nextId = () => {
    lastId.current = Math.max(Date.now(), lastId.current + 1);
    return lastId.current;
  };

  const addTransaction = (amount: string, account: Account) => {
    const newTransaction = {
      id: nextId(),
      amount: parseFloat(amount),
      account,
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    setBalance(prevBalance => prevBalance - parseFloat(amount));
  };

  const addBeneficiary = (name: string, iban: string) => {
    setBeneficiaries(prevBeneficiaries => {
      const isDuplicate = prevBeneficiaries.some(
        beneficiary => normalizeIban(beneficiary.iban) === normalizeIban(iban),
      );
      if (isDuplicate) {
        return prevBeneficiaries;
      }
      return [...prevBeneficiaries, { id: nextId(), name, iban }];
    });
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        balance,
        beneficiaries,
        addBeneficiary,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

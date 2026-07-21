import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from 'react';

import { normalizeIban } from './utils/iban';
import { loadState, saveState } from './utils/storage';
import type { Account, Beneficiary, Transaction } from './types';

interface TransactionContextValue {
  transactions: Transaction[];
  balance: number;
  addTransaction: (amount: string, account: Account) => void;
  beneficiaries: Beneficiary[];
  addBeneficiary: (name: string, iban: string) => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Load the persisted state once, then save on every change (skipping the
  // initial load so stored data is not overwritten before it is read).
  useEffect(() => {
    let cancelled = false;
    loadState().then(state => {
      if (cancelled) {
        return;
      }
      if (state) {
        setTransactions(state.transactions);
        setBalance(state.balance);
        setBeneficiaries(state.beneficiaries);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveState({ transactions, balance, beneficiaries });
    }
  }, [transactions, balance, beneficiaries, isLoading]);

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
      account: { ...account, iban: normalizeIban(account.iban) },
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    setBalance(prevBalance => prevBalance - parseFloat(amount));
  };

  const addBeneficiary = (name: string, iban: string) => {
    setBeneficiaries(prevBeneficiaries => {
      const normalizedIban = normalizeIban(iban);
      const isDuplicate = prevBeneficiaries.some(
        beneficiary => beneficiary.iban === normalizedIban,
      );
      if (isDuplicate) {
        return prevBeneficiaries;
      }
      return [
        ...prevBeneficiaries,
        { id: nextId(), name, iban: normalizedIban },
      ];
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
        isLoading,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

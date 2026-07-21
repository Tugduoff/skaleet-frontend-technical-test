import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from 'react';

import { parseAmountToCents } from './utils/amount';
import { normalizeIban } from './utils/iban';
import { loadState, saveState } from './utils/storage';
import type { Account, Beneficiary, Transaction } from './types';

interface TransactionContextValue {
  transactions: Transaction[];
  /** Current balance in integer cents. */
  balanceCents: number;
  /**
   * Validates and applies a transaction. Returns false and changes nothing
   * when the amount is invalid or would overdraw the balance.
   */
  addTransaction: (amount: string, account: Account) => boolean;
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

export const INITIAL_BALANCE_CENTS = 100_000; // 1000.00

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceCents, setBalanceCents] = useState(INITIAL_BALANCE_CENTS);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const balanceRef = useRef(INITIAL_BALANCE_CENTS);

  useEffect(() => {
    let cancelled = false;
    loadState().then(state => {
      if (cancelled) {
        return;
      }
      if (state) {
        setTransactions(state.transactions);
        balanceRef.current = state.balanceCents;
        setBalanceCents(state.balanceCents);
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
      saveState({ transactions, balanceCents, beneficiaries });
    }
  }, [transactions, balanceCents, beneficiaries, isLoading]);

  const lastId = useRef(0);
  const nextId = () => {
    lastId.current = Math.max(Date.now(), lastId.current + 1);
    return lastId.current;
  };

  const addTransaction = (amount: string, account: Account): boolean => {
    const amountCents = parseAmountToCents(amount);
    if (
      amountCents === null ||
      amountCents <= 0 ||
      amountCents > balanceRef.current
    ) {
      return false;
    }
    balanceRef.current -= amountCents;
    setBalanceCents(balanceRef.current);
    setTransactions(prevTransactions => [
      ...prevTransactions,
      {
        id: nextId(),
        amountCents,
        account: { ...account, iban: normalizeIban(account.iban) },
      },
    ]);
    return true;
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
        balanceCents,
        beneficiaries,
        addBeneficiary,
        isLoading,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

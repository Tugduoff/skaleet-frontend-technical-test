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

interface BeneficiaryInput {
  firstName: string;
  lastName: string;
  iban: string;
}

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
  addBeneficiary: (input: BeneficiaryInput) => void;
  /**
   * Updates an existing beneficiary. Returns false and changes nothing when
   * another beneficiary already uses the IBAN.
   */
  updateBeneficiary: (id: number, input: BeneficiaryInput) => boolean;
  deleteBeneficiary: (id: number) => void;
  /**
   * Restores the initial demo state: initial balance, no transactions,
   * no beneficiaries. Persisted by the usual save effect.
   */
  resetDemoData: () => void;
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
        createdAt: new Date().toISOString(),
      },
    ]);
    return true;
  };

  const addBeneficiary = (input: BeneficiaryInput) => {
    setBeneficiaries(prevBeneficiaries => {
      const normalizedIban = normalizeIban(input.iban);
      const isDuplicate = prevBeneficiaries.some(
        beneficiary => beneficiary.iban === normalizedIban,
      );
      if (isDuplicate) {
        return prevBeneficiaries;
      }
      return [
        ...prevBeneficiaries,
        {
          id: nextId(),
          firstName: input.firstName,
          lastName: input.lastName,
          iban: normalizedIban,
        },
      ];
    });
  };

  const updateBeneficiary = (id: number, input: BeneficiaryInput): boolean => {
    const normalizedIban = normalizeIban(input.iban);
    const isDuplicate = beneficiaries.some(
      beneficiary =>
        beneficiary.id !== id && beneficiary.iban === normalizedIban,
    );
    if (isDuplicate) {
      return false;
    }
    setBeneficiaries(prevBeneficiaries =>
      prevBeneficiaries.map(beneficiary =>
        beneficiary.id === id
          ? {
              ...beneficiary,
              firstName: input.firstName,
              lastName: input.lastName,
              iban: normalizedIban,
            }
          : beneficiary,
      ),
    );
    return true;
  };

  const deleteBeneficiary = (id: number) => {
    setBeneficiaries(prevBeneficiaries =>
      prevBeneficiaries.filter(beneficiary => beneficiary.id !== id),
    );
  };

  const resetDemoData = () => {
    balanceRef.current = INITIAL_BALANCE_CENTS;
    setBalanceCents(INITIAL_BALANCE_CENTS);
    setTransactions([]);
    setBeneficiaries([]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        balanceCents,
        beneficiaries,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        resetDemoData,
        isLoading,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

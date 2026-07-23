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
  balanceCents: number;
  beneficiaries: Beneficiary[];
  isLoading: boolean;
  transactions: Transaction[];
  addBeneficiary: (input: BeneficiaryInput) => void;
  addTransaction: (amount: string, account: Account) => boolean;
  deleteBeneficiary: (id: number) => void;
  receiveFunds: (amountCents: number) => void;
  resetDemoData: () => void;
  updateBeneficiary: (id: number, input: BeneficiaryInput) => boolean;
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

export const INITIAL_BALANCE_CENTS = 100_000;

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
        syncLastIdWithLoadedState(state.transactions, state.beneficiaries);
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
    lastId.current += 1;
    return lastId.current;
  };

  const syncLastIdWithLoadedState = (
    loadedTransactions: Transaction[],
    loadedBeneficiaries: Beneficiary[],
  ) => {
    const maxId = Math.max(
      0,
      ...loadedTransactions.map(transaction => transaction.id),
      ...loadedBeneficiaries.map(beneficiary => beneficiary.id),
    );
    lastId.current = maxId;
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
    lastId.current = 0;
    balanceRef.current = INITIAL_BALANCE_CENTS;
    setBalanceCents(INITIAL_BALANCE_CENTS);
    setTransactions([]);
    setBeneficiaries([]);
  };

  const receiveFunds = (amountCents: number) => {
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return;
    }
    balanceRef.current += amountCents;
    setBalanceCents(balanceRef.current);
  };

  return (
    <TransactionContext.Provider
      value={{
        balanceCents,
        beneficiaries,
        isLoading,
        transactions,
        addBeneficiary,
        addTransaction,
        deleteBeneficiary,
        receiveFunds,
        resetDemoData,
        updateBeneficiary,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

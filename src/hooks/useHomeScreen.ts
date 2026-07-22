import { useMemo } from 'react';

import { useTransactions } from '../TransactionContext';
import { formatAmount } from '../utils/amount';

/**
 * Hook owning the data needed by HomeScreen: the transaction list sorted
 * newest-first, the current balance, and the formatter used to display both.
 */
export const useHomeScreen = () => {
  const { transactions, balanceCents } = useTransactions();

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
      ),
    [transactions],
  );

  return { transactions: sortedTransactions, balanceCents, formatAmount };
};

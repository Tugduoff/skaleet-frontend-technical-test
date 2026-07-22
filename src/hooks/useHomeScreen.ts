import { useMemo } from 'react';
import { Alert } from 'react-native';

import { useTransactions } from '../TransactionContext';
import { formatAmount } from '../utils/amount';

/**
 * Hook owning the data needed by HomeScreen: the transaction list sorted
 * newest-first, the current balance, the formatter used to display both,
 * and the confirmed reset flow.
 */
export const useHomeScreen = () => {
  const { transactions, balanceCents, resetDemoData } = useTransactions();

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
      ),
    [transactions],
  );

  /** Asks for confirmation, then restores the initial demo state. */
  const confirmReset = () => {
    Alert.alert(
      'Reset demo data',
      'Restore the initial balance and clear all transactions and beneficiaries?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetDemoData },
      ],
    );
  };

  return {
    transactions: sortedTransactions,
    balanceCents,
    formatAmount,
    confirmReset,
  };
};

import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useTransactions } from '../TransactionContext';
import { t } from '../i18n';
import { formatAmount } from '../utils/amount';

/**
 * Hook owning the data needed by HomeScreen: the transaction list sorted
 * newest-first, the current balance, the formatter used to display both,
 * and the confirmed reset flow.
 */
export const useHomeScreen = () => {
  const {
    balanceCents,
    beneficiaries,
    transactions,
    receiveFunds,
    resetDemoData,
  } = useTransactions();
  const [balanceHidden, setBalanceHidden] = useState(false);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
      ),
    [transactions],
  );

  const toggleBalanceHidden = () => setBalanceHidden(hidden => !hidden);

  const receiveDemoFunds = () => receiveFunds(100_000);

  const confirmReset = () => {
    Alert.alert(t('home.resetTitle'), t('home.resetMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('home.resetConfirm'),
        style: 'destructive',
        onPress: resetDemoData,
      },
    ]);
  };

  return {
    balanceCents,
    balanceHidden,
    beneficiaries,
    transactions: sortedTransactions,
    confirmReset,
    formatAmount,
    receiveDemoFunds,
    toggleBalanceHidden,
  };
};

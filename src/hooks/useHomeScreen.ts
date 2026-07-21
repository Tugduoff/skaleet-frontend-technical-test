import { useTransactions } from '../TransactionContext';
import { formatAmount } from '../utils/amount';

/**
 * Hook owning the data needed by HomeScreen: the transaction list, the
 * current balance, and the formatter used to display both.
 */
export const useHomeScreen = () => {
  const { transactions, balanceCents } = useTransactions();

  return { transactions, balanceCents, formatAmount };
};

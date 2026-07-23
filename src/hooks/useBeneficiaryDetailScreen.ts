import { Alert } from 'react-native';

import { useTransactions } from '../TransactionContext';
import { getBeneficiaryFullName } from '../utils/beneficiaries';
import { t } from '../i18n';
import type { Beneficiary, Transaction } from '../types';

/**
 * Hook owning the beneficiary detail screen data and actions.
 * Returns the beneficiary, the matching transaction history (newest first),
 * and a confirmed deletion callback that invokes the supplied onDeleted hook.
 */
export const useBeneficiaryDetailScreen = (beneficiaryId: number) => {
  const { beneficiaries, deleteBeneficiary, transactions } = useTransactions();

  const beneficiary = beneficiaries.find(b => b.id === beneficiaryId);

  const history: Transaction[] = beneficiary
    ? transactions
        .filter(transaction => transaction.account.iban === beneficiary.iban)
        .sort((a, b) => {
          const dateDiff =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (dateDiff !== 0) {
            return dateDiff;
          }
          return b.id - a.id;
        })
    : [];

  const confirmDelete = (
    beneficiaryToDelete: Beneficiary,
    onDeleted: () => void,
  ) => {
    Alert.alert(
      t('beneficiaries.deleteTitle'),
      t('beneficiaries.deleteMessage', {
        name: getBeneficiaryFullName(beneficiaryToDelete),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('beneficiaries.deleteConfirm'),
          style: 'destructive',
          onPress: () => {
            deleteBeneficiary(beneficiaryToDelete.id);
            onDeleted();
          },
        },
      ],
    );
  };

  return { beneficiary, transactions: history, confirmDelete };
};

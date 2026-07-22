import { Alert } from 'react-native';

import { useTransactions } from '../TransactionContext';
import { getBeneficiaryFullName } from '../utils/beneficiaries';
import { t } from '../i18n';
import type { Beneficiary } from '../types';

/**
 * Hook owning the beneficiaries list and its row actions for
 * BeneficiariesScreen. Deletion goes through a confirmation alert.
 */
export const useBeneficiariesScreen = () => {
  const { beneficiaries, deleteBeneficiary } = useTransactions();

  /** Asks for confirmation, then deletes the beneficiary. */
  const confirmDelete = (beneficiary: Beneficiary) => {
    Alert.alert(
      t('beneficiaries.deleteTitle'),
      t('beneficiaries.deleteMessage', {
        name: getBeneficiaryFullName(beneficiary),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('beneficiaries.deleteConfirm'),
          style: 'destructive',
          onPress: () => deleteBeneficiary(beneficiary.id),
        },
      ],
    );
  };

  return { beneficiaries, confirmDelete };
};

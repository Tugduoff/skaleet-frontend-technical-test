import { Alert } from 'react-native';

import { useTransactions } from '../TransactionContext';
import { getBeneficiaryFullName } from '../utils/beneficiaries';
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
      'Delete beneficiary',
      `Remove ${getBeneficiaryFullName(beneficiary)} from your beneficiaries?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBeneficiary(beneficiary.id),
        },
      ],
    );
  };

  return { beneficiaries, confirmDelete };
};

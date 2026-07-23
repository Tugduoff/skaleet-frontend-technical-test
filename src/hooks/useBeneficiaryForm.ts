import { useState } from 'react';

import { useTransactions } from '../TransactionContext';
import { t } from '../i18n';
import { isValidIban, normalizeIban } from '../utils/iban';

/** Route parameters accepted by BeneficiaryFormScreen. */
export interface BeneficiaryFormParams {
  beneficiaryId?: number;
  prefillFirstName?: string;
  prefillLastName?: string;
  prefillIban?: string;
}

/**
 * Hook owning the beneficiary form state and validation for
 * BeneficiaryFormScreen. Handles creation, edition (when beneficiaryId is
 * given), and optional prefilling of the inputs.
 */
export const useBeneficiaryForm = (params: BeneficiaryFormParams) => {
  const { beneficiaries, addBeneficiary, updateBeneficiary } =
    useTransactions();
  const isEditMode = params.beneficiaryId !== undefined;
  const editing = isEditMode
    ? (beneficiaries.find(
        beneficiary => beneficiary.id === params.beneficiaryId,
      ) ?? null)
    : null;

  const [firstName, setFirstName] = useState(
    editing?.firstName ?? params.prefillFirstName ?? '',
  );
  const [lastName, setLastName] = useState(
    editing?.lastName ?? params.prefillLastName ?? '',
  );
  const [iban, setIban] = useState(editing?.iban ?? params.prefillIban ?? '');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [ibanError, setIbanError] = useState('');

  /**
   * Validates and saves the form. Returns true on success so the screen
   * can navigate away; false when validation or saving fails.
   */
  const submit = (): boolean => {
    setFirstNameError('');
    setLastNameError('');
    setIbanError('');
    if (firstName.trim() === '') {
      setFirstNameError(t('errors.firstNameRequired'));
      return false;
    }
    if (lastName.trim() === '') {
      setLastNameError(t('errors.lastNameRequired'));
      return false;
    }
    if (!isValidIban(iban)) {
      setIbanError(t('errors.ibanInvalid'));
      return false;
    }
    const normalizedIban = normalizeIban(iban);
    const isDuplicate = beneficiaries.some(
      beneficiary =>
        beneficiary.id !== params.beneficiaryId &&
        beneficiary.iban === normalizedIban,
    );
    if (isDuplicate) {
      setIbanError(t('errors.ibanDuplicate'));
      return false;
    }
    if (isEditMode) {
      if (!editing) {
        return false;
      }
      return updateBeneficiary(editing.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        iban,
      });
    }
    addBeneficiary({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      iban,
    });
    return true;
  };

  return {
    firstName,
    firstNameError,
    iban,
    ibanError,
    isEditMode,
    lastName,
    lastNameError,
    setFirstName,
    setIban,
    setLastName,
    submit,
  };
};

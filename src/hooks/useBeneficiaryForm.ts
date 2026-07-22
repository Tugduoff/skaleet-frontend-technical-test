import { useState } from 'react';

import { useTransactions } from '../TransactionContext';
import { isValidIban, normalizeIban } from '../utils/iban';

/** Route parameters accepted by BeneficiaryFormScreen. */
export interface BeneficiaryFormParams {
  /** Present to edit an existing beneficiary, absent to create one. */
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
      setFirstNameError('Please enter a first name');
      return false;
    }
    if (lastName.trim() === '') {
      setLastNameError('Please enter a last name');
      return false;
    }
    if (!isValidIban(iban)) {
      setIbanError('Please enter a valid IBAN');
      return false;
    }
    const normalizedIban = normalizeIban(iban);
    const isDuplicate = beneficiaries.some(
      beneficiary =>
        beneficiary.id !== params.beneficiaryId &&
        beneficiary.iban === normalizedIban,
    );
    if (isDuplicate) {
      setIbanError('This beneficiary already exists');
      return false;
    }
    if (isEditMode) {
      // The beneficiary could have been deleted while the form was open.
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
    isEditMode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    iban,
    setIban,
    firstNameError,
    lastNameError,
    ibanError,
    submit,
  };
};

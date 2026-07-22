import { useState } from 'react';

import { useTransactions } from '../TransactionContext';
import { isValidIban, normalizeIban } from '../utils/iban';

/**
 * Hook owning the beneficiary creation form state and validation for
 * BeneficiariesScreen. Returns the current beneficiaries, the controlled
 * inputs, their errors, and the add handler.
 */
export const useBeneficiariesScreen = () => {
  const { beneficiaries, addBeneficiary } = useTransactions();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [iban, setIban] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [ibanError, setIbanError] = useState('');

  const handleAdd = () => {
    setFirstNameError('');
    setLastNameError('');
    setIbanError('');
    if (firstName.trim() === '') {
      setFirstNameError('Please enter a first name');
      return;
    }
    if (lastName.trim() === '') {
      setLastNameError('Please enter a last name');
      return;
    }
    if (!isValidIban(iban)) {
      setIbanError('Please enter a valid IBAN');
      return;
    }
    const isDuplicate = beneficiaries.some(
      beneficiary => normalizeIban(beneficiary.iban) === normalizeIban(iban),
    );
    if (isDuplicate) {
      setIbanError('This beneficiary already exists');
      return;
    }
    addBeneficiary({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      iban,
    });
    setFirstName('');
    setLastName('');
    setIban('');
  };

  return {
    beneficiaries,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    iban,
    setIban,
    firstNameError,
    lastNameError,
    ibanError,
    handleAdd,
  };
};

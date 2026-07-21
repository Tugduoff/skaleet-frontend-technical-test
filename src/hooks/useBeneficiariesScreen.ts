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
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [nameError, setNameError] = useState('');
  const [ibanError, setIbanError] = useState('');

  const handleAdd = () => {
    setNameError('');
    setIbanError('');
    if (name.trim() === '') {
      setNameError('Please enter a name');
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
    addBeneficiary(name.trim(), iban);
    setName('');
    setIban('');
  };

  return {
    beneficiaries,
    name,
    setName,
    iban,
    setIban,
    nameError,
    ibanError,
    handleAdd,
  };
};

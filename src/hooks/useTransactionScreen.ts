import { useRef, useState } from 'react';

import { useTransactions } from '../TransactionContext';
import { getAmountError } from '../utils/amount';
import { isValidIban } from '../utils/iban';
import {
  getBeneficiaryFullName,
  getSelectedBeneficiary,
} from '../utils/beneficiaries';
import type { Account } from '../types';

/**
 * Hook owning the transaction form state, validation, beneficiary selection,
 * and submission flow for TransactionScreen. Returns everything the screen
 * needs to render and submit.
 */
export const useTransactionScreen = () => {
  const { addTransaction, balanceCents, beneficiaries } = useTransactions();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [selection, setSelection] = useState<number | 'manual' | null>(null);
  const [amountError, setAmountError] = useState('');
  const [nameError, setNameError] = useState('');
  const [ibanError, setIbanError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const useManualEntry = selection === 'manual' || beneficiaries.length === 0;
  const selectedBeneficiary = getSelectedBeneficiary(
    beneficiaries,
    typeof selection === 'number' ? selection : null,
  );

  /**
   * Validates and submits the transaction. Returns true on success so the
   * screen can navigate away; false when validation or submission fails.
   */
  const submit = (): boolean => {
    if (submittingRef.current || isSubmitting) {
      return false;
    }
    setAmountError('');
    setNameError('');
    setIbanError('');
    const amountErrorMessage = getAmountError(amount, balanceCents);
    if (amountErrorMessage) {
      setAmountError(amountErrorMessage);
      return false;
    }
    let account: Account | null = null;
    if (useManualEntry) {
      if (name.trim() === '') {
        setNameError('Please enter a name');
        return false;
      }
      if (!isValidIban(iban)) {
        setIbanError('Please enter a valid IBAN');
        return false;
      }
      account = { name: name.trim(), iban };
    } else if (selectedBeneficiary) {
      account = {
        name: getBeneficiaryFullName(selectedBeneficiary),
        iban: selectedBeneficiary.iban,
      };
    }
    if (!account) {
      return false;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    // The context re-validates and can still refuse, e.g. if the balance
    // changed since this screen rendered.
    if (!addTransaction(amount, account)) {
      submittingRef.current = false;
      setAmountError('Transaction could not be completed, please try again');
      setIsSubmitting(false);
      return false;
    }
    return true;
  };

  return {
    amount,
    setAmount,
    name,
    setName,
    iban,
    setIban,
    selection,
    setSelection,
    amountError,
    nameError,
    ibanError,
    isSubmitting,
    useManualEntry,
    selectedBeneficiary,
    beneficiaries,
    submit,
  };
};

import { useRef, useState } from 'react';

import { useTransactions } from '../TransactionContext';
import { t } from '../i18n';
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

  const effectiveSelection =
    selection === null && beneficiaries.length > 0
      ? beneficiaries[0].id
      : selection;

  const useManualEntry =
    effectiveSelection === 'manual' || beneficiaries.length === 0;

  const selectedBeneficiary =
    getSelectedBeneficiary(
      beneficiaries,
      typeof effectiveSelection === 'number' ? effectiveSelection : null,
    ) ?? (beneficiaries.length > 0 ? beneficiaries[0] : null);

  /**
   * Amount setter that clears a shown error as soon as it no longer
   * applies: the field is emptied (the CTA hides at 0 anyway) or the new
   * value is valid. An unresolved error stays until the next submit.
   */
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (
      amountError &&
      (value.trim() === '' || getAmountError(value, balanceCents) === null)
    ) {
      setAmountError('');
    }
  };

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
        setNameError(t('errors.nameRequired'));
        return false;
      }
      if (!isValidIban(iban)) {
        setIbanError(t('errors.ibanInvalid'));
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
      setAmountError(t('transaction.submitFailed'));
      setIsSubmitting(false);
      return false;
    }
    // Success: clear the form so the tab is fresh for the next transfer.
    setAmount('');
    setName('');
    setIban('');
    setSelection(null);
    setIsSubmitting(false);
    // Release the re-entry guard on the next tick: a same-tick double tap
    // stays blocked, but the (never-unmounted) tab screen can submit again.
    setTimeout(() => {
      submittingRef.current = false;
    }, 0);
    return true;
  };

  return {
    amount,
    setAmount: handleAmountChange,
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

import { t } from '../i18n';

/**
 * Parses a user-entered amount into integer cents.
 *
 * Accepts a dot or comma decimal separator with at most two decimal places,
 * and ignores surrounding whitespace. Anything else is rejected: this strict
 * grammar deliberately excludes inputs that Number() would accept but
 * parseFloat() would interpret differently ("0x10", "1e3", "0b11"...), so
 * validation and charging can never disagree on the value.
 */
export const parseAmountToCents = (amount: string): number | null => {
  const normalized = amount.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  // Math.round guards against float representation, e.g. 10.10 * 100.
  return Math.round(Number(normalized) * 100);
};

/**
 * Returns an error message if the given amount input is invalid for the
 * given balance (in cents), or null when the transaction can proceed.
 */
export const getAmountError = (
  amount: string,
  balanceCents: number,
): string | null => {
  if (amount.trim() === '') {
    return t('errors.amountRequired');
  }
  const cents = parseAmountToCents(amount);
  if (cents === null) {
    return t('errors.amountInvalid');
  }
  if (cents <= 0) {
    return t('errors.amountPositive');
  }
  if (cents > balanceCents) {
    return t('errors.amountExceeds');
  }
  return null;
};

/** Formats integer cents for display, e.g. 1050 -> "10.50". */
export const formatAmount = (cents: number): string => (cents / 100).toFixed(2);

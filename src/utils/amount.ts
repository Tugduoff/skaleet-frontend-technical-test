/**
 * Returns an error message if the given amount input is invalid for the
 * given balance, or null when the transaction can proceed.
 */
export const getAmountError = (
  amount: string,
  balance: number,
): string | null => {
  if (amount.trim() === '') {
    return 'Please enter an amount';
  }
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return 'Please enter a valid number';
  }
  if (value <= 0) {
    return 'Amount must be greater than 0';
  }
  if (value > balance) {
    return 'Amount exceeds current balance';
  }
  return null;
};

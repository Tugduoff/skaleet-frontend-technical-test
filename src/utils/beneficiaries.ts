import type { Beneficiary } from '../types';

/**
 * Returns the beneficiary matching selectedId, falling back to the first
 * beneficiary (the picker's default selection), or null when the list is
 * empty.
 */
export const getSelectedBeneficiary = (
  beneficiaries: Beneficiary[],
  selectedId: number | null,
): Beneficiary | null =>
  beneficiaries.find(beneficiary => beneficiary.id === selectedId) ??
  beneficiaries[0] ??
  null;

/**
 * Returns the beneficiary's display name. Migrated beneficiaries can have
 * an empty lastName, so blank parts are skipped.
 */
export const getBeneficiaryFullName = (
  beneficiary: Pick<Beneficiary, 'firstName' | 'lastName'>,
): string =>
  [beneficiary.firstName, beneficiary.lastName]
    .filter(part => part.trim() !== '')
    .join(' ');

/**
 * Splits a free-form full name into first and last name on the first
 * whitespace. Used when migrating v2 beneficiaries and when prefilling
 * the beneficiary form from a manually entered recipient.
 */
export const splitFullName = (
  name: string,
): { firstName: string; lastName: string } => {
  const trimmed = name.trim();
  const separator = trimmed.indexOf(' ');
  if (separator === -1) {
    return { firstName: trimmed, lastName: '' };
  }
  return {
    firstName: trimmed.slice(0, separator),
    lastName: trimmed.slice(separator + 1).trim(),
  };
};

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

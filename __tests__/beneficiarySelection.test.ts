import { describe, expect, it } from '@jest/globals';

import { getSelectedBeneficiary } from '../src/utils/beneficiaries';
import type { Beneficiary } from '../src/types';

const beneficiaries: Beneficiary[] = [
  { id: 1, name: 'John Doe', iban: 'GB29NWBK60161331926819' },
  { id: 2, name: 'Jane Doe', iban: 'DE89370400440532013000' },
];

describe('getSelectedBeneficiary', () => {
  it('returns null when the list is empty', () => {
    expect(getSelectedBeneficiary([], null)).toBeNull();
  });

  it('falls back to the first beneficiary when nothing is selected', () => {
    expect(getSelectedBeneficiary(beneficiaries, null)).toEqual(
      beneficiaries[0],
    );
  });

  it('returns the beneficiary matching the selected id', () => {
    expect(getSelectedBeneficiary(beneficiaries, 2)).toEqual(beneficiaries[1]);
  });

  it('falls back to the first when the selected id no longer exists', () => {
    expect(getSelectedBeneficiary(beneficiaries, 999)).toEqual(
      beneficiaries[0],
    );
  });
});

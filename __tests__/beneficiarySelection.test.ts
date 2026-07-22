import { describe, expect, it } from '@jest/globals';

import {
  getBeneficiaryFullName,
  getSelectedBeneficiary,
  splitFullName,
} from '../src/utils/beneficiaries';
import type { Beneficiary } from '../src/types';

const beneficiaries: Beneficiary[] = [
  { id: 1, firstName: 'John', lastName: 'Doe', iban: 'GB29NWBK60161331926819' },
  { id: 2, firstName: 'Jane', lastName: 'Doe', iban: 'DE89370400440532013000' },
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

describe('getBeneficiaryFullName', () => {
  it('joins first and last name', () => {
    expect(getBeneficiaryFullName(beneficiaries[0])).toBe('John Doe');
  });

  it('skips an empty lastName (migrated single-word names)', () => {
    expect(getBeneficiaryFullName({ firstName: 'Madonna', lastName: '' })).toBe(
      'Madonna',
    );
  });
});

describe('splitFullName', () => {
  it('splits on the first whitespace', () => {
    expect(splitFullName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(splitFullName('Mary Jane Watson')).toEqual({
      firstName: 'Mary',
      lastName: 'Jane Watson',
    });
  });

  it('returns an empty lastName for a single-word name', () => {
    expect(splitFullName('Madonna')).toEqual({
      firstName: 'Madonna',
      lastName: '',
    });
  });

  it('trims surrounding whitespace', () => {
    expect(splitFullName('  John Doe  ')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });
});

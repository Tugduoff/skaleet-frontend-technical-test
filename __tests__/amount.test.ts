import { describe, expect, it } from '@jest/globals';

import { getAmountError } from '../src/utils/amount';

describe('getAmountError', () => {
  it.each([
    ['10.50', 'decimal amount'],
    ['1000', 'exact balance'],
    [' 50 ', 'whitespace around the amount'],
    ['0.01', 'smallest positive amount'],
  ])('accepts %s (%s)', amount => {
    expect(getAmountError(amount, 1000)).toBeNull();
  });

  it.each([
    ['', 'empty'],
    ['   ', 'whitespace only'],
    ['abc', 'not a number'],
    ['10abc', 'trailing garbage'],
    ['0', 'zero'],
    ['-5', 'negative'],
    ['1000.01', 'overdraft by a cent'],
    ['1001', 'overdraft'],
  ])('rejects %s (%s)', amount => {
    expect(getAmountError(amount, 1000)).not.toBeNull();
  });
});

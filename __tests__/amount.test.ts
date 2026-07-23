import { describe, expect, it } from '@jest/globals';

import {
  addCentsToAmountInput,
  formatAmount,
  getAmountError,
  parseAmountToCents,
} from '../src/utils/amount';

describe('parseAmountToCents', () => {
  it.each([
    ['10.50', 1050, 'decimal amount'],
    ['1000', 100000, 'whole amount'],
    [' 50 ', 5000, 'whitespace around the amount'],
    ['0.01', 1, 'smallest positive amount'],
    ['10,50', 1050, 'comma decimal separator'],
    ['0,1', 10, 'comma with a single decimal'],
  ])('parses %s as %i cents (%s)', (amount, expected) => {
    expect(parseAmountToCents(amount)).toBe(expected);
  });

  it.each([
    ['', 'empty'],
    ['   ', 'whitespace only'],
    ['abc', 'not a number'],
    ['10abc', 'trailing garbage'],
    ['0x10', 'hex literal (Number accepts, parseFloat reads 0)'],
    ['0b11', 'binary literal'],
    ['0o17', 'octal literal'],
    ['1e3', 'scientific notation'],
    ['10.505', 'more than two decimals'],
    ['1.2.3', 'two separators'],
    ['-5', 'negative'],
    ['.5', 'missing integer part'],
  ])('rejects %s (%s)', amount => {
    expect(parseAmountToCents(amount)).toBeNull();
  });
});

describe('getAmountError', () => {
  it.each([
    ['10.50', 'decimal amount'],
    ['1000', 'exact balance'],
    [' 50 ', 'whitespace around the amount'],
    ['0.01', 'smallest positive amount'],
    ['10,50', 'comma decimal separator'],
  ])('accepts %s (%s)', amount => {
    expect(getAmountError(amount, 100000)).toBeNull();
  });

  it.each([
    ['', 'Please enter an amount'],
    ['   ', 'Please enter an amount'],
    ['abc', 'Please enter a valid amount'],
    ['0x10', 'Please enter a valid amount'],
    ['0', 'Amount must be greater than 0'],
    ['0.00', 'Amount must be greater than 0'],
    ['1000.01', 'Amount exceeds current balance'],
    ['1001', 'Amount exceeds current balance'],
  ])('rejects %s with "%s"', (amount, message) => {
    expect(getAmountError(amount, 100000)).toBe(message);
  });
});

describe('formatAmount', () => {
  it.each([
    [100000, '€1,000.00'],
    [1050, '€10.50'],
    [1, '€0.01'],
    [0, '€0.00'],
    [-4250, '-€42.50'],
  ])('formats %i cents as %s', (cents, expected) => {
    expect(formatAmount(cents)).toBe(expected);
  });
});

describe('addCentsToAmountInput', () => {
  it.each([
    ['10.50', 1000, '20.50', 'adds to a decimal amount'],
    ['', 1000, '10.00', 'an empty field counts as zero'],
    ['abc', 2000, '20.00', 'an invalid field counts as zero'],
    ['0', 10000, '100.00', 'rounds to two decimals'],
  ])('%s + %i cents = %s (%s)', (input, cents, expected) => {
    expect(addCentsToAmountInput(input, cents)).toBe(expected);
  });
});

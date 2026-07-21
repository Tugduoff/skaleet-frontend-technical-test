import { describe, expect, it } from '@jest/globals';

import { isValidIban } from '../src/utils/iban';

describe('isValidIban', () => {
  it.each([
    ['GB29 NWBK 6016 1331 9268 19', 'printable format with spaces'],
    ['DE89370400440532013000', 'electronic format'],
    ['FR1420041010050500013M02606', 'with letters in the BBAN'],
    ['NL91ABNA0417164300', 'Dutch IBAN'],
    ['gb29 nwbk 6016 1331 9268 19', 'lowercase'],
  ])('accepts %s (%s)', iban => {
    expect(isValidIban(iban)).toBe(true);
  });

  it.each([
    ['GB29 NWBK 6016 1331 9268 20', 'wrong check digits'],
    ['DE89370400440532013001', 'corrupted last digit'],
    ['FR1420041010050500013N02606', 'corrupted BBAN letter'],
    ['not-an-iban', 'garbage input'],
    ['', 'empty string'],
    ['GB29', 'too short'],
    ['12GB NWBK 6016 1331 9268 19', 'country code not letters'],
    ['GBAA NWBK 6016 1331 9268 19', 'check digits not digits'],
  ])('rejects %s (%s)', iban => {
    expect(isValidIban(iban)).toBe(false);
  });
});

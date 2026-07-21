/**
 * Validates an IBAN using the ISO 13616 mod-97 checksum.
 * Accepts both electronic (no spaces) and printable (spaces) formats,
 * case-insensitively.
 */
export const isValidIban = (iban: string): boolean => {
  const normalized = iban.replace(/\s+/g, '').toUpperCase();

  // 2-letter country code, 2 check digits, then an 11-30 char BBAN.
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalized)) {
    return false;
  }

  // Move the first 4 characters to the end, then compute the number mod 97
  // digit by digit (letters become A=10 ... Z=35). Valid iff remainder is 1.
  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
};

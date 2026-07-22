import { describe, expect, it } from '@jest/globals';

import { deviceLocale, t } from '../src/i18n';
import { en } from '../src/i18n/en';
import { fr } from '../src/i18n/fr';

describe('i18n', () => {
  it('resolves a locale through Intl', () => {
    expect(deviceLocale).not.toBe('');
  });

  it('translates keys (English on the test runner locale)', () => {
    expect(t('home.empty')).toBe(en['home.empty']);
    expect(t('form.save')).toBe('Save Beneficiary');
  });

  it('interpolates placeholders', () => {
    expect(t('home.to', { name: 'John' })).toBe('To: John');
    expect(t('transaction.saveMessage', { name: 'Jane' })).toBe(
      'Add Jane to your beneficiaries?',
    );
  });

  it('ships a French dictionary covering every key', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
  });
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';
import { useTransactionScreen } from '../src/hooks/useTransactionScreen';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';
const VALID_IBAN_NORMALIZED = 'GB29NWBK60161331926819';

let hook: ReturnType<typeof useTransactionScreen>;
let context: ReturnType<typeof useTransactions>;

const Probe = () => {
  hook = useTransactionScreen();
  context = useTransactions();
  return null;
};

const renderHook = async () => {
  await act(async () => {
    renderer.create(
      <TransactionProvider>
        <Probe />
      </TransactionProvider>,
    );
  });
};

describe('useTransactionScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with empty form state and manual entry when no beneficiaries', async () => {
    await renderHook();
    expect(hook.amount).toBe('');
    expect(hook.name).toBe('');
    expect(hook.iban).toBe('');
    expect(hook.amountError).toBe('');
    expect(hook.nameError).toBe('');
    expect(hook.ibanError).toBe('');
    expect(hook.isSubmitting).toBe(false);
    expect(hook.useManualEntry).toBe(true);
    expect(hook.selectedBeneficiary).toBeNull();
  });

  it('rejects empty amount with an amount error', async () => {
    await renderHook();
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.amountError).toBe('Please enter an amount');
    expect(hook.isSubmitting).toBe(false);
  });

  it('rejects manual entry with empty name', async () => {
    await renderHook();
    act(() => {
      hook.setAmount('10');
    });
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.nameError).toBe('Please enter a name');
    expect(hook.isSubmitting).toBe(false);
  });

  it('rejects manual entry with invalid IBAN', async () => {
    await renderHook();
    act(() => {
      hook.setAmount('10');
      hook.setName('John Doe');
      hook.setIban('invalid');
    });
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.ibanError).toBe('Please enter a valid IBAN');
    expect(hook.isSubmitting).toBe(false);
  });

  it('submits a manual transaction and returns true', async () => {
    await renderHook();
    act(() => {
      hook.setAmount('10.50');
      hook.setName('John Doe');
      hook.setIban(VALID_IBAN);
    });
    let ok = false;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(true);
    expect(hook.amountError).toBe('');
    expect(hook.nameError).toBe('');
    expect(hook.ibanError).toBe('');
    expect(context.transactions).toHaveLength(1);
    expect(context.transactions[0].account).toEqual({
      name: 'John Doe',
      iban: VALID_IBAN_NORMALIZED,
    });
  });

  it('blocks a second rapid submit via the ref guard', async () => {
    await renderHook();
    act(() => {
      hook.setAmount('10');
      hook.setName('John Doe');
      hook.setIban(VALID_IBAN);
    });
    const results: boolean[] = [];
    act(() => {
      results.push(hook.submit());
      results.push(hook.submit());
    });
    expect(results).toEqual([true, false]);
    expect(context.transactions).toHaveLength(1);
  });

  it('uses the selected beneficiary when not in manual entry', async () => {
    await renderHook();
    act(() => {
      context.addBeneficiary({
        firstName: 'Jane',
        lastName: 'Doe',
        iban: VALID_IBAN,
      });
    });
    act(() => {
      hook.setAmount('10');
    });
    expect(hook.useManualEntry).toBe(false);
    expect(hook.selectedBeneficiary?.firstName).toBe('Jane');
    let ok = false;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(true);
    expect(context.transactions).toHaveLength(1);
    expect(context.transactions[0].account).toEqual({
      name: 'Jane Doe',
      iban: VALID_IBAN_NORMALIZED,
    });
  });

  it('clears a shown amount error only when the input no longer fails', async () => {
    await renderHook();
    // Fresh balance is €1,000: €1,001 triggers the exceeds-balance error.
    act(() => {
      hook.setAmount('1001');
    });
    act(() => {
      hook.submit();
    });
    expect(hook.amountError).toBe('Amount exceeds current balance');
    // Still invalid: the error stays.
    act(() => {
      hook.setAmount('2000');
    });
    expect(hook.amountError).toBe('Amount exceeds current balance');
    // Valid again: the error clears live.
    act(() => {
      hook.setAmount('10');
    });
    expect(hook.amountError).toBe('');
    // Re-trigger, then empty the field: clears as well (the CTA hides at 0).
    act(() => {
      hook.setAmount('1001');
    });
    act(() => {
      hook.submit();
    });
    expect(hook.amountError).toBe('Amount exceeds current balance');
    act(() => {
      hook.setAmount('');
    });
    expect(hook.amountError).toBe('');
  });

  it('allows a new transaction once the previous submit has settled', async () => {
    await renderHook();
    act(() => {
      hook.setAmount('10');
      hook.setName('John Doe');
      hook.setIban(VALID_IBAN);
    });
    let first = false;
    act(() => {
      first = hook.submit();
    });
    expect(first).toBe(true);
    expect(context.transactions).toHaveLength(1);
    // The re-entry guard releases on the next tick; the form was cleared.
    await act(async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 10);
      });
    });
    act(() => {
      hook.setAmount('5');
      hook.setName('Jane Doe');
      hook.setIban(VALID_IBAN);
    });
    let second = false;
    act(() => {
      second = hook.submit();
    });
    expect(second).toBe(true);
    expect(context.transactions).toHaveLength(2);
  });
});

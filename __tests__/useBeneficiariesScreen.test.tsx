import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { TransactionProvider } from '../src/TransactionContext';
import { useBeneficiariesScreen } from '../src/hooks/useBeneficiariesScreen';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

let hook: ReturnType<typeof useBeneficiariesScreen>;

const Probe = () => {
  hook = useBeneficiariesScreen();
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

describe('useBeneficiariesScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with empty form state', async () => {
    await renderHook();
    expect(hook.beneficiaries).toEqual([]);
    expect(hook.name).toBe('');
    expect(hook.iban).toBe('');
    expect(hook.nameError).toBe('');
    expect(hook.ibanError).toBe('');
  });

  it('rejects empty name', async () => {
    await renderHook();
    act(() => {
      hook.setIban(VALID_IBAN);
    });
    act(() => {
      hook.handleAdd();
    });
    expect(hook.nameError).toBe('Please enter a name');
    expect(hook.beneficiaries).toEqual([]);
  });

  it('rejects invalid IBAN', async () => {
    await renderHook();
    act(() => {
      hook.setName('John Doe');
      hook.setIban('invalid');
    });
    act(() => {
      hook.handleAdd();
    });
    expect(hook.ibanError).toBe('Please enter a valid IBAN');
    expect(hook.beneficiaries).toEqual([]);
  });

  it('rejects a duplicate IBAN', async () => {
    await renderHook();
    act(() => {
      hook.setName('John Doe');
      hook.setIban(VALID_IBAN);
    });
    act(() => {
      hook.handleAdd();
    });
    expect(hook.beneficiaries).toHaveLength(1);

    act(() => {
      hook.setName('Jane Doe');
      hook.setIban(VALID_IBAN);
    });
    act(() => {
      hook.handleAdd();
    });
    expect(hook.ibanError).toBe('This beneficiary already exists');
    expect(hook.beneficiaries).toHaveLength(1);
  });

  it('adds a beneficiary and clears the form', async () => {
    await renderHook();
    act(() => {
      hook.setName('John Doe');
      hook.setIban(VALID_IBAN);
    });
    act(() => {
      hook.handleAdd();
    });
    expect(hook.nameError).toBe('');
    expect(hook.ibanError).toBe('');
    expect(hook.name).toBe('');
    expect(hook.iban).toBe('');
    expect(hook.beneficiaries).toHaveLength(1);
    expect(hook.beneficiaries[0].name).toBe('John Doe');
  });
});

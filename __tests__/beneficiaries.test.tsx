import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

let context: ReturnType<typeof useTransactions>;

const Probe = () => {
  context = useTransactions();
  return null;
};

const renderProvider = async () => {
  await act(async () => {
    renderer.create(
      <TransactionProvider>
        <Probe />
      </TransactionProvider>,
    );
  });
};

describe('beneficiaries state', () => {
  // The provider persists on every change; start each test from empty storage.
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty', async () => {
    await renderProvider();
    expect(context.beneficiaries).toEqual([]);
  });

  it('adds a beneficiary with a generated id', async () => {
    await renderProvider();
    act(() => {
      context.addBeneficiary('John Doe', VALID_IBAN);
    });
    expect(context.beneficiaries).toHaveLength(1);
    expect(context.beneficiaries[0]).toEqual({
      id: expect.any(Number),
      name: 'John Doe',
      iban: 'GB29NWBK60161331926819',
    });
  });

  it('appends without replacing existing beneficiaries', async () => {
    await renderProvider();
    act(() => {
      context.addBeneficiary('John Doe', VALID_IBAN);
      context.addBeneficiary('Jane Doe', 'DE89370400440532013000');
    });
    expect(context.beneficiaries).toHaveLength(2);
    expect(context.beneficiaries[1].name).toBe('Jane Doe');
    expect(context.beneficiaries[0].id).not.toBe(context.beneficiaries[1].id);
  });

  it('stores the IBAN normalized', async () => {
    await renderProvider();
    act(() => {
      context.addBeneficiary('John Doe', 'gb29 nwbk 6016 1331 9268 19');
    });
    expect(context.beneficiaries[0].iban).toBe('GB29NWBK60161331926819');
  });

  it.each([
    [VALID_IBAN, 'exact duplicate'],
    ['gb29nwbk60161331926819', 'same IBAN without spaces, lowercase'],
    ['GB29NWBK60161331926819', 'same IBAN without spaces'],
  ])('ignores a duplicate IBAN (%s)', async duplicateIban => {
    await renderProvider();
    act(() => {
      context.addBeneficiary('John Doe', VALID_IBAN);
      context.addBeneficiary('Johnny Doe', duplicateIban);
    });
    expect(context.beneficiaries).toHaveLength(1);
  });
});

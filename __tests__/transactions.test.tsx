import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  INITIAL_BALANCE_CENTS,
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';
import type { Account } from '../src/types';

const ACCOUNT: Account = {
  name: 'John Doe',
  iban: 'GB29 NWBK 6016 1331 9268 19',
};

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

describe('transactions state', () => {
  // The provider persists on every change; start each test from empty storage.
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with the initial balance and no transactions', async () => {
    await renderProvider();
    expect(context.balanceCents).toBe(INITIAL_BALANCE_CENTS);
    expect(context.transactions).toEqual([]);
  });

  it('applies a transaction and stores the amount in cents', async () => {
    await renderProvider();
    let accepted = false;
    act(() => {
      accepted = context.addTransaction('10.50', ACCOUNT);
    });
    expect(accepted).toBe(true);
    expect(context.balanceCents).toBe(INITIAL_BALANCE_CENTS - 1050);
    expect(context.transactions).toHaveLength(1);
    expect(context.transactions[0]).toEqual({
      id: expect.any(Number),
      amountCents: 1050,
      account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
    });
  });

  it('rejects an overdraft and changes nothing', async () => {
    await renderProvider();
    let accepted = true;
    act(() => {
      accepted = context.addTransaction('1000.01', ACCOUNT);
    });
    expect(accepted).toBe(false);
    expect(context.balanceCents).toBe(INITIAL_BALANCE_CENTS);
    expect(context.transactions).toEqual([]);
  });

  it.each(['', 'abc', '0x10', '1e3', '10.505', '-5', '0'])(
    'rejects the invalid amount %s',
    async amount => {
      await renderProvider();
      let accepted = true;
      act(() => {
        accepted = context.addTransaction(amount, ACCOUNT);
      });
      expect(accepted).toBe(false);
      expect(context.balanceCents).toBe(INITIAL_BALANCE_CENTS);
      expect(context.transactions).toEqual([]);
    },
  );

  it('blocks a second rapid transaction that would overdraw', async () => {
    await renderProvider();
    // Both calls run before any re-render: without an authoritative balance
    // they would both validate against the same stale value.
    const results: boolean[] = [];
    act(() => {
      results.push(context.addTransaction('600', ACCOUNT));
      results.push(context.addTransaction('600', ACCOUNT));
    });
    expect(results).toEqual([true, false]);
    expect(context.transactions).toHaveLength(1);
    expect(context.balanceCents).toBe(INITIAL_BALANCE_CENTS - 60000);
  });

  it('generates monotonic ids across rapid transactions', async () => {
    await renderProvider();
    act(() => {
      context.addTransaction('1', ACCOUNT);
      context.addTransaction('2', ACCOUNT);
    });
    const [first, second] = context.transactions;
    expect(second.id).toBeGreaterThan(first.id);
  });
});

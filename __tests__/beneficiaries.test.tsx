import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it } from '@jest/globals';

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

const renderProvider = () => {
  act(() => {
    renderer.create(
      <TransactionProvider>
        <Probe />
      </TransactionProvider>,
    );
  });
};

describe('beneficiaries state', () => {
  it('starts empty', () => {
    renderProvider();
    expect(context.beneficiaries).toEqual([]);
  });

  it('adds a beneficiary with a generated id', () => {
    renderProvider();
    act(() => {
      context.addBeneficiary('John Doe', VALID_IBAN);
    });
    expect(context.beneficiaries).toHaveLength(1);
    expect(context.beneficiaries[0]).toEqual({
      id: expect.any(Number),
      name: 'John Doe',
      iban: VALID_IBAN,
    });
  });

  it('appends without replacing existing beneficiaries', () => {
    renderProvider();
    act(() => {
      context.addBeneficiary('John Doe', VALID_IBAN);
      context.addBeneficiary('Jane Doe', VALID_IBAN);
    });
    expect(context.beneficiaries).toHaveLength(2);
    expect(context.beneficiaries[1].name).toBe('Jane Doe');
  });
});

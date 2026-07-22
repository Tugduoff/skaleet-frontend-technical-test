import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';
import { useBeneficiariesScreen } from '../src/hooks/useBeneficiariesScreen';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

let hook: ReturnType<typeof useBeneficiariesScreen>;
let context: ReturnType<typeof useTransactions>;

const Probe = () => {
  hook = useBeneficiariesScreen();
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

describe('useBeneficiariesScreen', () => {
  let alertSpy: jest.SpiedFunction<typeof Alert.alert>;

  beforeEach(async () => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('exposes the beneficiaries', async () => {
    await renderHook();
    expect(hook.beneficiaries).toEqual([]);
    act(() => {
      context.addBeneficiary({
        firstName: 'John',
        lastName: 'Doe',
        iban: VALID_IBAN,
      });
    });
    expect(hook.beneficiaries).toHaveLength(1);
  });

  it('confirmDelete asks for confirmation and deletes on confirm', async () => {
    await renderHook();
    act(() => {
      context.addBeneficiary({
        firstName: 'John',
        lastName: 'Doe',
        iban: VALID_IBAN,
      });
    });
    act(() => {
      hook.confirmDelete(hook.beneficiaries[0]);
    });
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete beneficiary',
      'Remove John Doe from your beneficiaries?',
      expect.any(Array),
    );
    const buttons = alertSpy.mock.calls[0][2];
    const deleteButton = buttons?.find(button => button.text === 'Delete');
    act(() => {
      deleteButton?.onPress?.();
    });
    expect(hook.beneficiaries).toHaveLength(0);
  });
});

import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  render,
  screen,
  fireEvent,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TransactionScreen from '../src/TransactionScreen';
import { TransactionProvider } from '../src/TransactionContext';
import type { RootStackParamList } from '../src/types';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

type Navigation = NativeStackScreenProps<
  RootStackParamList,
  'Transaction'
>['navigation'];

const seedBeneficiary = () =>
  AsyncStorage.setItem(
    'app-state',
    JSON.stringify({
      version: 3,
      transactions: [],
      balanceCents: 100000,
      beneficiaries: [
        {
          id: 1,
          firstName: 'Jane',
          lastName: 'Doe',
          iban: 'GB29NWBK60161331926819',
        },
      ],
    }),
  );

const renderScreen = async () => {
  const navigation = { goBack: jest.fn(), replace: jest.fn() };
  await render(
    <TransactionProvider>
      <TransactionScreen
        navigation={navigation as unknown as Navigation}
        route={{
          key: 'transaction-test',
          name: 'Transaction',
          params: undefined,
        }}
      />
    </TransactionProvider>,
  );
  return navigation;
};

const submitManualTransaction = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.type(screen.getByPlaceholderText('Enter amount'), '10.50');
  await user.type(screen.getByPlaceholderText('Recipient Name'), 'John Doe');
  await user.type(screen.getByPlaceholderText('Recipient IBAN'), VALID_IBAN);
  await user.press(screen.getByText('Submit Transaction'));
};

describe('TransactionScreen', () => {
  let alertSpy: jest.SpiedFunction<typeof Alert.alert>;

  beforeEach(async () => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('shows a manual-entry hint when there are no beneficiaries', async () => {
    await renderScreen();
    expect(
      await screen.findByText(
        'No saved beneficiaries — enter the recipient manually',
      ),
    ).toBeTruthy();
  });

  it('rejects an empty amount', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await user.press(await screen.findByText('Submit Transaction'));
    expect(await screen.findByText('Please enter an amount')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('rejects an amount exceeding the balance', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByPlaceholderText('Enter amount'), '1001');
    await user.press(screen.getByText('Submit Transaction'));
    expect(
      await screen.findByText('Amount exceeds current balance'),
    ).toBeTruthy();
  });

  it('rejects an invalid recipient IBAN', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByPlaceholderText('Enter amount'), '10');
    await user.type(screen.getByPlaceholderText('Recipient Name'), 'John Doe');
    await user.type(
      screen.getByPlaceholderText('Recipient IBAN'),
      'not-an-iban',
    );
    await user.press(screen.getByText('Submit Transaction'));
    expect(await screen.findByText('Please enter a valid IBAN')).toBeTruthy();
  });

  it('offers to save a new manual recipient, and leaves on No thanks', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await submitManualTransaction(user);
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Save recipient',
        'Add John Doe to your beneficiaries?',
        expect.any(Array),
      ),
    );
    const buttons = alertSpy.mock.calls[0][2];
    const decline = buttons?.find(button => button.text === 'No thanks');
    decline?.onPress?.();
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('opens the prefilled beneficiary form on Save', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await submitManualTransaction(user);
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    const buttons = alertSpy.mock.calls[0][2];
    const save = buttons?.find(button => button.text === 'Save');
    save?.onPress?.();
    expect(navigation.replace).toHaveBeenCalledWith('BeneficiaryForm', {
      prefillFirstName: 'John',
      prefillLastName: 'Doe',
      prefillIban: VALID_IBAN,
    });
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('shows the picker when beneficiaries exist and submits for the default selection', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    const navigation = await renderScreen();
    await screen.findByTestId('beneficiary-picker');
    // Manual entry fields are hidden while a beneficiary is selected.
    expect(screen.queryByPlaceholderText('Recipient Name')).toBeNull();
    await user.type(screen.getByPlaceholderText('Enter amount'), '10');
    await user.press(screen.getByText('Submit Transaction'));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
    // A known recipient is not offered to be saved again.
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('reveals manual entry when the picker is switched to manual', async () => {
    await seedBeneficiary();
    await renderScreen();
    const picker = await screen.findByTestId('beneficiary-picker');
    fireEvent(picker, 'onValueChange', 'manual');
    expect(await screen.findByPlaceholderText('Recipient Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Recipient IBAN')).toBeTruthy();
  });
});

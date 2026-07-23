import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  render,
  screen,
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
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TransactionScreen from '../src/TransactionScreen';
import { TransactionProvider } from '../src/TransactionContext';
import type { RootStackParamList, RootTabParamList } from '../src/types';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

type Navigation = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Transaction'>,
  NativeStackScreenProps<RootStackParamList>
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

const renderScreen = async (params?: { prefillBeneficiaryId?: number }) => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  await render(
    <TransactionProvider>
      <TransactionScreen
        navigation={navigation as unknown as Navigation}
        route={{
          key: 'transaction-test',
          name: 'Transaction',
          params,
        }}
      />
    </TransactionProvider>,
  );
  return navigation;
};

const submitManualTransaction = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.type(screen.getByPlaceholderText('0.00'), '10.50');
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

  it('hides the submit button until amount and manual recipient are filled', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByPlaceholderText('0.00');
    expect(screen.queryByText('Submit Transaction')).toBeNull();
    await user.type(screen.getByPlaceholderText('0.00'), '10');
    // Amount alone is not enough: manual name and IBAN are still required.
    expect(screen.queryByText('Submit Transaction')).toBeNull();
    await user.type(screen.getByPlaceholderText('Recipient Name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Recipient IBAN'), VALID_IBAN);
    expect(await screen.findByText('Submit Transaction')).toBeTruthy();
  });

  it('rejects an amount exceeding the balance', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByPlaceholderText('0.00'), '1001');
    await user.type(screen.getByPlaceholderText('Recipient Name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Recipient IBAN'), VALID_IBAN);
    await user.press(screen.getByText('Submit Transaction'));
    expect(
      await screen.findByText('Amount exceeds current balance'),
    ).toBeTruthy();
  });

  it('rejects an invalid recipient IBAN', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByPlaceholderText('0.00'), '10');
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
    expect(navigation.navigate).toHaveBeenCalledWith('Home');
    expect(navigation.navigate).not.toHaveBeenCalledWith(
      'BeneficiaryForm',
      expect.anything(),
    );
  });

  it('opens the prefilled beneficiary form on Save', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await submitManualTransaction(user);
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    const buttons = alertSpy.mock.calls[0][2];
    const save = buttons?.find(button => button.text === 'Save');
    save?.onPress?.();
    expect(navigation.navigate).toHaveBeenCalledWith('BeneficiaryForm', {
      prefillFirstName: 'John',
      prefillLastName: 'Doe',
      prefillIban: VALID_IBAN,
    });
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('adds quick amounts to the input', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByPlaceholderText('0.00');
    await user.press(screen.getByTestId('quick-add-1000'));
    await user.press(screen.getByTestId('quick-add-5000'));
    expect(screen.getByPlaceholderText('0.00').props.value).toBe('60.00');
  });

  it('shows recipient chips when beneficiaries exist and submits for the default selection', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    const navigation = await renderScreen();
    await screen.findByTestId('beneficiary-option-1');
    // Manual entry fields are hidden while a beneficiary is selected.
    expect(screen.queryByPlaceholderText('Recipient Name')).toBeNull();
    await user.type(screen.getByPlaceholderText('0.00'), '10');
    await user.press(screen.getByText('Submit Transaction'));
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('Home'),
    );
    // A known recipient is not offered to be saved again.
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('reveals manual entry via the manual chip, and hides it again', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    await renderScreen();
    await screen.findByTestId('beneficiary-option-1');
    await user.press(screen.getByTestId('beneficiary-option-manual'));
    expect(await screen.findByPlaceholderText('Recipient Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Recipient IBAN')).toBeTruthy();
    await user.press(screen.getByTestId('beneficiary-option-1'));
    expect(screen.queryByPlaceholderText('Recipient Name')).toBeNull();
  });

  it('pre-selects the beneficiary passed via route params', async () => {
    const user = userEvent.setup();
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 3,
        transactions: [],
        balanceCents: 100000,
        beneficiaries: [
          {
            id: 1,
            firstName: 'First',
            lastName: 'Beneficiary',
            iban: 'GB29NWBK60161331926819',
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Doe',
            iban: 'DE89370400440532013000',
          },
        ],
      }),
    );
    const navigation = await renderScreen({ prefillBeneficiaryId: 2 });
    await screen.findByTestId('beneficiary-option-2');
    await user.type(screen.getByPlaceholderText('0.00'), '10');
    await user.press(screen.getByText('Submit Transaction'));
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('Home'),
    );
  });
});

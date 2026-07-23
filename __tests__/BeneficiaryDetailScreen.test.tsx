import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent, act } from '@testing-library/react-native';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BeneficiaryDetailScreen from '../src/BeneficiaryDetailScreen';
import {
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';
import type { RootStackParamList } from '../src/types';

type Navigation = NativeStackScreenProps<
  RootStackParamList,
  'BeneficiaryDetail'
>['navigation'];

const seedState = () =>
  AsyncStorage.setItem(
    'app-state',
    JSON.stringify({
      version: 4,
      transactions: [
        {
          id: 1,
          amountCents: 1000,
          account: { name: 'Jane Doe', iban: 'GB29NWBK60161331926819' },
          createdAt: '2026-07-20T09:05:00',
        },
        {
          id: 2,
          amountCents: 2000,
          account: { name: 'Jane Doe', iban: 'GB29NWBK60161331926819' },
          createdAt: '2026-07-22T14:30:00',
        },
        {
          id: 3,
          amountCents: 500,
          account: { name: 'Someone Else', iban: 'DE89370400440532013000' },
          createdAt: '2026-07-23T10:00:00',
        },
      ],
      balanceCents: 96500,
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
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  await render(
    <TransactionProvider>
      <BeneficiaryDetailScreen
        navigation={navigation as unknown as Navigation}
        route={{
          key: 'beneficiary-detail-test',
          name: 'BeneficiaryDetail',
          params: { beneficiaryId: 1 },
        }}
      />
    </TransactionProvider>,
  );
  return navigation;
};

describe('BeneficiaryDetailScreen', () => {
  let alertSpy: jest.SpiedFunction<typeof Alert.alert>;

  beforeEach(async () => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('renders the beneficiary header', async () => {
    await seedState();
    await renderScreen();
    expect(
      await screen.findByTestId('beneficiary-detail-name'),
    ).toHaveTextContent('Jane Doe');
    expect(screen.getByTestId('beneficiary-detail-iban')).toHaveTextContent(
      'GB29 NWBK 6016 1331 9268 19',
    );
  });

  it('shows only transactions to this recipient, newest first', async () => {
    await seedState();
    await renderScreen();
    expect(await screen.findByText('-€20.00')).toBeTruthy();
    expect(screen.getByText('-€10.00')).toBeTruthy();
    expect(screen.queryByText('Someone Else')).toBeNull();
    const amounts = screen.getAllByText(/^-€/);
    expect(amounts.map(row => row.props.children)).toEqual([
      '-€20.00',
      '-€10.00',
    ]);
  });

  it('shows an empty state when there is no history', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
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
    await renderScreen();
    expect(await screen.findByText('No transactions yet')).toBeTruthy();
  });

  it('navigates to the transaction screen prefilled with this beneficiary', async () => {
    await seedState();
    const navigation = await renderScreen();
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('beneficiary-detail-send'));
    expect(navigation.navigate).toHaveBeenCalledWith('Tabs', {
      screen: 'Transaction',
      params: { prefillBeneficiaryId: 1 },
    });
  });

  it('navigates to the edit form', async () => {
    await seedState();
    const navigation = await renderScreen();
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('beneficiary-detail-edit'));
    expect(navigation.navigate).toHaveBeenCalledWith('BeneficiaryForm', {
      beneficiaryId: 1,
    });
  });

  it('asks for confirmation before deleting and goes back on confirm', async () => {
    let context: ReturnType<typeof useTransactions>;
    const Probe = () => {
      context = useTransactions();
      return null;
    };
    await seedState();
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    await render(
      <TransactionProvider>
        <Probe />
        <BeneficiaryDetailScreen
          navigation={navigation as unknown as Navigation}
          route={{
            key: 'beneficiary-detail-test',
            name: 'BeneficiaryDetail',
            params: { beneficiaryId: 1 },
          }}
        />
      </TransactionProvider>,
    );
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('beneficiary-detail-delete'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete beneficiary',
      'Remove Jane Doe from your beneficiaries?',
      expect.any(Array),
    );
    const buttons = alertSpy.mock.calls[0][2];
    const confirm = buttons?.find(button => button.text === 'Delete');
    await act(async () => {
      confirm?.onPress?.();
    });
    expect(context!.beneficiaries).toHaveLength(0);
    expect(navigation.goBack).toHaveBeenCalled();
  });
});

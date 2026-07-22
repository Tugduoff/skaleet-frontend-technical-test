import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  render,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BeneficiaryFormScreen from '../src/BeneficiaryFormScreen';
import {
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';
import type { RootStackParamList } from '../src/types';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

type Props = NativeStackScreenProps<RootStackParamList, 'BeneficiaryForm'>;

// The app only mounts screens once loading finished; mirror that here so
// the form mounts with the persisted beneficiaries already available.
const Gate = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useTransactions();
  return isLoading ? null : children;
};

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

const renderScreen = async (params?: Props['route']['params']) => {
  const navigation = { goBack: jest.fn() };
  await render(
    <TransactionProvider>
      <Gate>
        <BeneficiaryFormScreen
          navigation={navigation as unknown as Props['navigation']}
          route={{
            key: 'beneficiary-form-test',
            name: 'BeneficiaryForm',
            params,
          }}
        />
      </Gate>
    </TransactionProvider>,
  );
  return navigation;
};

describe('BeneficiaryFormScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows a validation error instead of navigating when fields are empty', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await user.press(await screen.findByText('Save Beneficiary'));
    expect(await screen.findByText('Please enter a first name')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('creates a beneficiary and navigates back', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await user.type(screen.getByPlaceholderText('First name'), 'John');
    await user.type(screen.getByPlaceholderText('Last name'), 'Doe');
    await user.type(screen.getByPlaceholderText('IBAN'), VALID_IBAN);
    await user.press(screen.getByText('Save Beneficiary'));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  });

  it('prefills the form in edit mode and saves the changes', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    const navigation = await renderScreen({ beneficiaryId: 1 });
    expect(await screen.findByDisplayValue('Jane')).toBeTruthy();
    expect(screen.getByDisplayValue('Doe')).toBeTruthy();
    expect(screen.getByDisplayValue('GB29NWBK60161331926819')).toBeTruthy();
    const lastNameInput = screen.getByDisplayValue('Doe');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Smith');
    await user.press(screen.getByText('Save Beneficiary'));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
    const stored = await AsyncStorage.getItem('app-state');
    expect(stored).toContain('"lastName":"Smith"');
  });
});

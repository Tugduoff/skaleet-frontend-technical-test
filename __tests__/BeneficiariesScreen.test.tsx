import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { beforeEach, describe, expect, it } from '@jest/globals';

import BeneficiariesScreen from '../src/BeneficiariesScreen';
import { TransactionProvider } from '../src/TransactionContext';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

const renderScreen = () =>
  render(
    <TransactionProvider>
      <BeneficiariesScreen />
    </TransactionProvider>,
  );

describe('BeneficiariesScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows an empty state when there are no beneficiaries', async () => {
    renderScreen();
    expect(await screen.findByText('No beneficiaries yet')).toBeTruthy();
  });

  it('rejects an empty name', async () => {
    renderScreen();
    await screen.findByText('Add Beneficiary');
    fireEvent.press(screen.getByText('Add Beneficiary'));
    expect(screen.getByText('Please enter a name')).toBeTruthy();
  });

  it('rejects an invalid IBAN', async () => {
    renderScreen();
    await screen.findByText('Add Beneficiary');
    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary name'),
      'John Doe',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      'not-an-iban',
    );
    fireEvent.press(screen.getByText('Add Beneficiary'));
    expect(screen.getByText('Please enter a valid IBAN')).toBeTruthy();
  });

  it('adds a beneficiary, shows it in the list and clears the form', async () => {
    renderScreen();
    await screen.findByText('Add Beneficiary');
    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary name'),
      'John Doe',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      VALID_IBAN,
    );
    fireEvent.press(screen.getByText('Add Beneficiary'));
    expect(await screen.findByText('John Doe')).toBeTruthy();
    expect(screen.getByText('IBAN: GB29NWBK60161331926819')).toBeTruthy();
    expect(screen.queryByText('No beneficiaries yet')).toBeNull();
  });

  it('rejects a duplicate IBAN', async () => {
    renderScreen();
    await screen.findByText('Add Beneficiary');
    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary name'),
      'John Doe',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      VALID_IBAN,
    );
    fireEvent.press(screen.getByText('Add Beneficiary'));
    await screen.findByText('John Doe');

    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary name'),
      'Jane Doe',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      'gb29nwbk60161331926819',
    );
    fireEvent.press(screen.getByText('Add Beneficiary'));
    expect(screen.getByText('This beneficiary already exists')).toBeTruthy();
    // Jane was not added: the list still shows only John.
    expect(screen.queryByText('Jane Doe')).toBeNull();
  });
});

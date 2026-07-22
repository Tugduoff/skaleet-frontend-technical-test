import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { loadState, saveState } from '../src/utils/storage';

const state = {
  transactions: [
    {
      id: 1,
      amountCents: 4250,
      account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
    },
  ],
  balanceCents: 95750,
  beneficiaries: [{ id: 2, name: 'John Doe', iban: 'GB29NWBK60161331926819' }],
};

/** Schema v1 fixture: monetary values as fractional major units. */
const v1State = {
  version: 1,
  transactions: [
    {
      id: 1,
      amount: 42.5,
      account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
    },
  ],
  balance: 957.5,
  beneficiaries: [{ id: 2, name: 'John Doe', iban: 'GB29NWBK60161331926819' }],
};

describe('storage', () => {
  let warnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(async () => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns null when nothing is stored', async () => {
    expect(await loadState()).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('round-trips the state with a version field', async () => {
    await saveState(state);
    expect(await loadState()).toEqual({ version: 2, ...state });
  });

  it('returns null and warns for a payload from a newer version', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({ version: 999, ...state }),
    );
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null and warns for corrupted JSON', async () => {
    await AsyncStorage.setItem('app-state', '{not json');
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null and warns when stored fields are missing', async () => {
    await AsyncStorage.setItem('app-state', JSON.stringify({ version: 2 }));
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null when balanceCents is not a non-negative safe integer', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 2,
        transactions: [],
        balanceCents: 100.5,
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();

    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 2,
        transactions: [],
        balanceCents: -100,
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null when transaction amountCents is invalid', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 2,
        transactions: [
          { id: 1, amountCents: 10.5, account: { name: 'X', iban: 'Y' } },
        ],
        balanceCents: 0,
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null when stored fields have wrong types', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 2,
        transactions: {},
        balanceCents: 'lots',
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null and warns when the payload is not a state object', async () => {
    await AsyncStorage.setItem('app-state', JSON.stringify('just a string'));
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();

    await AsyncStorage.setItem('app-state', JSON.stringify({ version: 'two' }));
    expect(await loadState()).toBeNull();
  });

  it('returns null and warns when the read fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error());
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('does not throw when the write fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error());
    await expect(saveState(state)).resolves.toBeUndefined();
  });
});

describe('storage migrations', () => {
  let warnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(async () => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('migrates a v1 payload to v2, converting fractional units to cents', async () => {
    await AsyncStorage.setItem('app-state', JSON.stringify(v1State));
    expect(await loadState()).toEqual({
      version: 2,
      transactions: [
        {
          id: 1,
          amountCents: 4250,
          account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
        },
      ],
      balanceCents: 95750,
      beneficiaries: v1State.beneficiaries,
    });
  });

  it('rounds fractional cents when migrating v1 amounts', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({ ...v1State, transactions: [], balance: 19.999 }),
    );
    expect(await loadState()).toEqual({
      version: 2,
      transactions: [],
      balanceCents: 2000,
      beneficiaries: v1State.beneficiaries,
    });
  });

  it('returns null and warns when a v1 payload is malformed', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({ ...v1State, balance: 'lots' }),
    );
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null and warns when a v1 transaction is malformed', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        ...v1State,
        transactions: [
          { id: 1, amount: '42.50', account: { name: 'X', iban: 'Y' } },
        ],
      }),
    );
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null and warns when no migration is registered for the version', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 0,
        transactions: [],
        balance: 0,
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });
});

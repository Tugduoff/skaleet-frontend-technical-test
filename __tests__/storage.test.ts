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
      createdAt: '2026-07-22T12:00:00.000Z',
    },
  ],
  balanceCents: 95750,
  beneficiaries: [
    {
      id: 2,
      firstName: 'John',
      lastName: 'Doe',
      iban: 'GB29NWBK60161331926819',
    },
  ],
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

/** Schema v2 fixture: integer cents, beneficiaries with a single name. */
const v2State = {
  version: 2,
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

/** Schema v3 fixture: beneficiary first/last names, no transaction timestamps. */
const v3State = {
  version: 3,
  transactions: v2State.transactions,
  balanceCents: 95750,
  beneficiaries: state.beneficiaries,
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
    expect(await loadState()).toEqual({ version: 4, ...state });
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
    await AsyncStorage.setItem('app-state', JSON.stringify({ version: 4 }));
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null when balanceCents is not a non-negative safe integer', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
        transactions: [],
        balanceCents: 100.5,
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();

    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
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
        version: 4,
        transactions: [
          {
            id: 1,
            amountCents: 10.5,
            account: { name: 'X', iban: 'Y' },
            createdAt: '2026-07-22T12:00:00.000Z',
          },
        ],
        balanceCents: 0,
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null when a transaction misses createdAt', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
        transactions: [
          { id: 1, amountCents: 1050, account: { name: 'X', iban: 'Y' } },
        ],
        balanceCents: 0,
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null when a beneficiary is malformed', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
        transactions: [],
        balanceCents: 0,
        beneficiaries: [{ id: 2, firstName: 'John', iban: 'GB29' }],
      }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null when stored fields have wrong types', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
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

  it('migrates a v1 payload to v4: cents, name split and timestamps', async () => {
    await AsyncStorage.setItem('app-state', JSON.stringify(v1State));
    expect(await loadState()).toEqual({
      version: 4,
      transactions: [
        {
          id: 1,
          amountCents: 4250,
          account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
          createdAt: expect.any(String),
        },
      ],
      balanceCents: 95750,
      beneficiaries: [
        {
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          iban: 'GB29NWBK60161331926819',
        },
      ],
    });
  });

  it('rounds fractional cents when migrating v1 amounts', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({ ...v1State, transactions: [], balance: 19.999 }),
    );
    const migrated = await loadState();
    expect(migrated?.balanceCents).toBe(2000);
  });

  it('migrates a v2 payload to v4, splitting the beneficiary name', async () => {
    await AsyncStorage.setItem('app-state', JSON.stringify(v2State));
    expect(await loadState()).toEqual({
      version: 4,
      transactions: [
        { ...v2State.transactions[0], createdAt: expect.any(String) },
      ],
      balanceCents: 95750,
      beneficiaries: state.beneficiaries,
    });
  });

  it('migrates a v3 payload to v4, stamping transactions with createdAt', async () => {
    await AsyncStorage.setItem('app-state', JSON.stringify(v3State));
    expect(await loadState()).toEqual({
      version: 4,
      transactions: [
        { ...v3State.transactions[0], createdAt: expect.any(String) },
      ],
      balanceCents: 95750,
      beneficiaries: state.beneficiaries,
    });
  });

  it('migrates a single-word beneficiary name to an empty lastName', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        ...v2State,
        beneficiaries: [
          { id: 2, name: 'Madonna', iban: 'DE89370400440532013000' },
        ],
      }),
    );
    const migrated = await loadState();
    expect(migrated?.beneficiaries).toEqual([
      {
        id: 2,
        firstName: 'Madonna',
        lastName: '',
        iban: 'DE89370400440532013000',
      },
    ]);
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

  it('returns null and warns when a v2 beneficiary is malformed', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        ...v2State,
        beneficiaries: [{ id: 2, iban: 'GB29NWBK60161331926819' }],
      }),
    );
    expect(await loadState()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null and warns when a v3 transaction is malformed', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        ...v3State,
        transactions: [
          {
            id: 1,
            amountCents: '4250',
            account: { name: 'X', iban: 'Y' },
          },
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

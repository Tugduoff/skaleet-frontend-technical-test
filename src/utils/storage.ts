import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Account, Beneficiary, Transaction } from '../types';

const STORAGE_KEY = 'app-state';
const STORAGE_VERSION = 2;

export interface PersistedState {
  version: number;
  transactions: Transaction[];
  /** Integer cents. */
  balanceCents: number;
  beneficiaries: Beneficiary[];
}

/** Schema v1 transaction: amount stored as fractional major units. */
interface TransactionV1 {
  id: number;
  amount: number;
  account: Account;
}

/**
 * Schema v1 persisted state: balance and amounts stored as fractional
 * major units (dollars).
 */
interface PersistedStateV1 {
  version: 1;
  transactions: TransactionV1[];
  balance: number;
  beneficiaries: Beneficiary[];
}

/** Returns true when value is a non-negative safe integer. */
const isNonNegativeSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= Number.MAX_SAFE_INTEGER;

/** Type guard validating the persisted shape of a Transaction record. */
const isValidTransaction = (value: unknown): value is Transaction => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const tx = value as Record<string, unknown>;
  const account = tx.account;
  if (typeof account !== 'object' || account === null) {
    return false;
  }
  const ac = account as Record<string, unknown>;
  return (
    typeof tx.id === 'number' &&
    isNonNegativeSafeInteger(tx.amountCents) &&
    typeof ac.name === 'string' &&
    typeof ac.iban === 'string'
  );
};

/** Type guard validating the persisted shape of a v1 Transaction record. */
const isValidTransactionV1 = (value: unknown): value is TransactionV1 => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const tx = value as Record<string, unknown>;
  const account = tx.account;
  if (typeof account !== 'object' || account === null) {
    return false;
  }
  const ac = account as Record<string, unknown>;
  return (
    typeof tx.id === 'number' &&
    typeof tx.amount === 'number' &&
    typeof ac.name === 'string' &&
    typeof ac.iban === 'string'
  );
};

/**
 * Type guard validating the persisted state object. Also defends against
 * corrupted numeric values that would break the integer-cents invariant.
 */
const isPersistedState = (parsed: unknown): parsed is PersistedState => {
  if (typeof parsed !== 'object' || parsed === null) {
    return false;
  }
  const state = parsed as Record<string, unknown>;
  return (
    state.version === STORAGE_VERSION &&
    Array.isArray(state.transactions) &&
    state.transactions.every(isValidTransaction) &&
    isNonNegativeSafeInteger(state.balanceCents) &&
    Array.isArray(state.beneficiaries)
  );
};

/** Type guard validating a v1 persisted state object. */
const isPersistedStateV1 = (parsed: unknown): parsed is PersistedStateV1 => {
  if (typeof parsed !== 'object' || parsed === null) {
    return false;
  }
  const state = parsed as Record<string, unknown>;
  return (
    state.version === 1 &&
    Array.isArray(state.transactions) &&
    state.transactions.every(isValidTransactionV1) &&
    typeof state.balance === 'number' &&
    Array.isArray(state.beneficiaries)
  );
};

/** Extracts the schema version of a parsed payload, or null when absent. */
const getVersion = (value: unknown): number | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const version = (value as Record<string, unknown>).version;
  return typeof version === 'number' ? version : null;
};

/**
 * Migrates a validated v1 payload to the v2 schema: fractional major units
 * become integer cents, rounded to the nearest cent.
 */
const migrateV1toV2 = (state: PersistedStateV1): PersistedState => ({
  version: 2,
  transactions: state.transactions.map(tx => ({
    id: tx.id,
    amountCents: Math.round(tx.amount * 100),
    account: tx.account,
  })),
  balanceCents: Math.round(state.balance * 100),
  beneficiaries: state.beneficiaries,
});

/**
 * Migration chain keyed by the schema version it upgrades from. Each entry
 * validates its input and returns the next version's payload, or null when
 * the input does not match the expected schema.
 */
const MIGRATIONS: Record<number, (state: unknown) => unknown | null> = {
  1: state => (isPersistedStateV1(state) ? migrateV1toV2(state) : null),
};

/**
 * Brings a parsed payload up to the current schema version by running it
 * through the migration chain. Returns null when the payload cannot be
 * recovered; every discard is logged so data loss is never silent.
 */
const migrateToCurrentVersion = (parsed: unknown): PersistedState | null => {
  if (isPersistedState(parsed)) {
    return parsed;
  }
  const version = getVersion(parsed);
  if (version === null) {
    console.warn('[storage] stored payload has no version, discarding it');
    return null;
  }
  if (version > STORAGE_VERSION) {
    console.warn(
      `[storage] stored version ${version} is newer than supported version ${STORAGE_VERSION}, discarding it`,
    );
    return null;
  }
  if (version === STORAGE_VERSION) {
    console.warn(
      `[storage] stored v${STORAGE_VERSION} payload failed validation, discarding it`,
    );
    return null;
  }
  const migrate = MIGRATIONS[version];
  if (!migrate) {
    console.warn(
      `[storage] no migration registered for version ${version}, discarding stored data`,
    );
    return null;
  }
  const migrated = migrate(parsed);
  if (migrated === null) {
    console.warn(
      `[storage] migration from version ${version} failed, discarding stored data`,
    );
    return null;
  }
  return migrateToCurrentVersion(migrated);
};

/**
 * Loads the persisted state, migrating older schema versions forward, or
 * null when nothing valid is stored. Never rejects: corrupted data or
 * read failures mean "start fresh".
 */
export const loadState = async (): Promise<PersistedState | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return migrateToCurrentVersion(parsed);
  } catch (error) {
    console.warn(
      '[storage] failed to read stored state, starting fresh',
      error,
    );
    return null;
  }
};

/**
 * Persists the state with a version field for future migrations.
 * Never rejects: a failed save must not crash the app, the state
 * stays in memory and is retried on the next change.
 */
export const saveState = async (
  state: Omit<PersistedState, 'version'>,
): Promise<void> => {
  try {
    const payload: PersistedState = { version: STORAGE_VERSION, ...state };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // intentionally swallowed, see above
  }
};

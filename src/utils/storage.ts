import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Beneficiary, Transaction } from '../types';

const STORAGE_KEY = 'app-state';
const STORAGE_VERSION = 2;

export interface PersistedState {
  version: number;
  transactions: Transaction[];
  /** Integer cents. */
  balanceCents: number;
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

/**
 * Loads the persisted state, or null when nothing valid is stored.
 * Never rejects: corrupted data or read failures mean "start fresh".
 */
export const loadState = async (): Promise<PersistedState | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isPersistedState(parsed) ? parsed : null;
  } catch {
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

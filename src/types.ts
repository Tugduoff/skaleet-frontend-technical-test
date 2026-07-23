import type { NavigatorScreenParams } from '@react-navigation/native';

export interface Account {
  name: string;
  iban: string;
}

export interface Beneficiary {
  id: number;
  firstName: string;
  lastName: string;
  iban: string;
}

export interface Transaction {
  id: number;
  /** Integer cents, e.g. 1050 for 10.50. */
  amountCents: number;
  account: Account;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
}

/** Main sections, reachable from the bottom tab bar. */
export type RootTabParamList = {
  Home: undefined;
  Transaction: { prefillBeneficiaryId?: number } | undefined;
  Beneficiaries: undefined;
};

/** Root stack: the tabs, plus full-screen flows pushed on top of them. */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList> | undefined;
  BeneficiaryDetail: { beneficiaryId: number };
  BeneficiaryForm:
    | {
        /** Present to edit an existing beneficiary, absent to create one. */
        beneficiaryId?: number;
        prefillFirstName?: string;
        prefillLastName?: string;
        prefillIban?: string;
      }
    | undefined;
};

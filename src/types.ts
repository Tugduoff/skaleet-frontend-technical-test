export interface Account {
  name: string;
  iban: string;
}

export interface Beneficiary extends Account {
  id: number;
}

export interface Transaction {
  id: number;
  amount: number;
  account: Account;
}

export type RootStackParamList = {
  Home: undefined;
  Transaction: undefined;
  Beneficiaries: undefined;
};

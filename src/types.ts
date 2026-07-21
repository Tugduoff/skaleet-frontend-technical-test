export interface Account {
  name: string;
  iban: string;
}

export interface Transaction {
  id: number;
  amount: number;
  account: Account;
}

export type RootStackParamList = {
  Home: undefined;
  Transaction: undefined;
};

export type TransactionType = 'add' | 'payment';

export interface Transaction {
  id: string;
  personId: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface Person {
  id: string;
  name: string;
  shopName?: string;
  phone?: string;
  note?: string;
  createdAt: number;
}

export interface PersonWithSummary extends Person {
  totalAdded: number;
  totalPaid: number;
  currentBalance: number;
  transactionCount: number;
  lastTransactionDate?: string;
}

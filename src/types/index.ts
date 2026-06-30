export type AccountType = 'Cash' | 'Bank' | 'E-Wallet' | 'Investment';
export type TransactionType = 'Income' | 'Expense' | 'Transfer';
export type ReceivableStatus = 'Paid' | 'Unpaid';
export type DebtStatus = 'Paid' | 'Unpaid';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string; // For transfers
  description?: string;
  attachment?: string; // Image base64 string for receipts
}

export interface Investment {
  id: string;
  name: string;
  platform: string;
  initialValue: number;
  currentValue: number;
  date: string; // Added date
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  purchaseValue: number;
  // Removed currentValue (estimated sell value)
}

export interface Receivable {
  id: string;
  debtorName: string;
  amount: number;
  dueDate: string;
  status: ReceivableStatus;
  description?: string;
}

export interface Debt {
  id: string;
  creditorName: string;
  amount: number;
  dueDate: string;
  status: DebtStatus;
  description?: string;
}

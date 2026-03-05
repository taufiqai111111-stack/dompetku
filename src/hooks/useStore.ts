import { useState, useEffect } from 'react';
import { Account, Transaction, Investment, Asset, Receivable } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initial Mock Data
const initialAccounts: Account[] = [
  { id: '1', name: 'Dompet Tunai', type: 'Cash', balance: 500000 },
  { id: '2', name: 'BCA', type: 'Bank', balance: 15000000 },
  { id: '3', name: 'GoPay', type: 'E-Wallet', balance: 250000 },
  { id: '4', name: 'Bibit', type: 'Investment', balance: 5000000 },
];

const initialTransactions: Transaction[] = [
  { id: '1', date: new Date().toISOString(), type: 'Income', amount: 10000000, category: 'Gaji', accountId: '2', description: 'Gaji Bulanan' },
  { id: '2', date: new Date().toISOString(), type: 'Expense', amount: 50000, category: 'Makan', accountId: '1', description: 'Makan Siang' },
];

const initialInvestments: Investment[] = [
  { id: '1', name: 'Reksadana Saham', platform: 'Bibit', initialValue: 4500000, currentValue: 5000000, date: new Date().toISOString() },
];

const initialAssets: Asset[] = [
  { id: '1', name: 'Laptop MacBook', type: 'Elektronik', purchaseValue: 20000000 },
];

const initialReceivables: Receivable[] = [
  { id: '1', debtorName: 'Budi', amount: 100000, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'Unpaid', description: 'Pinjam uang makan' },
];

export function useStore() {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('investments');
    return saved ? JSON.parse(saved) : initialInvestments;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [receivables, setReceivables] = useState<Receivable[]>(() => {
    const saved = localStorage.getItem('receivables');
    return saved ? JSON.parse(saved) : initialReceivables;
  });

  const [platforms, setPlatforms] = useState<string[]>(() => {
    const saved = localStorage.getItem('platforms');
    return saved ? JSON.parse(saved) : ['Bibit', 'Ajaib', 'Indodax', 'Tokocrypto', 'Pluang'];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('receivables', JSON.stringify(receivables));
  }, [receivables]);

  useEffect(() => {
    localStorage.setItem('platforms', JSON.stringify(platforms));
  }, [platforms]);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  // Helper to update balance
  const updateAccountBalance = (accountId: string, amount: number, type: 'add' | 'subtract') => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          balance: type === 'add' ? acc.balance + amount : acc.balance - amount
        };
      }
      return acc;
    }));
  };

  // --- Transactions ---

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    setTransactions([newTransaction, ...transactions]);

    if (transaction.type === 'Income') {
      updateAccountBalance(transaction.accountId, transaction.amount, 'add');
    } else if (transaction.type === 'Expense') {
      updateAccountBalance(transaction.accountId, transaction.amount, 'subtract');
    } else if (transaction.type === 'Transfer' && transaction.toAccountId) {
      updateAccountBalance(transaction.accountId, transaction.amount, 'subtract');
      updateAccountBalance(transaction.toAccountId, transaction.amount, 'add');
    }
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Reverse balance effect
    if (transaction.type === 'Income') {
      updateAccountBalance(transaction.accountId, transaction.amount, 'subtract');
    } else if (transaction.type === 'Expense') {
      updateAccountBalance(transaction.accountId, transaction.amount, 'add');
    } else if (transaction.type === 'Transfer' && transaction.toAccountId) {
      updateAccountBalance(transaction.accountId, transaction.amount, 'add');
      updateAccountBalance(transaction.toAccountId, transaction.amount, 'subtract');
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    // For simplicity, we won't handle complex balance updates on edit here
    // In a real app, we'd reverse old and apply new. 
    // Here we just update the record. User might need to manually adjust balance if amount changes.
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  // --- Accounts ---

  const addAccount = (account: Omit<Account, 'id'>) => {
    setAccounts([...accounts, { ...account, id: uuidv4() }]);
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const updateAccount = (id: string, updated: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  // --- Investments ---

  const addInvestment = (investment: Omit<Investment, 'id'>, sourceAccountId?: string) => {
    setInvestments([...investments, { ...investment, id: uuidv4() }]);
    
    // Add platform if new
    if (!platforms.includes(investment.platform)) {
      setPlatforms([...platforms, investment.platform]);
    }

    // Deduct from account if source selected
    if (sourceAccountId) {
      addTransaction({
        date: investment.date,
        type: 'Expense',
        amount: investment.initialValue,
        category: 'Investasi',
        accountId: sourceAccountId,
        description: `Investasi: ${investment.name}`
      });
    }
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const updateInvestment = (id: string, updated: Partial<Investment>) => {
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
  };

  // --- Assets ---

  const addAsset = (asset: Omit<Asset, 'id'>) => {
    setAssets([...assets, { ...asset, id: uuidv4() }]);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const updateAsset = (id: string, updated: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  // --- Receivables ---

  const addReceivable = (receivable: Omit<Receivable, 'id'>, sourceAccountId?: string) => {
    setReceivables([...receivables, { ...receivable, id: uuidv4() }]);

    // Deduct from account if source selected
    if (sourceAccountId) {
      addTransaction({
        date: new Date().toISOString(),
        type: 'Expense',
        amount: receivable.amount,
        category: 'Piutang',
        accountId: sourceAccountId,
        description: `Piutang: ${receivable.debtorName}`
      });
    }
  };

  const deleteReceivable = (id: string) => {
    setReceivables(prev => prev.filter(r => r.id !== id));
  };

  const updateReceivable = (id: string, updated: Partial<Receivable>) => {
    setReceivables(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const updateReceivableStatus = (id: string, status: 'Paid' | 'Unpaid') => {
    setReceivables(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return {
    accounts,
    transactions,
    investments,
    assets,
    receivables,
    platforms,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addAccount,
    deleteAccount,
    updateAccount,
    addInvestment,
    deleteInvestment,
    updateInvestment,
    addAsset,
    deleteAsset,
    updateAsset,
    addReceivable,
    deleteReceivable,
    updateReceivable,
    updateReceivableStatus,
    isAuthenticated,
    login,
    logout
  };
}

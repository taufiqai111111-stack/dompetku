import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, cn, formatDate } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, ArrowRightLeft, Building2, TrendingUp, HandCoins, ChevronDown, ChevronUp, Calendar, Plus } from 'lucide-react';
import { TransactionType } from '../types';

export default function Dashboard() {
  const { accounts, transactions, investments, receivables, addTransaction } = useStore();
  
  // Date filter state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // State for collapsible sections
  const [showAccounts, setShowAccounts] = useState(true);
  const [showInvestments, setShowInvestments] = useState(true);
  const [showReceivables, setShowReceivables] = useState(true);

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Expense' as TransactionType,
    amount: 0,
    category: '',
    accountId: '',
    description: ''
  });

  const uniqueCategories = useMemo(() => {
    const categories = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      date: new Date(formData.date).toISOString(),
      type: formData.type,
      amount: formData.amount,
      category: formData.category,
      accountId: formData.accountId,
      description: formData.description
    });
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      amount: 0,
      category: '',
      accountId: '',
      description: ''
    });
  };

  const totalCash = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInvestments = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalReceivables = receivables
    .filter(r => r.status === 'Unpaid')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const netWorth = totalCash + totalInvestments + totalReceivables;

  // Filter transactions based on date range
  const periodTransactions = transactions.filter(t => {
    return t.date >= startDate && t.date <= endDate;
  });

  const periodIncome = periodTransactions
    .filter(t => t.type === 'Income')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const periodExpense = periodTransactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const periodBalance = periodIncome - periodExpense;

  // Calculate daily expenses
  const dailyExpenses = periodTransactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      const date = t.date.split('T')[0];
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const dailyExpenseData = Object.entries(dailyExpenses)
    .map(([date, amount]) => ({ 
      date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), 
      amount,
      fullDate: date 
    }))
    .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

  const assetAllocationData = [
    { name: 'Kas & Bank', value: totalCash, color: '#0ea5e9' }, // sky-500
    { name: 'Investasi', value: totalInvestments, color: '#10b981' }, // emerald-500
    { name: 'Piutang', value: totalReceivables, color: '#3b82f6' }, // blue-500
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Ringkasan Keuangan</h2>
        <p className="text-slate-500">Selamat datang kembali di DompetKu</p>
      </header>

      {/* 1. Total Wealth Card - Vertical Breakdown */}
      <div className="w-full bg-sky-600 text-white p-6 rounded-2xl shadow-lg shadow-sky-200">
        <div className="flex items-center gap-3 mb-4 opacity-90">
          <Wallet className="w-6 h-6" />
          <span className="text-base font-medium">Total Kekayaan Bersih</span>
        </div>
        <div className="text-4xl font-bold tracking-tight mb-6">
          {formatCurrency(netWorth)}
        </div>
        
        <div className="space-y-3 pt-4 border-t border-sky-500/30">
          <div className="flex justify-between items-center text-sky-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-200" />
              <span>Kas & Bank</span>
            </div>
            <span className="font-semibold">{formatCurrency(totalCash)}</span>
          </div>
          <div className="flex justify-between items-center text-sky-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>Investasi</span>
            </div>
            <span className="font-semibold">{formatCurrency(totalInvestments)}</span>
          </div>
          <div className="flex justify-between items-center text-sky-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-300" />
              <span>Piutang</span>
            </div>
            <span className="font-semibold">{formatCurrency(totalReceivables)}</span>
          </div>
        </div>
      </div>

      {/* Vertical Breakdown Sections */}
      <div className="space-y-4">
        
        {/* 2. Rekening Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button 
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Rekening & Kas</h3>
                <p className="text-xs text-slate-500">Total: {formatCurrency(totalCash)}</p>
              </div>
            </div>
            {showAccounts ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showAccounts && (
            <div className="px-5 pb-5 pt-0 space-y-3 border-t border-slate-50 mt-2">
              <div className="h-2" /> {/* Spacer */}
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-sky-500 rounded-full" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{acc.name}</p>
                      <p className="text-xs text-slate-500">{acc.type}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-700">{formatCurrency(acc.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Investasi Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button 
            onClick={() => setShowInvestments(!showInvestments)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Investasi</h3>
                <p className="text-xs text-slate-500">Total: {formatCurrency(totalInvestments)}</p>
              </div>
            </div>
            {showInvestments ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showInvestments && (
            <div className="px-5 pb-5 pt-0 space-y-3 border-t border-slate-50 mt-2">
              <div className="h-2" />
              {investments.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{inv.name}</p>
                    <p className="text-xs text-slate-500">{inv.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700">{formatCurrency(inv.currentValue)}</p>
                    <p className={`text-xs ${inv.currentValue >= inv.initialValue ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {((inv.currentValue - inv.initialValue) / inv.initialValue * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
              {investments.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-2">Belum ada investasi</p>
              )}
            </div>
          )}
        </div>

        {/* 4. Piutang Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button 
            onClick={() => setShowReceivables(!showReceivables)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <HandCoins className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Piutang (Dipinjamkan)</h3>
                <p className="text-xs text-slate-500">Belum Lunas: {formatCurrency(totalReceivables)}</p>
              </div>
            </div>
            {showReceivables ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showReceivables && (
            <div className="px-5 pb-5 pt-0 space-y-3 border-t border-slate-50 mt-2">
              <div className="h-2" />
              {receivables.filter(r => r.status === 'Unpaid').map(rec => (
                <div key={rec.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{rec.debtorName}</p>
                    <p className="text-xs text-slate-500">Jatuh Tempo: {formatDate(rec.dueDate)}</p>
                  </div>
                  <p className="font-bold text-slate-700">{formatCurrency(rec.amount)}</p>
                </div>
              ))}
              {receivables.filter(r => r.status === 'Unpaid').length === 0 && (
                <p className="text-center text-slate-400 text-sm py-2">Tidak ada piutang belum lunas</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Stats (Vertical Stack) */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Arus Kas Periode</h3>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-slate-200 rounded px-2 py-1"
            />
            <span className="text-slate-400 self-center">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border border-slate-200 rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wider">Pemasukan</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{formatCurrency(periodIncome)}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3 text-rose-500">
            <div className="p-2 bg-rose-50 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wider">Pengeluaran</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{formatCurrency(periodExpense)}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wider">Selisih</span>
          </div>
          <div className={`text-lg font-bold ${periodBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {periodBalance >= 0 ? '+' : ''}{formatCurrency(periodBalance)}
          </div>
        </div>
      </div>

      {/* Daily Expenses Chart */}
      {dailyExpenseData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Pengeluaran Harian</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyExpenseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Pengeluaran']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Alokasi Aset</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetAllocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {assetAllocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Transaksi Terakhir</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  t.type === 'Income' ? "bg-emerald-100 text-emerald-600" : 
                  t.type === 'Expense' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                )}>
                  {t.type === 'Income' ? <ArrowUpRight className="w-5 h-5" /> : 
                   t.type === 'Expense' ? <ArrowDownRight className="w-5 h-5" /> : 
                   <ArrowRightLeft className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{t.description || t.category}</p>
                  <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
                </div>
              </div>
              <span className={cn(
                "font-semibold",
                t.type === 'Income' ? "text-emerald-600" : 
                t.type === 'Expense' ? "text-rose-600" : "text-slate-900"
              )}>
                {t.type === 'Expense' ? '-' : '+'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-8 text-center text-slate-500">Belum ada transaksi</div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Catat Transaksi</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
                {(['Income', 'Expense'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, type})}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      formData.type === type 
                        ? 'bg-white shadow-sm text-slate-900' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type === 'Income' ? 'Pemasukan' : 'Pengeluaran'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  list="category-list"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  placeholder="Pilih atau ketik baru"
                />
                <datalist id="category-list">
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sumber Dana (Akun)</label>
                <select
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                >
                  <option value="">Pilih Sumber/Tujuan Dana</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <textarea
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

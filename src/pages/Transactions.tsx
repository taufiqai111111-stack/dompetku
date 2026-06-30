import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, downloadCSV } from '../lib/utils';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Filter, Calendar, Edit2, Trash2, Download, Image as ImageIcon, X } from 'lucide-react';
import { TransactionType, Transaction } from '../types';

export default function Transactions() {
  const { transactions, accounts, addTransaction, deleteTransaction, updateTransaction } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | 'All'>('All');
  
  // Date Range Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Expense' as TransactionType,
    amount: 0,
    category: '',
    accountId: '',
    description: '',
    attachment: ''
  });

  // Derive unique categories from existing transactions
  const uniqueCategories = useMemo(() => {
    const categories = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      updateTransaction(formData.id, {
        date: new Date(formData.date).toISOString(),
        type: formData.type,
        amount: formData.amount,
        category: formData.category,
        accountId: formData.accountId,
        description: formData.description,
        attachment: formData.attachment
      });
    } else {
      addTransaction({
        date: new Date(formData.date).toISOString(),
        type: formData.type,
        amount: formData.amount,
        category: formData.category,
        accountId: formData.accountId,
        description: formData.description,
        attachment: formData.attachment
      });
    }
    closeModal();
  };

  const openEditModal = (t: Transaction) => {
    setFormData({
      id: t.id,
      date: new Date(t.date).toISOString().split('T')[0],
      type: t.type,
      amount: t.amount,
      category: t.category,
      accountId: t.accountId,
      description: t.description || '',
      attachment: t.attachment || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({
      id: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      amount: 0,
      category: '',
      accountId: '',
      description: '',
      attachment: ''
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a warning if file is too large (over 1MB) for localstorage
      if (file.size > 1024 * 1024) {
        alert('File terlalu besar. Maksimal 1MB untuk penyimpanan lokal.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, attachment: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'All' ? true : t.type === filterType;
    let matchesDate = true;
    if (t.date) {
      const tDate = t.date.split('T')[0];
      if (startDate && tDate < startDate) matchesDate = false;
      if (endDate && tDate > endDate) matchesDate = false;
    }
    return matchesType && matchesDate;
  });

  const handleDownload = () => {
    const dataToDownload = filteredTransactions.map(t => ({
      Tanggal: formatDate(t.date),
      Tipe: t.type === 'Income' ? 'Pemasukan' : t.type === 'Expense' ? 'Pengeluaran' : 'Transfer',
      Kategori: t.category,
      Keterangan: t.description || '-',
      Akun: accounts.find(a => a.id === t.accountId)?.name || 'Unknown',
      'Akun Tujuan': t.toAccountId ? accounts.find(a => a.id === t.toAccountId)?.name : '-',
      Jumlah: t.amount
    }));
    downloadCSV(dataToDownload, `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h2>
          <p className="text-slate-500">Catatan lengkap pemasukan dan pengeluaran</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <input 
              type="date" 
              className="text-sm p-1 outline-none w-28 md:w-32"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Dari"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              className="text-sm p-1 outline-none w-28 md:w-32"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Sampai"
            />
          </div>
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="w-full md:w-40 pl-9 pr-4 py-2 border border-slate-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="All">Semua</option>
              <option value="Income">Pemasukan</option>
              <option value="Expense">Pengeluaran</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleDownload}
              className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap flex-1 md:flex-none"
            >
              <Download className="w-4 h-4" />
              Unduh Data
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap flex-1 md:flex-none"
            >
              <Plus className="w-4 h-4" />
              Catat Baru
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Keterangan</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Kategori</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Akun</th>
                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Jumlah</th>
                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' :
                        t.type === 'Expense' ? 'bg-rose-100 text-rose-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {t.type === 'Income' ? <ArrowUpRight className="w-4 h-4" /> :
                         t.type === 'Expense' ? <ArrowDownRight className="w-4 h-4" /> :
                         <ArrowRightLeft className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span>{t.description || '-'}</span>
                        {t.attachment && (
                          <div className="flex items-center gap-1 text-xs text-sky-600 mt-1 cursor-pointer">
                            <ImageIcon className="w-3 h-3" />
                            <span>Lihat Bukti</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {accounts.find(a => a.id === t.accountId)?.name || 'Unknown'}
                    {t.toAccountId && ` → ${accounts.find(a => a.id === t.toAccountId)?.name}`}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                    t.type === 'Income' ? 'text-emerald-600' :
                    t.type === 'Expense' ? 'text-rose-600' :
                    'text-slate-900'
                  }`}>
                    {t.type === 'Expense' ? '-' : '+'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(t)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada transaksi ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Transaksi' : 'Catat Transaksi'}</h3>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sumber Dana (Akun)
                </label>
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Bukti Transaksi (Opsional)</label>
                
                {formData.attachment ? (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 inline-block">
                    <img src={formData.attachment} alt="Bukti Transaksi" className="h-32 object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, attachment: ''}))}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-slate-700 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-sky-500 transition-colors bg-slate-50">
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none"
                        >
                          <span>Upload file</span>
                          <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG up to 1MB</p>
                    </div>
                  </div>
                )}
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

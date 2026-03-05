import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, downloadCSV } from '../lib/utils';
import { Plus, Wallet, Building2, Smartphone, TrendingUp, Edit2, Trash2, Download } from 'lucide-react';
import { AccountType, Account } from '../types';

export default function Accounts() {
  const { accounts, addAccount, deleteAccount, updateAccount } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Bank' as AccountType,
    balance: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      updateAccount(formData.id, {
        name: formData.name,
        type: formData.type,
        balance: formData.balance
      });
    } else {
      addAccount({
        name: formData.name,
        type: formData.type,
        balance: formData.balance
      });
    }
    closeModal();
  };

  const openEditModal = (acc: Account) => {
    setFormData({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ id: '', name: '', type: 'Bank', balance: 0 });
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      case 'Cash': return <Wallet className="w-6 h-6" />;
      case 'Bank': return <Building2 className="w-6 h-6" />;
      case 'E-Wallet': return <Smartphone className="w-6 h-6" />;
      case 'Investment': return <TrendingUp className="w-6 h-6" />;
    }
  };

  const handleDownload = () => {
    const dataToDownload = accounts.map(acc => ({
      'Nama Rekening': acc.name,
      'Tipe': acc.type,
      'Saldo': acc.balance
    }));
    downloadCSV(dataToDownload, `rekening_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rekening Saya</h2>
          <p className="text-slate-500">Kelola semua akun keuangan Anda di satu tempat</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownload}
            className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Unduh
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Rekening
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(account)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteAccount(account.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                {getIcon(account.type)}
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                {account.type}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{account.name}</h3>
            <p className="text-2xl font-bold text-sky-600 mt-2">
              {formatCurrency(account.balance)}
            </p>
          </div>
        ))}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Rekening' : 'Tambah Rekening Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Rekening</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: BCA Utama"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as AccountType})}
                >
                  <option value="Cash">Tunai</option>
                  <option value="Bank">Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Investment">Investasi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.balance}
                  onChange={e => setFormData({...formData, balance: Number(e.target.value)})}
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

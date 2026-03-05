import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../lib/utils';
import { ArrowRightLeft } from 'lucide-react';

export default function Transfer() {
  const { accounts, addTransaction } = useStore();
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromAccountId === formData.toAccountId) {
      alert('Rekening asal dan tujuan tidak boleh sama');
      return;
    }
    
    addTransaction({
      date: new Date(formData.date).toISOString(),
      type: 'Transfer',
      amount: formData.amount,
      category: 'Transfer',
      accountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      description: formData.description || 'Transfer antar rekening'
    });

    setSuccessMsg('Transfer berhasil!');
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Transfer Dana</h2>
        <p className="text-slate-500">Pindahkan uang antar rekening Anda dengan mudah</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        {successMsg && (
          <div className="mb-6 p-4 bg-sky-50 text-sky-700 rounded-xl text-center font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dari Rekening</label>
              <select
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                value={formData.fromAccountId}
                onChange={e => setFormData({...formData, fromAccountId: e.target.value})}
              >
                <option value="">Pilih Rekening Asal</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 z-10">
              <ArrowRightLeft className="w-5 h-5" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ke Rekening</label>
              <select
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                value={formData.toAccountId}
                onChange={e => setFormData({...formData, toAccountId: e.target.value})}
              >
                <option value="">Pilih Rekening Tujuan</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Transfer</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
              <input
                type="number"
                required
                min="1"
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg font-semibold"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
              <input
                type="date"
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Catatan (Opsional)</label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Contoh: Top up e-wallet"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-5 h-5" />
            Konfirmasi Transfer
          </button>
        </form>
      </div>
    </div>
  );
}

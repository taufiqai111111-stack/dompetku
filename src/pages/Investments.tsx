import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, downloadCSV } from '../lib/utils';
import { Plus, TrendingUp, TrendingDown, Building, Trash2, Edit2, Calendar, Download } from 'lucide-react';
import { Investment } from '../types';

export default function Investments() {
  const { investments, addInvestment, deleteInvestment, updateInvestment, platforms, accounts } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Date Range Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    platform: '',
    initialValue: 0,
    currentValue: 0,
    date: new Date().toISOString().split('T')[0],
    sourceAccountId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [useSourceAccount, setUseSourceAccount] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      updateInvestment(formData.id, {
        name: formData.name,
        platform: formData.platform,
        initialValue: formData.initialValue,
        currentValue: formData.currentValue,
        date: new Date(formData.date).toISOString()
      });
    } else {
      addInvestment({
        name: formData.name,
        platform: formData.platform,
        initialValue: formData.initialValue,
        currentValue: formData.currentValue,
        date: new Date(formData.date).toISOString()
      }, useSourceAccount ? formData.sourceAccountId : undefined);
    }
    closeModal();
  };

  const openEditModal = (inv: Investment) => {
    setFormData({
      id: inv.id,
      name: inv.name,
      platform: inv.platform,
      initialValue: inv.initialValue,
      currentValue: inv.currentValue,
      date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      sourceAccountId: ''
    });
    setIsEditing(true);
    setUseSourceAccount(false); // Disable source account for edits to avoid double deduction complexity
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      platform: '',
      initialValue: 0,
      currentValue: 0,
      date: new Date().toISOString().split('T')[0],
      sourceAccountId: ''
    });
    setUseSourceAccount(false);
  };

  const filteredInvestments = investments.filter(inv => {
    if (!inv.date) return true;
    const invDate = inv.date.split('T')[0];
    if (startDate && invDate < startDate) return false;
    if (endDate && invDate > endDate) return false;
    return true;
  });

  const handleDownload = () => {
    const dataToDownload = filteredInvestments.map(inv => ({
      Nama: inv.name,
      Platform: inv.platform,
      Tanggal: inv.date ? formatDate(inv.date) : '-',
      'Modal Awal': inv.initialValue,
      'Nilai Sekarang': inv.currentValue,
      'Keuntungan': inv.currentValue - inv.initialValue,
      'Persentase': inv.initialValue > 0 ? ((inv.currentValue - inv.initialValue) / inv.initialValue * 100).toFixed(2) + '%' : '0%'
    }));
    downloadCSV(dataToDownload, `investasi_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const totalInitial = filteredInvestments.reduce((acc, curr) => acc + curr.initialValue, 0);
  const totalCurrent = filteredInvestments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalProfit = totalCurrent - totalInitial;
  const profitPercentage = totalInitial > 0 ? (totalProfit / totalInitial) * 100 : 0;

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Portofolio Investasi</h2>
          <p className="text-slate-500">Pantau pertumbuhan aset investasi Anda</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <input 
              type="date" 
              className="text-sm p-1 outline-none w-32"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Dari"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              className="text-sm p-1 outline-none w-32"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Sampai"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap flex-1 md:flex-none"
            >
              <Download className="w-4 h-4" />
              Unduh
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap flex-1 md:flex-none"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Total Nilai Sekarang</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCurrent)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Total Modal</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalInitial)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Keuntungan / Kerugian</p>
          <div className={`flex items-center gap-2 text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(totalProfit)}
            <span className="text-sm font-medium px-2 py-1 bg-slate-100 rounded-full">
              {profitPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Investment List - Vertical */}
      <div className="flex flex-col gap-4">
        {filteredInvestments.map((inv) => {
          const profit = inv.currentValue - inv.initialValue;
          const percent = inv.initialValue > 0 ? (profit / inv.initialValue) * 100 : 0;
          
          return (
            <div key={inv.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{inv.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{inv.platform}</span>
                      <span>•</span>
                      <span>{inv.date ? formatDate(inv.date) : '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(inv)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteInvestment(inv.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Nilai Sekarang</p>
                  <p className="font-bold text-slate-900 text-lg">{formatCurrency(inv.currentValue)}</p>
                  <p className="text-xs text-slate-400 mt-1">Modal: {formatCurrency(inv.initialValue)}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Return</p>
                  <div className={`flex items-center justify-end gap-1 font-bold text-lg ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {percent.toFixed(1)}%
                  </div>
                  <p className={`text-xs mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {filteredInvestments.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
            Tidak ada data investasi ditemukan
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Investasi' : 'Tambah Investasi'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Aset</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: BBCA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    list="platform-list"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    placeholder="Pilih atau ketik baru"
                  />
                  <datalist id="platform-list">
                    {platforms.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modal Awal</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    value={formData.initialValue}
                    onChange={e => setFormData({...formData, initialValue: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Sekarang</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    value={formData.currentValue}
                    onChange={e => setFormData({...formData, currentValue: Number(e.target.value)})}
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useSource"
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                      checked={useSourceAccount}
                      onChange={e => setUseSourceAccount(e.target.checked)}
                    />
                    <label htmlFor="useSource" className="text-sm font-medium text-slate-700">
                      Ambil dana dari rekening?
                    </label>
                  </div>
                  
                  {useSourceAccount && (
                    <select
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                      value={formData.sourceAccountId}
                      onChange={e => setFormData({...formData, sourceAccountId: e.target.value})}
                    >
                      <option value="">Pilih Rekening Sumber</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.balance)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

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

import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, downloadCSV } from '../lib/utils';
import { Plus, HandCoins, CheckCircle, XCircle, Edit2, Trash2, Download } from 'lucide-react';
import { Receivable } from '../types';

export default function Receivables() {
  const { receivables, addReceivable, updateReceivableStatus, deleteReceivable, updateReceivable, accounts } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [useSourceAccount, setUseSourceAccount] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    debtorName: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
    sourceAccountId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      updateReceivable(formData.id, {
        debtorName: formData.debtorName,
        amount: formData.amount,
        dueDate: new Date(formData.dueDate).toISOString(),
        description: formData.description
      });
    } else {
      addReceivable({
        debtorName: formData.debtorName,
        amount: formData.amount,
        dueDate: new Date(formData.dueDate).toISOString(),
        description: formData.description,
        status: 'Unpaid'
      }, useSourceAccount ? formData.sourceAccountId : undefined);
    }
    closeModal();
  };

  const openEditModal = (rec: Receivable) => {
    setFormData({
      id: rec.id,
      debtorName: rec.debtorName,
      amount: rec.amount,
      dueDate: new Date(rec.dueDate).toISOString().split('T')[0],
      description: rec.description || '',
      sourceAccountId: ''
    });
    setIsEditing(true);
    setUseSourceAccount(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({
      id: '',
      debtorName: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      description: '',
      sourceAccountId: ''
    });
    setUseSourceAccount(false);
  };

  const handleDownload = () => {
    const dataToDownload = receivables.map(rec => ({
      'Nama Peminjam': rec.debtorName,
      'Jumlah': rec.amount,
      'Jatuh Tempo': formatDate(rec.dueDate),
      'Status': rec.status === 'Paid' ? 'Lunas' : 'Belum Lunas',
      'Keterangan': rec.description || '-'
    }));
    downloadCSV(dataToDownload, `piutang_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Buku Piutang</h2>
          <p className="text-slate-500">Catatan pinjaman yang diberikan ke orang lain</p>
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
            Catat Piutang
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receivables.map((rec) => (
          <div key={rec.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
            {rec.status === 'Paid' && (
              <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-bl-xl text-xs font-bold">
                LUNAS
              </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => openEditModal(rec)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg bg-white shadow-sm">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteReceivable(rec.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg bg-white shadow-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <HandCoins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{rec.debtorName}</h3>
                <p className="text-xs text-slate-500">Jatuh Tempo: {new Date(rec.dueDate).toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(rec.amount)}</p>
              <p className="text-sm text-slate-500 mt-1">{rec.description}</p>
            </div>

            {rec.status === 'Unpaid' && (
              <button
                onClick={() => updateReceivableStatus(rec.id, 'Paid')}
                className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Tandai Lunas
              </button>
            )}
            {rec.status === 'Paid' && (
              <button
                onClick={() => updateReceivableStatus(rec.id, 'Unpaid')}
                className="w-full py-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Batalkan Lunas
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Piutang' : 'Catat Piutang Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Peminjam</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.debtorName}
                  onChange={e => setFormData({...formData, debtorName: e.target.value})}
                />
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Jatuh Tempo</label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
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

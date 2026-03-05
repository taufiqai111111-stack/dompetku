import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, downloadCSV } from '../lib/utils';
import { Plus, Box, Car, Home, Laptop, Edit2, Trash2, Download } from 'lucide-react';
import { Asset } from '../types';

export default function Assets() {
  const { assets, addAsset, deleteAsset, updateAsset } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Elektronik',
    purchaseValue: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      updateAsset(formData.id, {
        name: formData.name,
        type: formData.type,
        purchaseValue: formData.purchaseValue
      });
    } else {
      addAsset({
        name: formData.name,
        type: formData.type,
        purchaseValue: formData.purchaseValue
      });
    }
    closeModal();
  };

  const openEditModal = (asset: Asset) => {
    setFormData({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      purchaseValue: asset.purchaseValue
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ id: '', name: '', type: 'Elektronik', purchaseValue: 0 });
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'properti': return <Home className="w-6 h-6" />;
      case 'kendaraan': return <Car className="w-6 h-6" />;
      case 'elektronik': return <Laptop className="w-6 h-6" />;
      default: return <Box className="w-6 h-6" />;
    }
  };

  const handleDownload = () => {
    const dataToDownload = assets.map(asset => ({
      'Nama Aset': asset.name,
      'Tipe': asset.type,
      'Nilai Beli': asset.purchaseValue
    }));
    downloadCSV(dataToDownload, `aset_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Aset Fisik</h2>
          <p className="text-slate-500">Daftar harta benda berharga Anda</p>
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
            Tambah Aset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(asset)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteAsset(asset.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                {getIcon(asset.type)}
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                {asset.type}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{asset.name}</h3>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nilai Beli</span>
                <span className="font-bold text-slate-900">{formatCurrency(asset.purchaseValue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Aset' : 'Tambah Aset Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Aset</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Kendaraan">Kendaraan</option>
                  <option value="Properti">Properti</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Beli</label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.purchaseValue}
                  onChange={e => setFormData({...formData, purchaseValue: Number(e.target.value)})}
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

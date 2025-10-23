'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface VipPackage {
  _id: string;
  level: number;
  name: string;
  price: number;
  dailyWithdrawLimit: number;
  dailyTasksLimit: number;
  features: string[];
  isActive: boolean;
}

export default function VipPackagesManager() {
  const [packages, setPackages] = useState<VipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    level: 1,
    name: '',
    price: 0,
    dailyWithdrawLimit: 0,
    dailyTasksLimit: 0,
    features: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔑 Admin Token:', token ? 'Var' : 'Yok');
      
      const response = await fetch('/api/admin/vip-packages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 API Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ VIP Paketleri:', data.packages);
        setPackages(data.packages);
      } else {
        const errorData = await response.json();
        console.error('❌ API Hatası:', errorData);
        alert(`Hata: ${errorData.error || 'VIP paketleri yüklenemedi'}`);
      }
    } catch (error) {
      console.error('❌ VIP paketleri yüklenirken hata:', error);
      alert('Bağlantı hatası! Lütfen sunucunun çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/vip-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split('\n').filter(f => f.trim()),
        }),
      });

      if (response.ok) {
        await fetchPackages();
        setShowAddForm(false);
        setFormData({
          level: 1,
          name: '',
          price: 0,
          dailyWithdrawLimit: 0,
          dailyTasksLimit: 0,
          features: '',
          isActive: true,
        });
        alert('VIP paketi başarıyla oluşturuldu!');
      } else {
        const data = await response.json();
        alert(data.error || 'Hata oluştu');
      }
    } catch (error) {
      console.error('VIP paketi ekleme hatası:', error);
      alert('VIP paketi eklenirken hata oluştu');
    }
  };

  const handleUpdate = async (pkg: VipPackage) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/vip-packages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(pkg),
      });

      if (response.ok) {
        await fetchPackages();
        setEditingId(null);
        alert('VIP paketi başarıyla güncellendi!');
      } else {
        const data = await response.json();
        alert(data.error || 'Hata oluştu');
      }
    } catch (error) {
      console.error('VIP paketi güncelleme hatası:', error);
      alert('VIP paketi güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu VIP paketini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/vip-packages?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchPackages();
        alert('VIP paketi başarıyla silindi!');
      } else {
        const data = await response.json();
        alert(data.error || 'Hata oluştu');
      }
    } catch (error) {
      console.error('VIP paketi silme hatası:', error);
      alert('VIP paketi silinirken hata oluştu');
    }
  };

  const handleToggleActive = async (pkg: VipPackage) => {
    await handleUpdate({ ...pkg, isActive: !pkg.isActive });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-white">VIP Paket Yönetimi</h2>
            <p className="text-gray-400 text-sm">VIP paketlerini oluşturun ve düzenleyin</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAddForm ? 'İptal' : 'Yeni Paket'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4">Yeni VIP Paketi Oluştur</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Seviye</label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Paket Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="VIP 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fiyat ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Günlük Çekim Limiti ($)</label>
              <input
                type="number"
                value={formData.dailyWithdrawLimit}
                onChange={(e) => setFormData({ ...formData, dailyWithdrawLimit: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Günlük Görev Sayısı</label>
              <input
                type="number"
                value={formData.dailyTasksLimit}
                onChange={(e) => setFormData({ ...formData, dailyTasksLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                min="0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Özellikler (Her satıra bir özellik)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                rows={4}
                placeholder="Temel görevler&#10;Günlük çekim hakkı&#10;7/24 destek"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Packages Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-purple-500/30">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Seviye</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Paket Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fiyat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Günlük Çekim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Görev Sayısı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {packages.map((pkg) => (
              <tr key={pkg._id} className="hover:bg-gray-700/50 transition-colors">
                {editingId === pkg._id ? (
                  <>
                    <td className="px-6 py-4 text-white">{pkg.level}</td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => setPackages(packages.map(p => p._id === pkg._id ? { ...p, name: e.target.value } : p))}
                        className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => setPackages(packages.map(p => p._id === pkg._id ? { ...p, price: parseFloat(e.target.value) } : p))}
                        className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={pkg.dailyWithdrawLimit}
                        onChange={(e) => setPackages(packages.map(p => p._id === pkg._id ? { ...p, dailyWithdrawLimit: parseFloat(e.target.value) } : p))}
                        className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={pkg.dailyTasksLimit}
                        onChange={(e) => setPackages(packages.map(p => p._id === pkg._id ? { ...p, dailyTasksLimit: parseInt(e.target.value) } : p))}
                        className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${pkg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pkg.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(pkg)}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                        {pkg.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{pkg.name}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">${pkg.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-blue-400">${pkg.dailyWithdrawLimit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-purple-400">{pkg.dailyTasksLimit}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className="flex items-center gap-2"
                      >
                        {pkg.isActive ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-green-400" />
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Aktif</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">Pasif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingId(pkg._id)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {packages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Henüz VIP paketi eklenmemiş</p>
            <p className="text-sm mt-2">Yeni paket eklemek için yukarıdaki butona tıklayın</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="text-sm text-gray-400 mb-1">Toplam Paket</div>
          <div className="text-2xl font-bold text-white">{packages.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-sm text-gray-400 mb-1">Aktif Paket</div>
          <div className="text-2xl font-bold text-white">{packages.filter(p => p.isActive).length}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-4 border border-red-500/30">
          <div className="text-sm text-gray-400 mb-1">Pasif Paket</div>
          <div className="text-2xl font-bold text-white">{packages.filter(p => !p.isActive).length}</div>
        </div>
      </div>
    </div>
  );
}


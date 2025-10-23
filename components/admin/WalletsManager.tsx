'use client';

import { useState, useEffect } from 'react';

export default function WalletsManager() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWallets(data.wallets);
    } catch (error) {
      console.error('Fetch wallets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async (walletData: any) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(walletData),
      });

      if (response.ok) {
        alert('Cüzdan eklendi!');
        fetchWallets();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Add wallet error:', error);
      alert('Cüzdan eklenemedi!');
    }
  };

  const handleUpdateWallet = async (walletId: string, updates: any) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/wallets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ walletId, updates }),
      });

      if (response.ok) {
        alert('Cüzdan güncellendi!');
        fetchWallets();
        setEditingWallet(null);
      }
    } catch (error) {
      console.error('Update wallet error:', error);
      alert('Güncelleme başarısız!');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Bu cüzdanı silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`/api/admin/wallets?id=${walletId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Cüzdan silindi!');
        fetchWallets();
      }
    } catch (error) {
      console.error('Delete wallet error:', error);
      alert('Silme başarısız!');
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Kripto Cüzdanları</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Yeni Cüzdan Ekle
        </button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <div
            key={wallet._id}
            className={`bg-slate-800 rounded-xl p-6 border ${
              wallet.isActive ? 'border-green-500/50' : 'border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{wallet.name}</h3>
                <p className="text-sm text-gray-400">{wallet.crypto} - {wallet.network}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  wallet.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {wallet.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Cüzdan Adresi:</p>
              <p className="text-sm text-white font-mono break-all bg-slate-900 p-2 rounded">
                {wallet.address}
              </p>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              Min. Yatırım: ${wallet.minDeposit}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setEditingWallet(wallet)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDeleteWallet(wallet._id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <WalletForm
          onSubmit={handleAddWallet}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingWallet && (
        <WalletForm
          wallet={editingWallet}
          onSubmit={(data) => handleUpdateWallet(editingWallet._id, data)}
          onClose={() => setEditingWallet(null)}
        />
      )}
    </div>
  );
}

// Wallet Form Component
function WalletForm({ wallet, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    name: wallet?.name || '',
    crypto: wallet?.crypto || '',
    network: wallet?.network || '',
    address: wallet?.address || '',
    minDeposit: wallet?.minDeposit || 10,
    isActive: wallet?.isActive ?? true,
    order: wallet?.order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">
          {wallet ? 'Cüzdan Düzenle' : 'Yeni Cüzdan Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Cüzdan Adı</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="USDT (TRC20)"
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kripto</label>
              <input
                type="text"
                required
                value={formData.crypto}
                onChange={(e) => setFormData({ ...formData, crypto: e.target.value })}
                placeholder="USDT"
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Network</label>
              <input
                type="text"
                required
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                placeholder="TRC20"
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Cüzdan Adresi</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="TXxx..."
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Min. Yatırım ($)</label>
              <input
                type="number"
                required
                value={formData.minDeposit}
                onChange={(e) => setFormData({ ...formData, minDeposit: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Sıra</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-300">
              Aktif (Kullanıcılara göster)
            </label>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


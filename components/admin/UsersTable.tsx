'use client';

import { useState, useEffect } from 'react';

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (response.ok) {
        alert('Kullanıcı güncellendi!');
        fetchUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Update user error:', error);
      alert('Güncelleme başarısız!');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Kullanıcı ara (email, ad, soyad)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full max-w-md"
        />
        <div className="text-gray-400 text-sm">
          Toplam: {filteredUsers.length} kullanıcı
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-700 text-gray-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Ad Soyad</th>
              <th className="px-4 py-3">VIP</th>
              <th className="px-4 py-3">Ana Bakiye</th>
              <th className="px-4 py-3">Çekilebilir</th>
              <th className="px-4 py-3">Referans</th>
              <th className="px-4 py-3">Şifre</th>
              <th className="px-4 py-3">Kayıt</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-b border-slate-700 bg-slate-800 hover:bg-slate-750">
                <td className="px-4 py-3 text-white font-medium">{user.email}</td>
                <td className="px-4 py-3 text-gray-300">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.vipLevel > 0
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    VIP {user.vipLevel}
                  </span>
                </td>
                <td className="px-4 py-3 text-green-400 font-semibold">
                  ${user.balance?.toFixed(2) || '0.00'}
                </td>
                <td className="px-4 py-3 text-blue-400 font-semibold">
                  ${user.withdrawableBalance?.toFixed(2) || '0.00'}
                </td>
                <td className="px-4 py-3 text-gray-300">{user.referralCode || '-'}</td>
                <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                  {user.password || '-'}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Kullanıcı Düzenle: {editingUser.email}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Ana Bakiye ($)</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingUser.balance}
                  id="balance"
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Çekilebilir Bakiye ($)</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingUser.withdrawableBalance}
                  id="withdrawableBalance"
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">VIP Seviye</label>
                <select
                  defaultValue={editingUser.vipLevel}
                  id="vipLevel"
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => (
                    <option key={level} value={level}>VIP {level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Şifre</label>
                <input
                  type="text"
                  defaultValue={editingUser.password}
                  id="password"
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  const balance = parseFloat((document.getElementById('balance') as HTMLInputElement).value);
                  const withdrawableBalance = parseFloat((document.getElementById('withdrawableBalance') as HTMLInputElement).value);
                  const vipLevel = parseInt((document.getElementById('vipLevel') as HTMLSelectElement).value);
                  const password = (document.getElementById('password') as HTMLInputElement).value;

                  handleUpdateUser(editingUser._id, {
                    balance,
                    withdrawableBalance,
                    vipLevel,
                    password,
                  });
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Kaydet
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


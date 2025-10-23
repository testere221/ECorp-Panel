'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  description: string;
  txHash?: string;
  screenshot?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      // Sadece deposit ve withdraw işlemlerini filtrele
      const depositWithdrawTransactions = data.transactions?.filter(
        (t: Transaction) => t.type === 'deposit' || t.type === 'withdraw'
      ) || [];
      
      setTransactions(depositWithdrawTransactions);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/20';
      case 'cancelled':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Onaylandı';
      case 'pending':
        return 'Bekliyor';
      case 'rejected':
        return 'Reddedildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'deposit' ? '💰' : '💸';
  };

  const getTypeText = (type: string) => {
    return type === 'deposit' ? 'Para Yatırma' : 'Para Çekme';
  };

  const filteredTransactions = transactions.filter((t) => {
    const typeMatch = filter === 'all' || t.type === filter;
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return typeMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg">
        <h1 className="text-2xl font-bold">💳 Hesap Hareketleri</h1>
        <p className="text-blue-100 text-sm mt-1">Yatırım ve Çekim İşlemleri</p>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3">
        {/* Type Filter */}
        <div>
          <p className="text-sm text-slate-400 mb-2">İşlem Tipi</p>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'deposit'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              💰 Yatırım
            </button>
            <button
              onClick={() => setFilter('withdraw')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'withdraw'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              💸 Çekim
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <p className="text-sm text-slate-400 mb-2">Durum</p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Bekleyen
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Onaylı
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Red
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-400">İşlem bulunamadı</p>
            <p className="text-sm text-slate-500 mt-1">
              {filter !== 'all' || statusFilter !== 'all'
                ? 'Filtreleri değiştirerek tekrar deneyin'
                : 'Henüz hiç işlem yapmadınız'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getTypeIcon(transaction.type)}</div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {getTypeText(transaction.type)}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {new Date(transaction.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Açıklama:</span>
                  <span className="text-white">{transaction.description}</span>
                </div>
                {transaction.currency && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Para Birimi:</span>
                    <span className="text-white">{transaction.currency}</span>
                  </div>
                )}
                {transaction.txHash && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">TX Hash:</span>
                    <span className="text-blue-400 text-xs truncate max-w-[200px]">
                      {transaction.txHash}
                    </span>
                  </div>
                )}
                {transaction.processedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">İşlem Tarihi:</span>
                    <span className="text-white">
                      {new Date(transaction.processedAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                )}
                {transaction.adminNote && (
                  <div className="mt-2 p-2 bg-slate-700/50 rounded">
                    <p className="text-xs text-slate-400 mb-1">Admin Notu:</p>
                    <p className="text-sm text-white">{transaction.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="px-4 mt-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-slate-300 mb-2">Toplam İşlem</p>
            <p className="text-2xl font-bold text-white">{filteredTransactions.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}


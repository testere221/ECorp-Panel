'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  description: string;
  balanceAfter?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AccountHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    fetchAccountHistory();
  }, []);

  const fetchAccountHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      // Tüm tamamlanmış işlemleri al (sadece completed olanlar bakiyeyi etkiler)
      const completedTransactions = data.transactions?.filter(
        (t: Transaction) => t.status === 'completed'
      ) || [];
      
      // Tarihe göre sırala (en yeni en üstte)
      const sortedTransactions = completedTransactions.sort(
        (a: Transaction, b: Transaction) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTransactions(sortedTransactions);
      setCurrentBalance(data.user?.balance || 0);
    } catch (error) {
      console.error('Fetch account history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdraw':
        return '💸';
      case 'referral_commission':
        return '👥';
      case 'task_reward':
        return '✅';
      case 'vip_purchase':
        return '⭐';
      default:
        return '💳';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Para Yatırma';
      case 'withdraw':
        return 'Para Çekme';
      case 'referral_commission':
        return 'Referans Komisyonu';
      case 'task_reward':
        return 'Görev Kazancı';
      case 'vip_purchase':
        return 'VIP Satın Alım';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-400';
      case 'withdraw':
        return 'text-red-400';
      case 'referral_commission':
        return 'text-purple-400';
      case 'task_reward':
        return 'text-blue-400';
      case 'vip_purchase':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const isPositiveTransaction = (type: string) => {
    return ['deposit', 'referral_commission', 'task_reward'].includes(type);
  };

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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 shadow-lg">
        <h1 className="text-2xl font-bold">📊 Hesap Kayıtları</h1>
        <p className="text-purple-100 text-sm mt-1">Tüm Bakiye Değişiklikleri</p>
      </div>

      {/* Current Balance Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg">
          <p className="text-blue-100 text-sm mb-2">Güncel Bakiye</p>
          <p className="text-4xl font-bold text-white">${currentBalance.toFixed(2)}</p>
          <p className="text-blue-100 text-xs mt-2">
            {transactions.length} işlem geçmişi
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 space-y-4">
        {transactions.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-400">Henüz işlem kaydı yok</p>
            <p className="text-sm text-slate-500 mt-1">
              İşlemleriniz burada görünecek
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600"></div>

            {transactions.map((transaction, index) => (
              <div key={transaction._id} className="relative pl-20 pb-6">
                {/* Timeline Dot */}
                <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-4 border-slate-900 z-10"></div>

                {/* Transaction Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{getTypeIcon(transaction.type)}</div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {getTypeText(transaction.type)}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {new Date(transaction.createdAt).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          isPositiveTransaction(transaction.type)
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {isPositiveTransaction(transaction.type) ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Açıklama:</span>
                      <span className="text-white text-right">{transaction.description}</span>
                    </div>
                    
                    {transaction.balanceAfter !== undefined && transaction.balanceAfter !== null && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">İşlem Sonrası Bakiye:</span>
                          <span className="text-lg font-bold text-blue-400">
                            ${transaction.balanceAfter.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction Type Badge */}
                  <div className="mt-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        transaction.type
                      )} bg-slate-700/50`}
                    >
                      {getTypeText(transaction.type)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="px-4 mt-6 grid grid-cols-2 gap-4">
          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-xs text-green-200 mb-1">Toplam Gelir</p>
            <p className="text-xl font-bold text-green-400">
              $
              {transactions
                .filter((t) => isPositiveTransaction(t.type))
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-xs text-red-200 mb-1">Toplam Gider</p>
            <p className="text-xl font-bold text-red-400">
              $
              {transactions
                .filter((t) => !isPositiveTransaction(t.type))
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


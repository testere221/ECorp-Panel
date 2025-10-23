'use client';

import { useState, useEffect, useRef } from 'react';

export default function WithdrawalsManager() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Use refs to always get latest values in intervals
  const statsRef = useRef<any>(null);
  const soundEnabledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Update refs when state changes
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);
  
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  
  useEffect(() => {
    audioContextRef.current = audioContext;
  }, [audioContext]);

  // Initialize audio context
  const initializeAudio = (showAlert = true) => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      setSoundEnabled(true);
      
      // Save to localStorage
      localStorage.setItem('adminSoundEnabled', 'true');
      
      // Test sound
      playBeep(ctx);
      if (showAlert) {
        alert('🔔 Ses bildirimleri etkinleştirildi!');
      }
    }
  };

  // Auto-initialize audio if previously enabled
  useEffect(() => {
    const wasSoundEnabled = localStorage.getItem('adminSoundEnabled') === 'true';
    if (wasSoundEnabled && !audioContext) {
      setTimeout(() => {
        initializeAudio(false); // No alert on auto-init
      }, 500);
    }
  }, []);

  // Play beep sound using Web Audio API
  const playBeep = (ctx?: AudioContext) => {
    try {
      const context = ctx || audioContextRef.current;
      if (!context) {
        console.log('❌ AudioContext not initialized');
        return;
      }

      console.log('🔊 Playing beep sound...');
      
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (e) {
      console.error('❌ Audio play failed:', e);
    }
  };

  const playNotificationSound = () => {
    playBeep();
  };

  useEffect(() => {
    fetchWithdrawals();
    
    // Auto-refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      fetchWithdrawals(true); // silent mode
    }, 10000);

    // Reminder sound every 20 seconds if there are pending requests
    const reminderInterval = setInterval(() => {
      const currentStats = statsRef.current;
      const currentSoundEnabled = soundEnabledRef.current;
      
      console.log('⏰ Reminder check:', {
        stats: currentStats,
        pending: currentStats?.pending,
        soundEnabled: currentSoundEnabled
      });
      
      if (currentStats && currentStats.pending > 0 && currentSoundEnabled) {
        console.log('🔔 Triggering reminder sound for ' + currentStats.pending + ' pending withdrawal(s)');
        playNotificationSound();
      } else {
        console.log('⏸️ Reminder skipped - pending:', currentStats?.pending, 'soundEnabled:', currentSoundEnabled);
      }
    }, 20000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(reminderInterval);
    };
  }, [filter]); // Only recreate intervals when filter changes

  const fetchWithdrawals = async (silent = false) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`/api/admin/withdrawals?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Check for new pending withdrawals
      if (data.stats && previousPendingCount > 0 && data.stats.pending > previousPendingCount) {
        // New withdrawal detected!
        playNotificationSound();
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 Yeni Para Çekme Talebi!', {
            body: `${data.stats.pending - previousPendingCount} yeni talep var`,
            icon: '/favicon.ico',
            tag: 'withdrawal-notification',
          });
        }
      }
      
      setPreviousPendingCount(data.stats?.pending || 0);
      setWithdrawals(data.withdrawals);
      setStats(data.stats);
    } catch (error) {
      console.error('Fetch withdrawals error:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleApprove = async (withdrawalId: string) => {
    const txHash = prompt('İşlem hash kodunu girin (opsiyonel):');
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          withdrawalId,
          action: 'approve',
          txHash: txHash || null,
        }),
      });

      if (response.ok) {
        alert('Çekim talebi onaylandı!');
        fetchWithdrawals();
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('İşlem başarısız!');
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          withdrawalId,
          action: 'reject',
          rejectReason: 'Admin tarafından reddedildi',
        }),
      });

      if (response.ok) {
        alert('Çekim talebi reddedildi, bakiye iade edildi!');
        fetchWithdrawals();
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('İşlem başarısız!');
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Otomatik güncelleme aktif</span>
          </div>
          {!soundEnabled && (
            <button
              onClick={initializeAudio}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm animate-pulse"
            >
              🔔 Sesleri Etkinleştir
            </button>
          )}
          {soundEnabled && (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded text-sm border border-green-600">
                🔊 Ses Aktif
              </span>
              {stats && stats.pending > 0 && (
                <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs border border-yellow-600 animate-pulse">
                  🔔 Her 20sn hatırlatma
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => fetchWithdrawals()}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          🔄 Şimdi Güncelle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">Bekleyen</p>
          <p className="text-2xl font-bold text-white">{stats?.pending || 0}</p>
        </div>
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-400 text-sm">Onaylanan</p>
          <p className="text-2xl font-bold text-white">{stats?.completed || 0}</p>
        </div>
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 text-sm">Reddedilen</p>
          <p className="text-2xl font-bold text-white">{stats?.rejected || 0}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4">
          <p className="text-purple-400 text-sm">Toplam Tutar</p>
          <p className="text-2xl font-bold text-white">${stats?.totalAmount?.toFixed(2) || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['pending', 'completed', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            {status === 'pending' && '⏳ Bekleyen'}
            {status === 'completed' && '✅ Onaylanan'}
            {status === 'rejected' && '❌ Reddedilen'}
            {status === 'all' && '📋 Tümü'}
          </button>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-700 text-gray-400">
            <tr>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">Miktar</th>
              <th className="px-4 py-3">Kripto/Network</th>
              <th className="px-4 py-3">Cüzdan Adresi</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Çekim talebi bulunamadı
                </td>
              </tr>
            ) : (
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="border-b border-slate-700 bg-slate-800 hover:bg-slate-750">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{withdrawal.userId?.email || 'Bilinmeyen'}</div>
                    <div className="text-xs text-gray-400">
                      VIP {withdrawal.userId?.vipLevel || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-green-400 font-bold">
                    ${withdrawal.amount?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {withdrawal.currency}
                    <br />
                    <span className="text-xs text-gray-500">{withdrawal.network}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white font-mono max-w-xs truncate">
                      {withdrawal.walletAddress}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        withdrawal.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : withdrawal.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {withdrawal.status === 'pending' && '⏳ Bekliyor'}
                      {withdrawal.status === 'completed' && '✅ Onaylandı'}
                      {withdrawal.status === 'rejected' && '❌ Reddedildi'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(withdrawal.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    {withdrawal.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(withdrawal._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                          ✅ Onayla
                        </button>
                        <button
                          onClick={() => handleReject(withdrawal._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        >
                          ❌ Reddet
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">İşlem tamamlandı</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


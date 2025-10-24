'use client';

import { useState, useEffect, useRef } from 'react';

export default function DepositsManager() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  
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
    fetchDeposits();
    
    // Auto-refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      fetchDeposits(true); // silent mode
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
        console.log('🔔 Triggering reminder sound for ' + currentStats.pending + ' pending deposit(s)');
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

  const fetchDeposits = async (silent = false) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`/api/admin/deposits?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Check for new pending deposits
      if (data.stats && previousPendingCount > 0 && data.stats.pending > previousPendingCount) {
        // New deposit detected!
        playNotificationSound();
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 Yeni Para Yatırma Talebi!', {
            body: `${data.stats.pending - previousPendingCount} yeni talep var`,
            icon: '/favicon.ico',
            tag: 'deposit-notification',
          });
        }
      }
      
      setPreviousPendingCount(data.stats?.pending || 0);
      setDeposits(data.deposits);
      setStats(data.stats);
    } catch (error) {
      console.error('Fetch deposits error:', error);
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

  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  const handleApprove = async (depositId: string) => {
    const txHash = prompt('İşlem hash kodunu girin (opsiyonel):');
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          depositId,
          action: 'approve',
          txHash: txHash || null,
        }),
      });

      if (response.ok) {
        alert('Para yatırma talebi onaylandı! Kullanıcı bakiyesi güncellendi.');
        fetchDeposits();
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('İşlem başarısız!');
    }
  };

  const handleReject = async (depositId: string) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          depositId,
          action: 'reject',
        }),
      });

      if (response.ok) {
        alert('Para yatırma talebi reddedildi!');
        fetchDeposits();
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('İşlem başarısız!');
    }
  };

  // Filter deposits based on search query
  const filteredDeposits = deposits.filter((deposit) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const email = deposit.userId?.email?.toLowerCase() || '';
    const txHash = deposit.txHash?.toLowerCase() || '';
    const amount = deposit.amount?.toString() || '';
    const currency = deposit.currency?.toLowerCase() || '';
    
    return (
      email.includes(query) ||
      txHash.includes(query) ||
      amount.includes(query) ||
      currency.includes(query)
    );
  });

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
          onClick={() => fetchDeposits()}
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

      {/* Search Box */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Email, TX Hash, Kripto Adı veya Tutar ile ara..."
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {filteredDeposits.length} / {deposits.length} sonuç
          </div>
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

      {/* Deposits Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-700 text-gray-400">
            <tr>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">Miktar</th>
              <th className="px-4 py-3">Kripto/Network</th>
              <th className="px-4 py-3">TX Hash</th>
              <th className="px-4 py-3">Ekran Görüntüsü</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  {searchQuery ? '🔍 Arama sonucu bulunamadı' : 'Para yatırma talebi bulunamadı'}
                </td>
              </tr>
            ) : (
              filteredDeposits.map((deposit) => (
                <tr key={deposit._id} className="border-b border-slate-700 bg-slate-800 hover:bg-slate-750">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{deposit.userId?.email || 'Bilinmeyen'}</div>
                    <div className="text-xs text-gray-400">
                      VIP {deposit.userId?.vipLevel || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-green-400 font-bold">
                    ${deposit.amount?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {deposit.currency}
                    <br />
                    <span className="text-xs text-gray-500">{deposit.network || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white font-mono max-w-xs truncate" title={deposit.txHash}>
                      {deposit.txHash || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {deposit.screenshot ? (
                      <button
                        onClick={() => setViewingScreenshot(deposit.screenshot)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        🖼️ Görüntüle
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        deposit.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : deposit.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {deposit.status === 'pending' && '⏳ Bekliyor'}
                      {deposit.status === 'completed' && '✅ Onaylandı'}
                      {deposit.status === 'rejected' && '❌ Reddedildi'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(deposit.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    {deposit.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(deposit._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                          ✅ Onayla
                        </button>
                        <button
                          onClick={() => handleReject(deposit._id)}
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

      {/* Screenshot Modal */}
      {viewingScreenshot && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setViewingScreenshot(null)}
              className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 z-10"
            >
              ✕ Kapat
            </button>
            <img
              src={viewingScreenshot}
              alt="Transaction Screenshot"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UsersTable from '@/components/admin/UsersTable';
import WalletsManager from '@/components/admin/WalletsManager';
import WithdrawalsManager from '@/components/admin/WithdrawalsManager';
import DepositsManager from '@/components/admin/DepositsManager';
import VipPackagesManager from '@/components/admin/VipPackagesManager';

type PageType = 'overview' | 'users' | 'wallets' | 'deposits' | 'withdrawals' | 'vip-packages';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<PageType>('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [pendingStats, setPendingStats] = useState({ deposits: 0, withdrawals: 0 });
  const [totalUsers, setTotalUsers] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastUserCountRef = useRef<number>(0);
  const pendingStatsRef = useRef({ deposits: 0, withdrawals: 0 });
  
  useEffect(() => {
    audioContextRef.current = audioContext;
  }, [audioContext]);

  useEffect(() => {
    pendingStatsRef.current = pendingStats;
  }, [pendingStats]);

  useEffect(() => {
    // Auth kontrolü
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(user));
  }, [router]);

  // Separate effect for audio initialization
  useEffect(() => {
    // Auto-initialize audio if previously enabled
    const wasSoundEnabled = localStorage.getItem('adminSoundEnabled') === 'true';
    
    if (wasSoundEnabled && !audioContext) {
      console.log('🔄 Sayfa yenilendi, ses sistemi otomatik başlatılıyor...');
      
      // Tarayıcı etkileşimi gerektiriyorsa, butonu göster
      // Ama yine de arka planda başlatmayı dene
      setTimeout(() => {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          setAudioContext(ctx);
          setSoundEnabled(true);
          console.log('✅ Audio otomatik başlatıldı (state:', ctx.state + ')');
          
          // Eğer suspended ise, kullanıcı etkileşimi gerekebilir
          if (ctx.state === 'suspended') {
            console.log('⚠️ AudioContext suspended durumunda. İlk kullanıcı etkileşiminde aktif olacak.');
          }
        } catch (error) {
          console.error('❌ Auto audio initialization failed:', error);
        }
      }, 1000); // 1 saniye bekle, sayfa tam yüklensin
    } else if (!wasSoundEnabled) {
      console.log('ℹ️ Ses sistemi daha önce etkinleştirilmemiş.');
    }
  }, []); // Sadece ilk mount'ta çalış

  // Initialize audio context
  const initializeAudio = (showAlert = true) => {
    if (!audioContext) {
      console.log('🎵 Audio context oluşturuluyor...');
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      setSoundEnabled(true);
      
      localStorage.setItem('adminSoundEnabled', 'true');
      
      console.log('✅ AudioContext oluşturuldu, state:', ctx.state);
      
      // Resume et
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          console.log('▶️ AudioContext resume edildi!');
          playBeep(ctx);
        });
      } else {
        playBeep(ctx);
      }
      
      if (showAlert) {
        alert('🔔 Global ses bildirimleri etkinleştirildi!');
      }
    }
  };

  // Play beep sound (for pending requests)
  const playBeep = async (ctx?: AudioContext) => {
    try {
      const context = ctx || audioContextRef.current;
      if (!context) {
        console.error('❌ AudioContext bulunamadı!');
        return;
      }

      // ÖNEMLI: AudioContext suspend olmuş olabilir, önce resume et!
      if (context.state === 'suspended') {
        console.log('⏸️ AudioContext suspended, resume ediliyor...');
        await context.resume();
        console.log('▶️ AudioContext resumed!');
      }

      console.log('🔊 BEEP sesi çalınıyor... (state:', context.state + ')');

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
      
      console.log('✅ BEEP sesi çalındı!');
    } catch (e) {
      console.error('❌ Audio play failed:', e);
    }
  };

  // Play new user sound (happy melody - plays ONCE)
  const playNewUserSound = async (ctx?: AudioContext) => {
    try {
      const context = ctx || audioContextRef.current;
      if (!context) return;

      // ÖNEMLI: AudioContext suspend olmuş olabilir, önce resume et!
      if (context.state === 'suspended') {
        console.log('⏸️ AudioContext suspended, resume ediliyor...');
        await context.resume();
        console.log('▶️ AudioContext resumed!');
      }

      console.log('🎉 Yeni üye melodisi çalınıyor... (state:', context.state + ')');

      // Play a happy 3-note melody
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (Major chord)
      const noteDuration = 0.2;

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        const startTime = context.currentTime + (index * noteDuration);
        gainNode.gain.setValueAtTime(0.4, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration);
      });

      console.log('🎉 Yeni üye sesi çalındı!');
    } catch (e) {
      console.error('New user sound failed:', e);
    }
  };

  // Check pending requests and new users
  const checkPendingRequests = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const [depositsRes, withdrawalsRes, usersRes] = await Promise.all([
        fetch('/api/admin/deposits?status=all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/withdrawals?status=all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const depositsData = await depositsRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      const usersData = await usersRes.json();

      const newStats = {
        deposits: depositsData.stats?.pending || 0,
        withdrawals: withdrawalsData.stats?.pending || 0,
      };

      setPendingStats(newStats);

      // Check for new users
      const currentUserCount = usersData.stats?.totalUsers || 0;
      setTotalUsers(currentUserCount);

      // If user count increased, play new user sound ONCE
      if (lastUserCountRef.current > 0 && currentUserCount > lastUserCountRef.current) {
        const newUsersCount = currentUserCount - lastUserCountRef.current;
        console.log(`🎉 ${newUsersCount} yeni üye katıldı! (${lastUserCountRef.current} → ${currentUserCount})`);
        playNewUserSound();
      }

      // Update the last user count
      lastUserCountRef.current = currentUserCount;
    } catch (error) {
      console.error('Check pending error:', error);
    }
  };

  // Keep AudioContext alive with visibility change AND user interaction
  useEffect(() => {
    if (!audioContext) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && audioContext.state === 'suspended') {
        console.log('👁️ Sekme aktif oldu, AudioContext resume ediliyor...');
        await audioContext.resume();
        console.log('▶️ AudioContext aktif!');
      }
    };

    // Herhangi bir kullanıcı etkileşiminde resume et
    const handleUserInteraction = async () => {
      if (audioContext.state === 'suspended') {
        console.log('👆 Kullanıcı etkileşimi algılandı, AudioContext resume ediliyor...');
        await audioContext.resume();
        console.log('▶️ AudioContext aktif!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    
    // Sayfa yüklendiğinde de resume etmeyi dene
    if (audioContext.state === 'suspended') {
      console.log('🔄 Sayfa yüklendi, AudioContext resume ediliyor...');
      audioContext.resume().then(() => {
        console.log('▶️ AudioContext başlatıldı!');
      }).catch((err) => {
        console.log('⚠️ AudioContext resume edilemedi, kullanıcı etkileşimi gerekli:', err.message);
      });
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [audioContext]);

  // Global reminder system
  useEffect(() => {
    if (!soundEnabled || !audioContext) {
      console.log('⏸️ Ses sistemi henüz hazır değil:', { soundEnabled, audioContext: !!audioContext });
      return;
    }

    console.log('🎵 Global ses sistemi başlatıldı!');

    // Initial check
    checkPendingRequests();

    // Check every 10 seconds
    const checkInterval = setInterval(() => {
      console.log('🔄 API kontrolü yapılıyor...');
      checkPendingRequests();
    }, 10000);

    // Reminder sound every 20 seconds
    const reminderInterval = setInterval(() => {
      // ÖNEMLI: Ref kullan, state değil! (Closure problemi çözümü)
      const currentStats = pendingStatsRef.current;
      const totalPending = currentStats.deposits + currentStats.withdrawals;
      
      console.log('⏰ 20sn hatırlatma zamanı! Kontrol ediliyor...', {
        deposits: currentStats.deposits,
        withdrawals: currentStats.withdrawals,
        total: totalPending,
        audioState: audioContextRef.current?.state
      });
      
      if (totalPending > 0) {
        console.log('🔔 BEKLEYEN İŞLEM VAR! Ses çalınıyor...');
        playBeep();
      } else {
        console.log('✅ Bekleyen işlem yok, ses çalınmadı');
      }
    }, 20000);

    return () => {
      console.log('🛑 Global ses sistemi durduruldu');
      clearInterval(checkInterval);
      clearInterval(reminderInterval);
    };
  }, [soundEnabled, audioContext]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h1 className="text-xl font-bold text-white">E-Corp Admin</h1>
                <p className="text-xs text-gray-400">{adminUser.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Global Sound Control */}
              {!soundEnabled && (
                <button
                  onClick={() => initializeAudio(true)}
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm animate-pulse flex items-center space-x-2"
                >
                  <span>🔔</span>
                  <span>Sesleri Etkinleştir</span>
                </button>
              )}
              
              {soundEnabled && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg border border-green-600">
                    <span>🔊</span>
                    <span className="text-sm">Global Ses Aktif</span>
                  </div>
                  {totalUsers > 0 && (
                    <div className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-600">
                      <span className="text-sm">
                        👥 {totalUsers} Üye
                      </span>
                    </div>
                  )}
                  {(pendingStats.deposits > 0 || pendingStats.withdrawals > 0) && (
                    <div className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg border border-red-600 animate-pulse">
                      <span className="text-sm font-bold">
                        {pendingStats.deposits + pendingStats.withdrawals} Bekleyen
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'overview', icon: '📊', label: 'Genel Bakış' },
              { id: 'users', icon: '👥', label: 'Kullanıcılar' },
              { id: 'vip-packages', icon: '⭐', label: 'VIP Paketleri' },
              { id: 'wallets', icon: '💳', label: 'Cüzdanlar' },
              { id: 'deposits', icon: '💰', label: 'Para Yatırma' },
              { id: 'withdrawals', icon: '💸', label: 'Para Çekme' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id as PageType)}
                className={`px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  currentPage === tab.id
                    ? 'text-purple-400 border-purple-400'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'overview' && <OverviewPage />}
        {currentPage === 'users' && <UsersPage />}
        {currentPage === 'vip-packages' && <VipPackagesPage />}
        {currentPage === 'wallets' && <WalletsPage />}
        {currentPage === 'deposits' && <DepositsPage />}
        {currentPage === 'withdrawals' && <WithdrawalsPage />}
      </div>
    </div>
  );
}

// Overview Component
function OverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center">Yükleniyor...</div>;
  }

  const cards = [
    { label: 'Toplam Kullanıcı', value: stats?.totalUsers || 0, icon: '👥', color: 'blue' },
    { label: 'Aktif Kullanıcı', value: stats?.activeUsers || 0, icon: '✅', color: 'green' },
    { label: 'VIP Kullanıcı', value: stats?.vipUsers || 0, icon: '⭐', color: 'yellow' },
    { label: 'Toplam Bakiye', value: `$${stats?.totalBalance?.toFixed(2) || 0}`, icon: '💰', color: 'purple' },
    { label: 'Toplam Yatırım', value: `$${stats?.totalDeposits?.toFixed(2) || 0}`, icon: '📥', color: 'green' },
    { label: 'Toplam Çekim', value: `$${stats?.totalWithdraws?.toFixed(2) || 0}`, icon: '📤', color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Genel Bakış</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Users Component
function UsersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h2>
      <UsersTable />
    </div>
  );
}

function VipPackagesPage() {
  return <VipPackagesManager />;
}

function WalletsPage() {
  return <WalletsManager />;
}

function DepositsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Para Yatırma Talepleri</h2>
      <DepositsManager />
    </div>
  );
}

function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Para Çekme Talepleri</h2>
      <WithdrawalsManager />
    </div>
  );
}


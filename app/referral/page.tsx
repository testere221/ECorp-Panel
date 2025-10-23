"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Copy, CheckCircle, Users, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReferredUser {
  id: string;
  email: string;
  deposit: number;
  withdraw: number;
  commission: number;
  date: string;
}

export default function Referral() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [vipLevel, setVipLevel] = useState(0);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Kullanıcının referans kodunu ayarla
          setReferralCode(data.user.referralCode);
          setReferralLink(`${window.location.origin}/register?ref=${data.user.referralCode}`);
          setTotalReferrals(data.user.totalReferrals || 0);
          setVipLevel(data.user.vipLevel || 0);

          // Davet edilen kullanıcılar varsa formatla
          if (data.referrals && data.referrals.length > 0) {
            const formattedUsers = data.referrals.map((ref: any) => ({
              id: ref._id,
              email: ref.referredUserId?.email || 'Kullanıcı',
              deposit: ref.referredUserId?.totalDeposit || 0,
              withdraw: ref.referredUserId?.totalWithdraw || 0,
              commission: ref.totalEarnings || 0,
              date: new Date(ref.createdAt).toLocaleDateString('tr-TR'),
            }));
            setReferredUsers(formattedUsers);
          }
        }
      } catch (error) {
        console.error("Referral fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCommission = referredUsers.reduce((sum, user) => sum + user.commission, 0);
  const totalDeposit = referredUsers.reduce((sum, user) => sum + user.deposit, 0);
  const totalWithdraw = referredUsers.reduce((sum, user) => sum + user.withdraw, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-6 shadow-2xl mb-6">
          <button
            onClick={() => router.back()}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition mb-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-white mb-2">👥 Takımınızı Büyütün</h1>
          <p className="text-white/90 text-sm">
            Arkadaşlarınızı davet ederek E-Corp ağını genişletin ve kazancınızı artırın!
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 shadow-lg text-center">
            <Users className="mx-auto text-purple-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">{totalReferrals}</div>
            <div className="text-xs text-slate-300">Katılımcı</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 shadow-lg text-center">
            <DollarSign className="mx-auto text-green-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">${totalCommission.toFixed(2)}</div>
            <div className="text-xs text-slate-300">Kazanç</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-pink-500/30 rounded-xl p-4 shadow-lg text-center">
            <DollarSign className="mx-auto text-pink-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">${totalDeposit.toFixed(2)}</div>
            <div className="text-xs text-slate-300">Katkı</div>
          </div>
        </div>

        {/* VIP UYARISI */}
        {vipLevel === 0 && (
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-6 shadow-xl mb-4 text-white border-2 border-yellow-400">
            <div className="flex items-start gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">⚠️ Sistem Erişimi Gerekli!</h3>
                <p className="text-white text-opacity-90 mb-3">
                  Ağ kazancı elde edebilmek için <strong>VIP katılımcı olmalısınız</strong>. 
                </p>
                <p className="text-sm text-white text-opacity-80">
                  E-Corp, sadece aktif katılımcılara kazanç sağlar. Sistemin bir parçası olmadan sadece izleyici olursunuz.
                  Seviye paketlerini görüntüleyin ve ağa katılın.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-yellow-50 transition shadow-lg"
                >
                  Seviye Paketlerini Gör
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Referans Linki */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-xl mb-4">
          <h2 className="text-lg font-bold text-white mb-4">🔗 Bağlantı Kodunuz</h2>
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 mb-4 border border-purple-500/30">
            <p className="text-sm text-slate-300 mb-2">Katılım Kodu</p>
            <p className="text-2xl font-bold text-purple-400 mb-4">{referralCode}</p>
            <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="flex-1 text-sm break-all text-slate-300">
                {referralLink}
              </div>
              <button
                onClick={handleCopy}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex-shrink-0"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          {/* Sosyal Medya Butonları */}
          <div className="grid grid-cols-3 gap-3">
            <button className="bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg">
              Telegram
            </button>
            <button className="bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition shadow-lg">
              WhatsApp
            </button>
            <button className="bg-slate-700 text-white py-3 rounded-xl font-semibold hover:bg-slate-600 transition shadow-lg">
              Twitter
            </button>
          </div>
        </div>

        {/* Komisyon Bilgisi */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-xl mb-4">
          <h3 className="font-bold text-white mb-4">💰 Ağ Kazanç Sistemi</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border-2 border-green-500/50">
              <div>
                <p className="font-bold text-white">Seviye 1</p>
                <p className="text-sm text-green-200">Her katkıdan kazanç</p>
              </div>
              <div className="text-3xl font-bold text-green-400">%5</div>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
              <p className="text-sm text-slate-200 mb-2">
                💡 <strong>Örnek:</strong> Davet ettiğiniz kişi 1000$ katkı yaparsa, siz <strong>50$</strong> kazanırsınız!
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-pink-500/30">
              <p className="text-sm font-semibold text-purple-200 mb-2">
                🧬 Canlı Ağ Prensibi:
              </p>
              <p className="text-sm text-slate-300">
                E-Corp'ta "merkez" yoktur. Her katılımcı ağın bir düğümüdür. Davet ettikleriniz sisteme katkı yaptıkça, siz de ağın büyümesinden faydalanırsınız.
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-lg p-4 border-2 border-orange-500/50">
              <p className="text-sm font-semibold text-orange-200 mb-1">
                ⚠️ Katılım Şartı:
              </p>
              <p className="text-sm text-slate-200">
                Ağ kazancı elde edebilmek için <strong>VIP katılımcı</strong> olmalısınız. Sistem dışında kalanlar sadece izleyici konumundadır.
              </p>
            </div>
          </div>
        </div>

        {/* Davet Edilen Kullanıcılar */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">🌐 Ağınızdaki Katılımcılar</h2>
          {referredUsers.length > 0 ? (
            <div className="space-y-3">
              {referredUsers.map((user) => (
                <div key={user.id} className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">{user.email}</p>
                      <p className="text-xs text-slate-400">{user.date}</p>
                    </div>
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      +${user.commission}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
                      <p className="text-slate-400 text-xs">Katkı</p>
                      <p className="font-bold text-green-400">${user.deposit}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
                      <p className="text-slate-400 text-xs">Çekim</p>
                      <p className="font-bold text-red-400">${user.withdraw}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-2">Henüz ağınızda katılımcı yok</p>
              <p className="text-sm text-slate-500">Linkinizi paylaşarak ağı büyütmeye başlayın</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


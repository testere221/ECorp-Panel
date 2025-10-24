"use client";

import { Crown, Check, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "./ToastContainer";

interface VipPackage {
  _id?: string;
  level: number;
  name?: string;
  price: number;
  dailyWithdrawLimit: number;
  dailyTasksLimit: number;
  features: string[];
  isActive?: boolean;
}

export default function VipPage() {
  const [loading, setLoading] = useState(false);
  const [userVipLevel, setUserVipLevel] = useState(0);
  const [vipPackages, setVipPackages] = useState<VipPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchUserVip = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/user/profile", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserVipLevel(data.user.vipLevel);
        }
      } catch (error) {
        console.error("VIP fetch error:", error);
      }
    };

    const fetchVipPackages = async () => {
      try {
        console.log('🔍 VIP Packages: Fetching...');
        const response = await fetch("/api/vip/packages");
        console.log('📡 VIP Packages Response:', response.status, response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 VIP Packages Data:', data);
          console.log('📦 Packages array:', data.packages);
          console.log('📦 Packages length:', data.packages?.length);
          setVipPackages(data.packages || []);
        } else {
          console.error('❌ Response not OK:', response.status);
        }
      } catch (error) {
        console.error("❌ VIP packages fetch error:", error);
      } finally {
        setPackagesLoading(false);
        console.log('✅ Loading complete');
      }
    };

    fetchUserVip();
    fetchVipPackages();
  }, []);

  const handlePurchase = async (vipLevel: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/vip/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ vipLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "VIP satın alma başarısız!");
        return;
      }

      toast.success(data.message);
      // Sayfayı yenile
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("Bağlantı hatası! Lütfen tekrar deneyin.");
      console.error("VIP purchase error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradient = (level: number) => {
    const gradients = [
      "from-blue-400 to-blue-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-orange-400 to-orange-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
      "from-indigo-400 to-indigo-600",
    ];
    return gradients[level - 1] || gradients[0];
  };

  if (packagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Crown className="text-yellow-500" size={32} />
          VIP Paketleri
        </h2>
        <p className="text-gray-600 mb-3">
          VIP üye olarak daha fazla kazanma fırsatı yakalayın!
        </p>
        {userVipLevel === 0 ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800 font-semibold">
              💡 Henüz VIP üyeliğiniz bulunmuyor. Görevlere erişmek için bir VIP paketi satın alın!
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-800 font-semibold">
              ✅ Şu an VIP {userVipLevel} üyesisiniz! Daha yüksek seviyeye geçerek daha fazla kazanabilirsiniz.
            </p>
          </div>
        )}
      </div>

      {vipPackages.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
          <p className="text-yellow-800 font-semibold text-center">
            ⚠️ Şu anda aktif VIP paketi bulunmuyor. Lütfen daha sonra tekrar kontrol edin.
          </p>
        </div>
      ) : null}

      {vipPackages.map((pkg) => {
        const isPurchased = userVipLevel === pkg.level;
        const isLowerLevel = userVipLevel > pkg.level;
        
        return (
          <div
            key={pkg.level}
            className={`relative bg-gradient-to-br ${getGradient(pkg.level)} rounded-2xl p-6 shadow-xl text-white ${
              isPurchased ? 'ring-4 ring-green-400 ring-offset-2' : ''
            } ${isLowerLevel ? 'opacity-60' : ''}`}
          >
            {/* SATIN ALINDI Badge */}
            {isPurchased && (
              <div className="absolute -top-3 -right-3 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold animate-pulse">
                <CheckCircle size={20} />
                SATIN ALINDI
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown size={32} className={isPurchased ? 'animate-bounce' : ''} />
                <div>
                  <h3 className="text-2xl font-bold">VIP {pkg.level}</h3>
                  <p className="text-sm opacity-90">
                    {isPurchased ? 'Aktif Üyelik' : isLowerLevel ? 'Daha Düşük Seviye' : 'Premium Üyelik'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">${pkg.price}</div>
                <div className="text-sm opacity-90">Tek seferlik</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">${pkg.dailyWithdrawLimit}</div>
                <div className="text-xs opacity-90">Günlük Çekim</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{pkg.dailyTasksLimit}</div>
                <div className="text-xs opacity-90">Günlük Görev</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {pkg.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check size={20} className="flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handlePurchase(pkg.level)}
              disabled={isPurchased || isLowerLevel || loading}
              className={`w-full py-3 rounded-xl font-bold transition shadow-lg ${
                isPurchased 
                  ? 'bg-green-500 text-white cursor-not-allowed' 
                  : isLowerLevel 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {isPurchased ? '✓ Satın Alındı' : isLowerLevel ? 'Daha Düşük Seviye' : `VIP ${pkg.level} Satın Al`}
            </button>
          </div>
        );
      })}
    </div>
  );
}


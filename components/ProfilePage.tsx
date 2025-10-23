"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Wallet, 
  Crown, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  FileText, 
  History, 
  Send, 
  Lock, 
  LogOut 
} from "lucide-react";

interface ProfilePageProps {
  setCurrentPage?: (page: string) => void;
}

export default function ProfilePage({ setCurrentPage }: ProfilePageProps) {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Kullanıcı",
    email: "user@example.com",
    balance: 0,
    withdrawableBalance: 0,
    vipLevel: 0,
    totalReferrals: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
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
          setUser({
            name: data.user.firstName || data.user.email.split("@")[0],
            email: data.user.email,
            balance: data.user.balance,
            withdrawableBalance: data.user.withdrawableBalance,
            vipLevel: data.user.vipLevel,
            totalReferrals: data.user.totalReferrals,
            totalDeposit: data.user.totalDeposit,
            totalWithdraw: data.user.totalWithdraw,
            totalEarnings: data.user.totalEarnings,
          });
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("rememberMe");
    router.push("/login");
  };

  const actionButtons = [
    { id: 1, label: "Para Yatır", icon: ArrowDownCircle, color: "bg-green-500", path: "/deposit" },
    { id: 2, label: "Para Çek", icon: ArrowUpCircle, color: "bg-red-500", path: "/withdraw" },
    { id: 3, label: "Hesap Hareketleri", icon: FileText, color: "bg-blue-500", action: () => setCurrentPage?.("hesap-hareketleri") },
    { id: 4, label: "Hesap Kayıtları", icon: History, color: "bg-purple-500", action: () => setCurrentPage?.("hesap-kayitlari") },
  ];

  const settingsButtons = [
    { id: 1, label: "Para Aktarma", icon: Send, color: "bg-orange-500", action: () => alert("Para Aktarma - Yakında!") },
    { id: 2, label: "Şifre Değiştir", icon: Lock, color: "bg-indigo-500", action: () => alert("Şifre Değiştir - Yakında!") },
    { id: 3, label: "Çıkış Yap", icon: LogOut, color: "bg-gray-600", action: handleLogout },
  ];

  return (
    <div className="space-y-4">
      {/* Profil Bilgileri */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <User size={40} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Mail size={16} />
              <span className="text-sm opacity-90">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} />
              <span className="text-sm opacity-90">Ana Bakiye</span>
            </div>
            <div className="text-2xl font-bold">${user.balance.toFixed(2)}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={20} />
              <span className="text-sm opacity-90">VIP Seviye</span>
            </div>
            <div className="text-2xl font-bold">VIP {user.vipLevel}</div>
          </div>
        </div>
        
        <div className="bg-green-500 bg-opacity-20 rounded-xl p-4 border-2 border-green-300">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} />
            <span className="text-sm opacity-90">Çekilebilir Bakiye</span>
          </div>
          <div className="text-2xl font-bold">${user.withdrawableBalance.toFixed(2)}</div>
          <p className="text-xs mt-2 opacity-75">Görev kazançlarınızdan oluşur</p>
        </div>
      </div>

      {/* İşlem Butonları */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 gap-3">
          {actionButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={() => button.path ? router.push(button.path) : button.action?.()}
                className={`${button.color} text-white rounded-xl p-4 shadow-lg hover:scale-105 transition-transform flex flex-col items-center gap-2`}
              >
                <Icon size={24} />
                <span className="text-xs font-semibold text-center">{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ayarlar */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Hesap Ayarları</h3>
        <div className="space-y-3">
          {settingsButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={button.action}
                className={`w-full ${button.color} text-white rounded-xl p-4 shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-3`}
              >
                <Icon size={20} />
                <span className="font-semibold">{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";

export default function Withdraw() {
  const router = useRouter();
  const toast = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("TRC20");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [userBalance, setUserBalance] = useState({ balance: 0, withdrawableBalance: 0 });

  const cryptoOptions = [
    { id: "USDT", name: "USDT", icon: "₮" },
    { id: "BTC", name: "Bitcoin", icon: "₿" },
    { id: "ETH", name: "Ethereum", icon: "Ξ" },
    { id: "BNB", name: "BNB", icon: "◆" },
  ];

  const networks = ["TRC20", "ERC20", "BEP20"];

  useEffect(() => {
    const fetchBalance = async () => {
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
          setUserBalance({
            balance: data.user.balance,
            withdrawableBalance: data.user.withdrawableBalance || 0,
          });
        }
      } catch (error) {
        console.error("Balance fetch error:", error);
      }
    };

    fetchBalance();
  }, []);

  const handleWithdraw = async () => {
    if (!amount || !address) {
      toast.warning("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/withdraw/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          address,
          network: selectedNetwork,
          crypto: selectedCrypto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Çekim başarısız!");
        return;
      }

      toast.success(data.message);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      toast.error("Bağlantı hatası! Lütfen tekrar deneyin.");
      console.error("Withdraw error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Para Çek</h1>
        </div>

        {/* Bakiye */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-gray-600 mb-2 text-sm">Ana Bakiye</p>
              <p className="text-3xl font-bold text-blue-600">
                ${userBalance.balance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Para yatırma & VIP</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2 text-sm">Çekilebilir Bakiye</p>
              <p className="text-3xl font-bold text-green-600">
                ${userBalance.withdrawableBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Görev kazançları</p>
            </div>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800 text-center">
              💰 Görevleri tamamlayarak çekilebilir bakiye kazanabilirsiniz
            </p>
          </div>
        </div>

        {/* Kripto Seçimi */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Kripto Para Seçin</h2>
          <div className="grid grid-cols-2 gap-3">
            {cryptoOptions.map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => setSelectedCrypto(crypto.id)}
                className={`p-4 rounded-xl border-2 transition ${
                  selectedCrypto === crypto.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="text-3xl mb-2">{crypto.icon}</div>
                <div className="font-semibold text-gray-800">{crypto.name}</div>
                <div className="text-sm text-gray-500 mt-1">{crypto.balance}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Network Seçimi */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Network Seçin</h2>
          <div className="flex gap-3">
            {networks.map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition ${
                  selectedNetwork === network
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                }`}
              >
                {network}
              </button>
            ))}
          </div>
        </div>

        {/* Çekim Formu */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Çekim Bilgileri</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cüzdan Adresi
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Cüzdan adresinizi girin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miktar
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={userBalance.withdrawableBalance}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
              <button
                onClick={() => setAmount(userBalance.withdrawableBalance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition"
              >
                Tümü
              </button>
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            Çekim Talebi Oluştur
          </button>
        </div>

        {/* Bilgilendirme */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-gray-800 mb-3">Önemli Notlar:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Sadece çekilebilir bakiyenizi çekebilirsiniz</li>
            <li>• Görevleri tamamlayarak çekilebilir bakiye kazanın</li>
            <li>• İşlem süresi: 24 saat içinde</li>
            <li>• Network ücreti çekim miktarından düşülür</li>
            <li>• Günlük bir görev tamamlamalısınız</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


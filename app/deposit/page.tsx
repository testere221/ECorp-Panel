"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Copy, CheckCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Deposit() {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/admin/wallets');
      const data = await response.json();
      if (data.wallets && data.wallets.length > 0) {
        setWallets(data.wallets);
        setSelectedWallet(data.wallets[0]);
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
    }
  };

  const handleCopy = () => {
    if (selectedWallet) {
      navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setScreenshot(base64);
      setScreenshotPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositRequest = async () => {
    if (!selectedWallet) {
      alert("Lütfen bir cüzdan seçin!");
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Lütfen geçerli bir miktar girin!");
      return;
    }

    if (!txHash || txHash.trim().length < 10) {
      alert("Lütfen geçerli bir TX Hash girin!");
      return;
    }

    if (!screenshot) {
      alert("Lütfen işlem ekran görüntüsünü yükleyin!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/deposit/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          crypto: selectedWallet.crypto,
          network: selectedWallet.network,
          txHash: txHash.trim(),
          screenshot: screenshot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Talep oluşturulamadı!");
        return;
      }

      alert(data.message);
      
      // Formu temizle
      setDepositAmount("");
      setTxHash("");
      setScreenshot("");
      setScreenshotPreview("");
      
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      alert("Bağlantı hatası! Lütfen tekrar deneyin.");
      console.error("Deposit request error:", error);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-white">Para Yatır</h1>
        </div>

        {/* Cüzdan Seçimi */}
        {wallets.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Cüzdan Seçin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet._id}
                  onClick={() => setSelectedWallet(wallet)}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    selectedWallet?._id === wallet._id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="font-bold text-gray-800 text-lg mb-1">{wallet.name}</div>
                  <div className="text-sm text-gray-600">{wallet.crypto} - {wallet.network}</div>
                  <div className="text-xs text-gray-500 mt-2">Min: ${wallet.minDeposit}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-4">
            <p className="text-yellow-800 text-center">
              ⚠️ Şu anda aktif cüzdan bulunmuyor. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        )}

        {/* Cüzdan Adresi */}
        {selectedWallet && (
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Yatırım Adresi</h2>
            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              {selectedWallet.qrCode && (
                <div className="text-center mb-4">
                  <div className="inline-block bg-white p-4 rounded-xl">
                    <div className="text-xs text-gray-600 mb-2">QR Code</div>
                    <img src={selectedWallet.qrCode} alt="QR Code" className="w-32 h-32" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white rounded-lg p-3">
                <div className="flex-1 text-sm font-mono break-all text-gray-700">
                  {selectedWallet.address}
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                >
                  {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Sadece <strong>{selectedWallet.crypto}</strong> ({selectedWallet.network}) gönderin. 
                Diğer coinler kaybolabilir!
              </p>
            </div>

          </div>
        )}

        {/* Para Yatırma Formu */}
        {selectedWallet && (
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              💰 Para Yatırma Talebi Oluştur
            </h2>

            <div className="space-y-4">
              {/* Miktar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yatırdığınız Miktar ($) *
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="100"
                  min={selectedWallet.minDeposit}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ${selectedWallet.minDeposit}
                </p>
              </div>

              {/* TX Hash */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Hash (TX Hash) *
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x1234567890abcdef..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Blockchain işlem kodunuzu girin
                </p>
              </div>

              {/* Ekran Görüntüsü */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Ekran Görüntüsü *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <img
                        src={screenshotPreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setScreenshot("");
                          setScreenshotPreview("");
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Upload className="mx-auto mb-2 text-gray-400" size={48} />
                      <p className="text-sm text-gray-600 font-medium">
                        Dosya Seçmek İçin Tıklayın
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG (Max 5MB)
                      </p>
                    </label>
                  )}
                </div>
              </div>

              {/* Bilgilendirme */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Önemli:</strong> Para yatırma işleminizi tamamladıktan sonra TX Hash ve ekran görüntüsünü yükleyip talebinizi oluşturun. Admin onayından sonra bakiyenize yansıyacaktır.
                </p>
              </div>

              {/* Gönder Butonu */}
              <button
                onClick={handleDepositRequest}
                disabled={loading || !depositAmount || !txHash || !screenshot}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Gönderiliyor..." : "✅ Talep Gönder"}
              </button>
            </div>
          </div>
        )}

        {/* Bilgilendirme */}
        {selectedWallet && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-gray-800 mb-3">Önemli Notlar:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Minimum yatırım miktarı: ${selectedWallet.minDeposit}</li>
              <li>• İşlem onay süresi: 10-30 dakika</li>
              <li>• Network ücreti sizden alınmaz</li>
              <li>• 3 onaydan sonra bakiyenize yansır</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


# YessTyle Platform

Modern e-ticaret benzeri görev platformu - MongoDB Atlas ile tam entegre admin panelli!

## 🚀 Özellikler

### 🎯 YENİ! Admin Panel
- **Kullanıcı Yönetimi**: Tüm kullanıcıları görüntüle, düzenle
- **Cüzdan Yönetimi**: Kripto cüzdanları ekle/düzenle/sil
- **Para Yatırma Talepleri**: Onaylama/Reddetme sistemi (otomatik bakiye ekleme)
- **Para Çekme Talepleri**: Onaylama/Reddetme sistemi (tek tıkla red)
- **Gerçek Zamanlı İstatistikler**: Toplam kullanıcı, bakiye, işlemler

## 📋 Kullanıcı Özellikleri

### ✅ Kullanıcı Yönetimi
- Kayıt & Giriş (MongoDB Atlas)
- JWT Authentication
- Beni Hatırla özelliği
- Profil yönetimi

### 💰 Finansal Sistem
- **İki Bakiye Sistemi:**
  - Mevcut Bakiye: Toplam bakiye
  - Çekilebilir Bakiye: Sadece görevlerden kazanılan
- Para yatırma/çekme (Kripto)
- İşlem geçmişi
- Hesap hareketleri
- Modern Toast Notifications

### 👑 VIP Sistemi
- 5 farklı VIP seviyesi
- Günlük görev limitleri
- Günlük çekim limitleri
- VIP süre takibi

### 🎯 Görev Sistemi
- **VIP seviyesine göre görevler:**
  - VIP 0: Görev yok ❌
  - VIP 1: 1 görev/gün (3$) 💰
  - VIP 2: 2 görev/gün (6$) 💰
  - VIP 3: 3 görev/gün (12$) 💰
  - VIP 4: 4 görev/gün (25$) 💰
  - VIP 5: 5 görev/gün (50$) 💰
- Görev tamamlandığında çekilebilir bakiye artar ⭐
- 24 saatlik otomatik sıfırlama
- Görev geçmişi takibi

### 🤝 Referans Sistemi
- %5 komisyon (sadece VIP üyeler kazanır!)
- Davet linki
- Sosyal medya paylaşımı
- Davet edilen kullanıcı takibi
- Komisyon kazanç takibi
- Referans kazançları sadece çekilebilir bakiyeye eklenir

### 📊 Dashboard
- Gerçek zamanlı veriler
- 24 saatlik geri sayım
- Dinamik üye listesi
- İstatistikler

## 🗄️ Veritabanı Yapısı

### Models:
- **User**: Kullanıcı bilgileri, bakiye, VIP, referans
- **Transaction**: Para yatırma/çekme geçmişi
- **Task**: Görev tanımları
- **UserTask**: Kullanıcı görev geçmişi
- **Referral**: Referans sistemi ve kazançlar

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Cloud)
- **Auth**: JWT, bcryptjs
- **UI**: Lucide Icons, Responsive Design

## ⚙️ Kurulum

```bash
# Paketleri kur
npm install

# .env.local dosyası oluştur
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3001

# Projeyi başlat
npm run dev
```

## 📱 Sayfalar

- `/login` - Giriş
- `/register` - Kayıt
- `/dashboard` - Ana sayfa
- `/deposit` - Para yatırma
- `/withdraw` - Para çekme
- `/referral` - Arkadaş davet et

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt (referral code destekli)
- `POST /api/auth/login` - Giriş

### User
- `GET /api/user/profile` - Profil bilgileri (tüm veriler)

### VIP
- `POST /api/vip/purchase` - VIP paketi satın al (bakiye kontrolü ile)

### Tasks
- `POST /api/tasks/complete` - Görev tamamla (ana + çekilebilir bakiye ekler)
- `POST /api/tasks/reset` - Günlük görevleri sıfırla

### Deposit
- `POST /api/deposit/add` - Para yatır (referral komisyon otomatiği - TEST)
- `POST /api/deposit/request` - Para yatırma talebi oluştur (admin onayı gerekli)

### Withdraw
- `POST /api/withdraw/request` - Çekim talebi (görev & çekilebilir bakiye kontrolü)

### Admin (🆕)
- `POST /api/admin/auth/login` - Admin girişi
- `POST /api/admin/create-first-admin` - İlk admin oluştur
- `GET /api/admin/users` - Kullanıcı listesi & istatistikler
- `PATCH /api/admin/users` - Kullanıcı düzenle
- `GET /api/admin/wallets` - Cüzdan listesi
- `POST /api/admin/wallets` - Cüzdan ekle
- `PATCH /api/admin/wallets` - Cüzdan düzenle
- `DELETE /api/admin/wallets` - Cüzdan sil
- `GET /api/admin/deposits` - Para yatırma talepleri
- `PATCH /api/admin/deposits` - Para yatırma onayla/reddet (otomatik bakiye ekleme)
- `GET /api/admin/withdrawals` - Çekim talepleri
- `PATCH /api/admin/withdrawals` - Çekim onayla/reddet (tek tıkla red)

## 🧪 Test Senaryosu

### Adım 1: Kayıt Ol
```
Email: test@test.com
Şifre: 123456
```
- VIP: 0, Balance: 0, Withdrawable Balance: 0

### Adım 2: Bakiye Ekle (MongoDB Compass)
```json
{ "balance": 20 }
```

### Adım 3: VIP 1 Satın Al (12$)
- ✅ Balance: 8$ (20 - 12)
- ✅ VIP Level: 1
- ✅ Daily Tasks Limit: 1
- ✅ Daily Withdraw Limit: 3$

### Adım 4: Görev Tamamla
- Ana sayfada "Görevi Tamamla" (3$)
- ✅ Balance: 11$ (8 + 3)
- ✅ Withdrawable Balance: 3$ ⭐

### Adım 5: Para Çek
- Withdraw sayfası:
  - Mevcut Bakiye: 11$
  - Çekilebilir Bakiye: 3$ ⭐
- 3$ çekim yap ✅

### Adım 6: 24 Saat Sonra
- Görev sayacı sıfırlanır
- Yeni 3$ görev alabilir

## 📊 Kullanıcı Verileri

- ✅ İsim, Soyisim, Email
- ✅ Mevcut Bakiye
- ✅ Çekilebilir Bakiye ⭐
- ✅ VIP Seviyesi & Bitiş Tarihi
- ✅ Referans Kodu ve Sayısı
- ✅ Toplam Yatırım/Çekim/Kazanç
- ✅ Günlük Görev Hakkı
- ✅ Günlük Çekim Limiti
- ✅ İşlem Geçmişi
- ✅ Görev Geçmişi
- ✅ Davet Ettikleri

## 🌐 Deploy

### Vercel
```bash
vercel
```

### Environment Variables
Vercel'e şunları ekle:
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## 📝 Lisans

MIT License

---

Made with ❤️ by YessTyle Team

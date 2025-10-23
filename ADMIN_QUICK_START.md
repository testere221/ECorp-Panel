# 🚀 Admin Panel - Hızlı Başlangıç

## 1️⃣ İlk Admin Hesabını Oluştur

Tarayıcı konsolunu aç (F12) ve şunu çalıştır:

```javascript
fetch('http://localhost:3001/api/admin/create-first-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@yesstyle.com',
    password: 'admin123',
    name: 'Super Admin'
  })
})
.then(r => r.json())
.then(console.log)
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "message": "İlk admin başarıyla oluşturuldu!",
  "admin": {
    "id": "...",
    "email": "admin@yesstyle.com",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

---

## 2️⃣ Admin Panele Giriş Yap

1. **URL**: http://localhost:3001/admin/login
2. **Email**: admin@yesstyle.com
3. **Şifre**: admin123
4. Giriş Yap

---

## 3️⃣ İlk Cüzdanı Ekle

### Admin Panelde:
1. **"Cüzdanlar"** sekmesine git
2. **"Yeni Cüzdan Ekle"** butonuna tıkla
3. Formu doldur:

```
Cüzdan Adı: USDT (TRC20)
Kripto: USDT
Network: TRC20
Cüzdan Adresi: TYxkjhsdf8934hjksdhf8934hkjsdhf89
Min. Yatırım ($): 10
Sıra: 1
✅ Aktif (İşaretle)
```

4. **"Kaydet"** butonuna tıkla

### Test Et:
- http://localhost:3001/deposit sayfasına git
- Eklediğin cüzdan görünüyor mu? ✅

---

## 4️⃣ Test Kullanıcısı Oluştur

### Kullanıcı Kaydı:
1. http://localhost:3001/register
2. Email: test@test.com
3. Şifre: 123456
4. Kayıt Ol

### Admin Panelde Kontrol:
1. **"Kullanıcılar"** sekmesine git
2. test@test.com kullanıcısını bul
3. **"Düzenle"** butonuna tıkla
4. Ana Bakiye: **1000** yap
5. **"Kaydet"**

---

## 5️⃣ VIP Satın Alma Testi

### Kullanıcı Olarak:
1. Dashboard'a git
2. **"VIP"** sekmesine tıkla
3. **VIP 3** satın al (50$)

### Admin Panelde Kontrol:
1. **"Kullanıcılar"** sekmesine git
2. test@test.com bakiyesi: **950$** olmalı (1000 - 50)
3. VIP seviyesi: **VIP 3** olmalı

---

## 6️⃣ Görev Tamamlama Testi

### Kullanıcı Olarak:
1. Dashboard'da **"Görevi Tamamla"** (12$)
2. Başarılı mesajı görünmeli

### Admin Panelde Kontrol:
1. **"Kullanıcılar"** sekmesine git
2. test@test.com:
   - Ana Bakiye: **962$** (950 + 12)
   - Çekilebilir Bakiye: **12$**

---

## 7️⃣ Para Yatırma Talebi Testi

### Kullanıcı Olarak:
1. **Para Yatır** sayfasına git
2. Cüzdan adresini kopyala
3. **"Para Yatırdım, Onay İste"** butonuna tıkla
4. Miktar: **100** gir
5. TX Hash: **ABC123XYZ** gir
6. Tamam

### Admin Panelde:
1. **"Para Yatırma"** sekmesine git
2. Yeni talep görünmeli (Bekleyen)
3. **"Onayla"** butonuna tıkla
4. TX Hash: (opsiyonel, zaten var)
5. Tamam

### Sonuç Kontrol:
1. **"Kullanıcılar"** sekmesine git
2. test@test.com:
   - Ana Bakiye: **1062$** (962 + 100)

---

## 8️⃣ Para Çekme Talebi Testi

### Kullanıcı Olarak:
1. **Para Çek** sayfasına git
2. Miktar: **10**
3. Kripto: USDT
4. Network: TRC20
5. Cüzdan Adresi: TXxx...
6. **Çekim Talebi Oluştur**

### Admin Panelde:
1. **"Para Çekme"** sekmesine git
2. Yeni talep görünmeli (Bekleyen)
3. **"Reddet"** butonuna tıkla (direkt reddeder, neden sormaz!)
4. Bakiye otomatik iade edilir

**VEYA Onaylamak için:**
3. **"Onayla"** butonuna tıkla
4. TX Hash: TEST123456
5. Tamam

### Sonuç Kontrol (Onaylandıysa):
1. **"Kullanıcılar"** sekmesine git
2. test@test.com:
   - Ana Bakiye: **1052$** (1062 - 10)
   - Çekilebilir Bakiye: **2$** (12 - 10)

---

## 9️⃣ Referral Sistemi Testi

### 1. Referral Link Al:
1. test@test.com kullanıcısı olarak giriş yap
2. **"Takım"** veya **Referral** sayfasına git
3. Referral kodunu kopyala (örn: `ABC123`)

### 2. Yeni Kullanıcı Kaydet:
1. Çıkış yap
2. http://localhost:3001/register?ref=ABC123
3. Email: referred@test.com
4. Şifre: 123456
5. Kayıt Ol (referral kodu otomatik dolu gelecek)

### 3. Para Yatır (Test):
1. referred@test.com ile giriş yap
2. **Para Yatır** → Test Modu
3. Miktar: **100**
4. Para Ekle

### 4. Komisyon Kontrol:
#### Admin Panelde:
1. **"Kullanıcılar"** → test@test.com
2. Çekilebilir Bakiye: **7$** olmalı (2 + 5)
   - 2$ önceki bakiye
   - 5$ komisyon (%5 × 100)

---

## ✅ Başarılı Test Kontrol Listesi

- [ ] Admin hesabı oluşturuldu
- [ ] Admin panele giriş yapıldı
- [ ] Cüzdan eklendi
- [ ] Kullanıcı deposit sayfasında cüzdanı görüyor
- [ ] Kullanıcı bakiyesi düzenlendi
- [ ] VIP satın alındı
- [ ] Görev tamamlandı (ana + çekilebilir bakiye arttı)
- [ ] Para yatırma talebi oluşturuldu
- [ ] Admin yatırımı onayladı
- [ ] Kullanıcı bakiyesi otomatik arttı
- [ ] Para çekme talebi oluşturuldu
- [ ] Admin çekimi onayladı/reddetti (tek tıkla)
- [ ] Kullanıcı bakiyesi düştü (veya iade edildi)
- [ ] Referral sistemi çalıştı (VIP üye için)
- [ ] Komisyon eklendi

---

## 🎯 Önemli Notlar

### Bakiye Sistemi:
- **Ana Bakiye**: Görevler ve yatırımlar ekler
- **Çekilebilir Bakiye**: Görevler ve komisyonlar ekler (günlük limit: VIP'e göre)
- **Para Çekme**: Her iki bakiyeden de düşer

### VIP Günlük Limitler:
| VIP | Günlük Çekim | Günlük Görev |
|-----|--------------|--------------|
| 0   | 0$           | 0            |
| 1   | 3$           | 1            |
| 2   | 6$           | 2            |
| 3   | 12$          | 3            |
| 4   | 25$          | 4            |
| 5   | 62$          | 5            |
| 6   | 125$         | 6            |
| 7   | 250$         | 7            |

### Referral Komisyon:
- **Şart**: Davet eden VIP üye olmalı!
- **Oran**: %5
- **Ekleme**: Sadece çekilebilir bakiyeye

---

## 🆘 Sorun Giderme

### Admin panele giremiyorum?
```javascript
// MongoDB'de kontrol et:
db.admins.find()
```

### Cüzdanlar görünmüyor?
- Admin panelde cüzdan "Aktif" mi?
- `/api/admin/wallets` GET isteği atıp test et

### Çekim talebi düşmüyor?
- Kullanıcı bugün görev tamamladı mı?
- Çekilebilir bakiye yeterli mi?
- VIP üye mi?

---

**Tüm sistem hazır! Artık production'a geçebilirsiniz! 🚀**


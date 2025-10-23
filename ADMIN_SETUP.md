# YessTyle Admin Panel Kurulum Rehberi

## 📋 Admin Panel Özellikleri

### 1. **Kullanıcı Yönetimi** 👥
- Tüm kullanıcıları görüntüleme
- Email, şifre, VIP seviyesi, bakiye bilgilerini gösterme
- Kullanıcı bilgilerini düzenleme (bakiye, VIP, şifre)
- Arama ve filtreleme

### 2. **Cüzdan Yönetimi** 💳
- Kripto cüzdan adresleri ekleme
- Cüzdan düzenleme ve silme
- Aktif/Pasif durum kontrolü
- Minimum yatırım limiti belirleme
- Sıralama sistemi

### 3. **Para Çekme Talepleri** 💸
- Bekleyen, onaylanan, reddedilen talepleri görüntüleme
- Çekim taleplerini onaylama (TX Hash ekleyerek)
- Çekim taleplerini reddetme (bakiye iade ile)
- Anlık istatistikler

---

## 🚀 İlk Kurulum

### Adım 1: İlk Admin Hesabını Oluştur

Tarayıcı konsolunda (F12) veya Postman ile:

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

### Adım 2: Admin Paneline Giriş

1. http://localhost:3001/admin/login adresine git
2. Email: `admin@yesstyle.com`
3. Şifre: `admin123`
4. "Giriş Yap" butonuna tıkla

---

## 💡 Kullanım Örnekleri

### Yeni Cüzdan Ekle

1. Admin panelde "Cüzdanlar" sekmesine git
2. "Yeni Cüzdan Ekle" butonuna tıkla
3. Formu doldur:
   - **Cüzdan Adı**: USDT (TRC20)
   - **Kripto**: USDT
   - **Network**: TRC20
   - **Cüzdan Adresi**: TXxx...
   - **Min. Yatırım**: 10
   - **Aktif**: ✅ İşaretle
4. "Kaydet" butonuna tıkla

**Sonuç**: Kullanıcılar "Para Yatır" sayfasında bu cüzdanı otomatik görecek!

### Çekim Talebini Onayla

1. Admin panelde "Para Çekme" sekmesine git
2. "Bekleyen" filtresi seçili olacak
3. İlgili talebin "Onayla" butonuna tıkla
4. TX Hash (işlem kodu) gir (opsiyonel)
5. Tamam de

**Sonuç**: Kullanıcının çekimi "Tamamlandı" olarak işaretlenir!

### Çekim Talebini Reddet

1. "Reddet" butonuna tıkla
2. Red nedenini yaz (örn: "Yanlış cüzdan adresi")
3. Tamam de

**Sonuç**: Kullanıcının bakiyesi iade edilir!

### Kullanıcı Bilgilerini Düzenle

1. "Kullanıcılar" sekmesine git
2. İlgili kullanıcının "Düzenle" butonuna tıkla
3. Bakiye, VIP seviyesi veya şifreyi değiştir
4. "Kaydet" butonuna tıkla

---

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ**: Admin login sayfası herkese açıktır. Güçlü şifre kullanın!

### Güvenlik Önerileri:
1. Admin şifresini düzenli değiştirin
2. Güçlü şifre kullanın (min 12 karakter)
3. Admin email'i gizli tutun
4. Sadece güvenilir IP'lerden erişim sağlayın
5. Production'da admin sayfalarını ek güvenlik katmanıyla koruyun

---

## 📊 Sistem Akışı

### Para Yatırma Süreci:
1. Admin cüzdan ekler
2. Kullanıcı "Para Yatır" sayfasında cüzdanı görür
3. Kullanıcı kripto gönderir
4. (Manual) Admin bakiyeyi onaylar (veya otomatik sistem)

### Para Çekme Süreci:
1. Kullanıcı "Para Çek" sayfasından talep oluşturur
2. Talep admin paneline "Bekleyen" olarak düşer
3. Admin talebi inceler
4. Admin onaylar veya reddeder
5. Onaylandıysa: Kullanıcıya kripto gönderilir
6. Reddedildiyse: Bakiye iade edilir

---

## 🎯 Hızlı Test Senaryosu

### 1. Cüzdan Ekle
```
Cüzdan Adı: USDT (TRC20)
Kripto: USDT
Network: TRC20
Adres: TYxkjhsdf8934hjksdhf8934hkjsdhf89
Min. Yatırım: 10
Aktif: ✅
```

### 2. Kullanıcı Bakiyesi Düzenle
- test@test.com kullanıcısını bul
- Ana Bakiye: 1000
- Çekilebilir Bakiye: 50
- VIP Seviye: 3
- Kaydet

### 3. Çekim Talebini İşle
- VIP 1 kullanıcı 3$ çekim talebi oluşturur
- Admin panelde görünür
- Onayla → TX Hash: "TEST123456"
- Kullanıcının bakiyesi düşer

---

## ❓ Sık Sorulan Sorular

**S: Admin şifremi unuttum, ne yapabilirim?**
C: MongoDB'de Admin koleksiyonundan şifrenizi düzenleyebilirsiniz (plain text).

**S: Cüzdan ekledim ama kullanıcılar görmüyor?**
C: Cüzdanın "Aktif" olduğundan emin olun.

**S: Çekim talebini yanlışlıkla onayladım!**
C: MongoDB'de Transaction koleksiyonundan status'ü "pending" yapın ve kullanıcı bakiyesini manuel düzeltin.

**S: Kullanıcı VIP satın alamıyor?**
C: Kullanıcının bakiyesinin yeterli olduğundan emin olun. VIP fiyatları:
- VIP 1: $12
- VIP 2: $25
- VIP 3: $50
- VIP 4: $100
- VIP 5: $250
- VIP 6: $500
- VIP 7: $1000

---

## 🔧 Gelişmiş Özellikler (İsteğe Bağlı)

### Otomatik Çekim Onaylama
Gelecekte eklenebilir: Belirli limitlerin altındaki çekimleri otomatik onayla.

### Email Bildirimleri
Çekim onaylandığında kullanıcıya email gönder.

### 2FA (Two-Factor Authentication)
Admin girişi için 2 faktörlü doğrulama.

### Gelişmiş İstatistikler
Günlük/Haftalık/Aylık raporlar.

---

## 📞 Destek

Sorun yaşarsanız:
1. Tarayıcı konsolunu kontrol edin (F12)
2. Sunucu loglarını inceleyin
3. MongoDB bağlantısını test edin
4. `.env.local` dosyasını doğrulayın

**İyi yönetimler! 🚀**


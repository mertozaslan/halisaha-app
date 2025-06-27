# Hızlı Kurulum Rehberi ⚡

## 🚀 5 Dakikada Kurulum

### 1. Google Sheets Oluştur
```
1. drive.google.com → Yeni → Google Sheets
2. 3 sekme oluştur: "Oyuncular", "Degerlendirmeler", "HaftaninOyuncusu"
3. Paylaş → Anyone with the link → Viewer
4. URL'den SHEETS_ID'yi kopyala
```

### 2. API Key Al
```
1. console.cloud.google.com
2. Yeni Proje → APIs & Services → Library
3. "Google Sheets API" ara → Enable
4. Credentials → Create Credentials → API Key
5. API Key'i kopyala
```

### 3. Google Apps Script Kur (PAYLAŞIM İÇİN GEREKLİ!)
```
1. script.google.com → Yeni Proje
2. google-apps-script.js içeriğini kopyala-yapıştır
3. YOUR_SHEET_ID'yi kendi Sheets ID'nizle değiştir
4. Deploy → New deployment → Type: Web app
5. Execute as: Me, Access: Anyone
6. Deploy → Web app URL'ini kopyala
```

### 4. Konfigürasyon
`app.js` dosyasının 6-8. satırlarını düzenle:
```javascript
this.SHEET_ID = 'BURAYA_SHEETS_ID';
this.API_KEY = 'BURAYA_API_KEY';
this.WEB_APP_URL = 'BURAYA_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

### 5. GitHub Pages Yayınla
```bash
git init
git add .
git commit -m "Halısaha uygulaması"
git branch -M main
git remote add origin https://github.com/USERNAME/halisaha-app.git
git push -u origin main
```

Repository Settings → Pages → Source: main branch → Save

### 6. Hazır! 🎉
Uygulamanız şu adreste: `https://USERNAME.github.io/halisaha-app/`

**Artık herkes aynı verileri görür ve güncelleyebilir!**

---

## ⚠️ ÖNEMLİ: Google Apps Script Adımları

### Apps Script Kurulumu:
1. **script.google.com** → "Yeni proje"
2. `google-apps-script.js` dosyasındaki kodu kopyala
3. **YOUR_SHEET_ID** kısmını gerçek Sheets ID'nizle değiştirin
4. **Kaydet** (Ctrl+S)

### Web App Deploy:
1. **Deploy** → **New deployment**
2. **Type**: Web app
3. **Execute as**: Me (your email)
4. **Who has access**: Anyone
5. **Deploy** butonuna bas
6. **Web app URL**'ini kopyala (https://script.google.com/macros/s/... ile başlar)

### Test Et:
- Uygulamada oyuncu ekle
- Başka tarayıcıda/telefonda aç → oyuncu görünmeli!

---

## 📋 Sheets Başlıkları (Kopyala-Yapıştır)

### Oyuncular sekmesi:
```
İsim	Pozisyon	Toplam Puan	Değerlendirme Sayısı	Ortalama	Son Değerlendirme	Aktif
```

### Degerlendirmeler sekmesi:
```
Oyuncu ID	Oyuncu Adı	Pas	Savunma	Hücum	Kondisyon	Takım Oyunu	Yorum	Tarih
```

### HaftaninOyuncusu sekmesi:
```
Oyuncu ID	Oyuncu Adı	Hafta	Tarih	Ortalama Puan
```

---

## 🛠️ Yerel Test
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

**Not**: Google Sheets API sadece HTTPS'de çalışır. Yerel test için localStorage kullanılır. 
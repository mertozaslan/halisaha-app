# Halısaha Oyuncu Değerlendirme Sistemi ⚽

Modern, responsive halısaha takımı için oyuncu performans değerlendirme uygulaması. Google Sheets entegrasyonu ile güçlü veri yönetimi ve **gerçek zamanlı paylaşım**.

## 🚀 Özellikler

- **Oyuncu Yönetimi**: Oyuncu ekleme, pozisyon belirleme
- **Detaylı Değerlendirme**: 5 farklı kategoride (Pas, Savunma, Hücum, Kondisyon, Takım Oyunu) 1-10 arası puanlama
- **Yorum Sistemi**: Her değerlendirme için kişiselleştirilmiş yorumlar
- **Haftanın Oyuncusu**: Performansa dayalı haftalık seçim sistemi
- **Geçmiş Takibi**: Oyuncu bazında tüm değerlendirme geçmişi
- **İstatistikler**: Takım geneli performans metrikleri
- **🔥 GERÇEK ZAMANLI PAYLAŞIM**: Herkes aynı verileri görür ve güncelleyebilir
- **Google Sheets Entegrasyonu**: Verileriniz güvenli şekilde bulutta saklanır
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

## ⚡ Gerçek Zamanlı Paylaşım

**Artık takım arkadaşların da:**
- Senin eklediğin oyuncuları görebilir
- Oyuncu puanlaması yapabilir
- Haftanın oyuncusunu seçebilir
- Aynı veritabanını paylaşır

**Nasıl Çalışır?**
- Google Apps Script Web App kullanır
- Tüm veriler Google Sheets'e yazılır
- Herkes aynı URL'den erişir
- Anında senkronize olur

## 🎯 Demo Veriler

Uygulama örnek oyuncularla geliyor:
- **Ahmet** (Forvet) - 7.0/10 ortalama
- **Mehmet** (Defans) - 7.6/10 ortalama  
- **Can** (Orta Saha) - 7.5/10 ortalama

## 📊 Google Sheets + Apps Script Kurulumu

### 1. Google Sheets Hazırlama

Yeni bir Google Sheets dosyası oluşturun ve şu 3 sekmeyi ekleyin:

#### **Sekme 1: "Oyuncular"**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| İsim | Pozisyon | Toplam Puan | Değerlendirme Sayısı | Ortalama | Son Değerlendirme | Aktif |

#### **Sekme 2: "Degerlendirmeler"**
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Oyuncu ID | Oyuncu Adı | Pas | Savunma | Hücum | Kondisyon | Takım Oyunu | Yorum | Tarih |

#### **Sekme 3: "HaftaninOyuncusu"**
| A | B | C | D | E |
|---|---|---|---|---|
| Oyuncu ID | Oyuncu Adı | Hafta | Tarih | Ortalama Puan |

### 2. Google Apps Script Kurulumu (PAYLAŞIM İÇİN)

1. **script.google.com** → "Yeni proje"
2. `google-apps-script.js` dosyasındaki kodu kopyalayın
3. **YOUR_SHEET_ID** kısmını gerçek Sheets ID'nizle değiştirin
4. **Kaydet** (Ctrl+S)

### 3. Web App Deploy

1. **Deploy** → **New deployment**
2. **Type**: Web app
3. **Execute as**: Me (your email)
4. **Who has access**: Anyone
5. **Deploy** butonuna basın
6. **Web app URL**'ini kopyalayın

### 4. Google Sheets API Aktifleştirme

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services > Library** bölümüne gidin
4. "Google Sheets API"yi arayın ve aktifleştirin
5. **APIs & Services > Credentials** bölümüne gidin
6. **Create Credentials > API Key** seçin
7. API Key'inizi kopyalayın

### 5. Sheets Paylaşım Ayarları

1. Google Sheets dosyanızı açın
2. **Share** butonuna tıklayın
3. **Anyone with the link** olarak ayarlayın
4. **Viewer** yetkisi verin
5. Sheets URL'inden ID'yi kopyalayın:
   ```
   https://docs.google.com/spreadsheets/d/[SHEETS_ID]/edit
   ```

### 6. Uygulama Konfigürasyonu

`app.js` dosyasında bu değerleri güncelleyin:

```javascript
this.SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Kendi Sheets ID'nizi yazın
this.API_KEY = 'YOUR_GOOGLE_API_KEY';   // Kendi API Key'inizi yazın
this.WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'; // Apps Script URL'ini yazın
```

## 🛠️ Kurulum ve Çalıştırma

### GitHub Pages ile Yayınlama

1. **Repository Oluşturma**:
   ```bash
   git init
   git add .
   git commit -m "İlk commit: Halısaha uygulaması"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADI/halisaha-app.git
   git push -u origin main
   ```

2. **GitHub Pages Aktifleştirme**:
   - Repository settings'e gidin
   - **Pages** bölümünü bulun
   - **Source**: Deploy from a branch
   - **Branch**: main / (root)
   - **Save**'e tıklayın

3. **Uygulamaya Erişim**:
   ```
   https://KULLANICI_ADI.github.io/halisaha-app/
   ```

### Yerel Geliştirme

```bash
# Basit HTTP server çalıştırın
python -m http.server 8000
# veya
npx serve .

# Tarayıcıda açın: http://localhost:8000
```

## 📱 Kullanım Kılavuzu

### Oyuncu Ekleme
1. **"Oyuncu Ekle"** butonuna tıklayın
2. Oyuncu adı ve pozisyonunu girin
3. **"Ekle"** butonuna basın
4. **Artık herkes bu oyuncuyu görebilir!**

### Oyuncu Değerlendirme
1. Oyuncu kartından **"Değerlendir"** butonuna tıklayın
2. 5 kategoride 1-10 arası puan verin:
   - **Pas Kalitesi**: Pas doğruluğu ve kararlı oyun
   - **Savunma**: Defansif katkı ve pozisyon alma
   - **Hücum**: Gol katkısı ve son vuruş
   - **Kondisyon**: Dayanıklılık ve tempo
   - **Takım Oyunu**: İşbirliği ve disiplin
3. Yorumunuzu yazın (opsiyonel)
4. **"Değerlendirmeyi Kaydet"** butonuna basın
5. **Herkes bu puanı görebilir!**

### Haftanın Oyuncusu Seçimi
1. **"Haftanın Oyuncusu"** bölümünden **"Seç"** butonuna tıklayın
2. En yüksek ortalamaya sahip oyuncular listelenir
3. Seçmek istediğiniz oyuncunun **"Seç"** butonuna basın

### Geçmiş İnceleme
1. Oyuncu kartından **"Geçmiş"** butonuna tıklayın
2. Tüm değerlendirme geçmişini görüntüleyin
3. Tarih, puanlar ve yorumları inceleyin

## 🔧 Teknik Detaylar

### Teknoloji Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Icons**: Font Awesome 6
- **API**: Google Sheets API v4 + Google Apps Script
- **Storage**: Google Sheets (gerçek zamanlı)
- **Hosting**: GitHub Pages

### Veri Yapısı

```javascript
// Oyuncu Objesi
{
  id: 1,
  name: "Ahmet",
  position: "Forvet",
  totalRating: 42,
  evaluationCount: 6,
  averageRating: 7.0,
  lastEvaluationDate: "2024-01-15",
  isActive: true
}

// Değerlendirme Objesi
{
  id: 1,
  playerId: 1,
  playerName: "Ahmet",
  passing: 8,
  defense: 6,
  attack: 9,
  stamina: 7,
  teamwork: 8,
  comment: "Bugün çok iyi oynadı!",
  date: "2024-01-15"
}
```

### Responsive Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🎨 Özelleştirme

### Renk Teması Değiştirme

`styles.css` dosyasında CSS variables'ı güncelleyin:

```css
:root {
    --primary-color: #00b894;    /* Ana renk */
    --secondary-color: #0984e3;  /* İkincil renk */
    --success-color: #00cec9;    /* Başarı rengi */
    --gold-color: #f39c12;       /* Altın renk */
}
```

### Değerlendirme Kategorileri

`index.html` dosyasında kategorileri değiştirebilirsiniz:

```html
<div class="category">
    <label>Yeni Kategori</label>
    <div class="rating-input">
        <input type="range" name="newCategory" min="1" max="10" value="5" class="rating-slider">
        <span class="rating-value">5</span>
    </div>
</div>
```

## 🔐 Güvenlik Notları

- API Key'iniz public olarak görünür olacaktır
- Google Apps Script "Anyone" erişimi gerektirir
- Sadece güvendiğiniz kişilerle URL'yi paylaşın
- Önemli veriler için ek güvenlik önlemleri alın

## 🚨 Sorun Giderme

### Paylaşım Çalışmıyor
- Google Apps Script Web App deploy edildi mi?
- WEB_APP_URL doğru mu?
- "Anyone" erişimi verildi mi?
- Sheets ID doğru mu?

### API Bağlantı Hatası
- Google Sheets API aktif mi kontrol edin
- API Key doğru mu kontrol edin
- Sheets ID'si doğru mu kontrol edin
- Internet bağlantınızı kontrol edin

### Sheets Erişim Hatası
- Sheets "Anyone with link" olarak paylaşıldı mı?
- Doğru URL kullanıyor musunuz?
- Sekme isimleri doğru mu?

### Mobil Görüntü Sorunları
- Viewport meta tag ekli mi?
- CSS Media queries aktif mi?
- Touch events çalışıyor mu?

## 📈 Gelecek Özellikler

- [ ] Oyuncu fotoğrafları
- [ ] Maç bazlı değerlendirmeler  
- [ ] Grafik ve chart'lar
- [ ] Export/Import functionality
- [ ] Real-time notifications
- [ ] Team formation builder
- [ ] Performance analytics
- [ ] Social sharing

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Proje Link: [https://github.com/KULLANICI_ADI/halisaha-app](https://github.com/KULLANICI_ADI/halisaha-app)

---

⚽ **İyi Oyunlar!** Takımınızın performansını takip etmenin en modern yolu. 

🔥 **Artık herkes aynı verileri görür ve güncelleyebilir!** 
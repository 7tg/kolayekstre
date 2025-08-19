# KolayEkstre - Kolay Banka Ekstresi Ayrıştırıcısı

**KolayEkstre** Türk banka ekstrelerinizi tarayıcınızda yerel olarak ayrıştırmanıza, analiz etmenize ve görselleştirmenize olanak tanıyan gizlilik odaklı bir web uygulamasıdır. Mali verileriniz cihazınızı asla terk etmez.

## 🚀 Özellikler

### 🏦 Çoklu Banka Desteği
- **Ziraat Bankası** - Ziraat Bankası Excel ekstreleri için tam destek
- **Enpara.com** - Enpara.com banka ekstreleri için komple destek
- **Otomatik Algılama** - Dosya yapısından banka türünü otomatik algılar
- **Genişletilebilir** - Ek Türk bankaları için destek ekleme kolaylığı

### 📊 Veri Analizi ve Görselleştirme
- **İnteraktif Grafikler** - Chart.js ile aylık gelir/gider trendleri
- **İstatistik Paneli** - Kapsamlı mali özetler
- **İşlem Tablosu** - Sıralanabilir ve filtrelenebilir işlem listeleri
- **Tarih Aralığı Filtreleme** - Belirli zaman dilimlerini analiz etme

### 🔒 Gizlilik ve Güvenlik
- **%100 Yerel İşleme** - Tüm veri işleme tarayıcınızda gerçekleşir
- **Sunucu İletişimi Yok** - Mali verileriniz cihazınızı asla terk etmez
- **IndexedDB Depolama** - Yinelenen algılama ile güvenli yerel depolama
- **IBAN Doğrulama** - Veri bütünlüğü ve doğru hesap tanımlaması sağlar

### 🌍 Çok Dil Desteği
- **Türkçe** - Ana dil desteği
- **İngilizce** - Tam İngilizce çevirisi
- **Otomatik Dil Algılama** - Tarayıcı dil tercihlerini algılar

### 🎨 Modern Kullanıcı Deneyimi
- **Karanlık/Aydınlık Tema** - Manuel geçiş ile otomatik sistem teması algılama
- **Duyarlı Tasarım** - Masaüstü, tablet ve mobil cihazlarda çalışır
- **Material-UI Bileşenleri** - Modern ve erişilebilir kullanıcı arayüzü
- **Adım Adım Sihirbaz** - Kullanım kolaylığı için rehberli içe aktarma süreci

## 🛠️ Teknik Yığın

- **Ön Uç**: React 19 + TypeScript
- **Derleme Aracı**: Vite
- **UI Kütüphanesi**: Material-UI (MUI) v7
- **Grafikler**: MUI X-Charts
- **Dosya İşleme**: SheetJS (xlsx)
- **Çok Dil Desteği**: i18next + react-i18next
- **Depolama**: Yerel veri kalıcılığı için IndexedDB
- **Test**: Kapsamlı test kapsamı ile Vitest
- **Kod Kalitesi**: ESLint + TypeScript katı mod

## 📦 Kurulum ve Geliştirme

### Ön Koşullar
- Node.js 18+ 
- npm veya yarn

### Kurulum
```bash
# Depoyu klonlayın
git clone https://github.com/username/kolayekstre.git
cd kolayekstre

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Testleri çalıştırın
npm test

# Üretim için derleyin
npm run build
```

### Kullanılabilir Komutlar
- `npm run dev` - Geliştirme sunucusunu başlat
- `npm run build` - Üretim için derle
- `npm run preview` - Üretim derlemesini önizle
- `npm run lint` - ESLint çalıştır
- `npm run typecheck` - TypeScript derleyici kontrollerini çalıştır
- `npm test` - Testleri izleme modunda çalıştır
- `npm run test:run` - Testleri bir kez çalıştır

## 🏗️ Mimari

### Ayrıştırıcı Sistemi
Uygulama modüler bir ayrıştırıcı mimarisi kullanır:

```
src/parsers/
├── BaseParser.ts          # Tüm ayrıştırıcılar için soyut temel sınıf
├── BankStatementParser.ts # Ana ayrıştırıcı orkestratörü
└── banks/
    ├── ZiraatParser.ts    # Ziraat Bankası özel uygulaması
    └── EnparaParser.ts    # Enpara.com özel uygulaması
```

### Anahtar Bileşenler
- **UploadWizard** - 3 adımlı rehberli içe aktarma süreci
- **TransactionTable** - Sıralama/filtreleme ile veri ızgarası
- **TransactionChart** - Aylık trend görselleştirmesi
- **StatsPanel** - Mali özet panosu
- **ThemeContext** - Karanlık/aydınlık tema yönetimi

## 🧪 Test

Proje yüksek test kapsamı sürdürür:
- **85+ Birim Test** tüm ayrıştırıcılar ve yardımcı programları kapsar
- **Bileşen Testleri** UI işlevselliği için
- **Gerçek Dosya Testi** gerçek banka ekstresi örneklerini kullanır
- **TypeScript Entegrasyonu** tip güvenliği için

Testleri çalıştır: `npm test`

## 📁 Desteklenen Dosya Formatları

- **Excel Dosyaları**: `.xlsx`, `.xls`
- **Banka Formatları**: 
  - Ziraat Bankası Excel dışa aktarımları
  - Enpara.com hesap hareketi raporları

## 🔧 Yapılandırma

### Yeni Banka Ekleme
1. `BaseParser`'ı genişleten yeni bir ayrıştırıcı sınıfı oluşturun
2. Bankanızın formatı için gerekli yöntemleri uygulayın
3. Ayrıştırıcıyı `BankStatementParser.ts`'de kaydedin
4. Çeviriler ve UI bileşenleri ekleyin

### Ortam Değişkenleri
Uygulama tamamen istemci tarafında çalışır ve arka uç yapılandırması gerekmez.

## 🤝 Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Lütfen:
1. Depoyu fork edin
2. Bir özellik dalı oluşturun
3. Yeni işlevsellik için testler ekleyin
4. Tüm testlerin geçtiğinden emin olun
5. Bir pull request gönderin

## 🐛 Sorun Giderme

### Yaygın Sorunlar
- **Dosya ayrıştırılmıyor**: Dosyanın desteklenen formatta gerçek bir banka ekstresi olduğundan emin olun
- **Çeviriler eksik**: Tarayıcı dilinizin desteklendiğini kontrol edin
- **Performans sorunları**: Yavaşlama yaşıyorsanız tarayıcı verilerini/önbelleği temizleyin

### Yardım Alma
- Mevcut GitHub sorunlarını kontrol edin
- Dosya formatı örnekleri ile yeni sorun oluşturun (hassas verileri kaldırın)

## 📄 Lisans

Bu proje **Ticari Olmayan Lisans** ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

**Anahtar Noktalar:**
- ✅ Kişisel, eğitim ve açık kaynak kullanım için ücretsiz
- ❌ Ticari kullanım açık izin gerektirir
- ✅ Ticari olmayan amaçlar için değiştirme ve dağıtıma izin verilir
- ❌ Garanti sağlanmaz

## 🙏 Teşekkürler

- Format spesifikasyonları için Türk bankacılık topluluğu
- Mükemmel React bileşenleri için Material-UI ekibi
- Sağlam Excel dosya işleme için SheetJS ekibi
- Olağanüstü geliştirme araçları için React ve Vite toplulukları

---

**Türk bankacılık topluluğu için ❤️ ile yapıldı**
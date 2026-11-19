# Canlı ülke ve park bağlantısı denetimi

- 19 ülke, 2.495 yayımlanmış destinasyon. 4.990 İngilizce/Almanca hedef tarandı: 2.495 İngilizce ve 2.207 Almanca hedef 200; Kanada/Birleşik Krallık için 288 yayımlanmamış Almanca hedef 404. Bu 288 hedefin yayımlanmış çeviri olduğu ileri sürülmedi.
- 19 ülke dizini İngilizce/Almanca, telefon/bilgisayarda açıldı (76 ziyaret). Sonraki destinasyona geçiş kontrol edildi; CA/GB Almanca harita bağlantıları hatalıydı.
- Gerçek hata düzeltildi: Almanca ülke haritası yalnız yayımlanmış çevirileri gösterir; çevirisi olmayan ülke İngilizce dizinine yönlenir. Önizlemede CA/GB 302 doğru hedefe; 26 test geçti. Yayın istendi; ilk canlı kontrol henüz eski sayfaları gösterdi. Bu düzeltmenin canlı sonucu bekliyor.
- Norveç canlı: ülke sayfası 200, 140 destinasyon, 16 bölge; eski otorite adresi 301 Norveç dizinine. 280 Norveç EN/DE destinasyon hedefi 200.
- Norveç haritası açık/koyu görünümde ve telefon/bilgisayarda görüldü; Jotunheimen araması ve park sayfasına geçiş iki dilde dört kez doğrulandı. Norveç için yeni içerik üretimi gerekmedi; önceki 404 yayının yayılma gecikmesiydi.
- Yeni destinasyon veya çeviri üretilmedi. Eski tarihî park adreslerinin arşivden kurtarılması ayrı dış kaynak engeli olarak sürüyor.

## Aynı kuralın diğer yolları

- Okunan yollar: LocalLink/localPath (paylaşılan kartlar ve menüler), LanguageSwitcher, EN/DE ülke ve bölge sayfaları, EN/DE destinasyon sayfaları, ülke haritasının liste ve pin bağlantıları, çeviri liste/tekil okuma işlevleri, sitemap üreticisi, Nordic/FR-PT-GR yayın betiklerinin çeviri ve coğrafya yazımları.
- Ülke haritası düzeltmesine ek olarak EN ülke/bölge sayfalarının dil seçenekleri artık yayımlanmış çeviri varlığına bağlıdır. Almanca bölge veya park çevirisi yoksa gerçek İngilizce sayfaya geçilir; bilinmeyen destinasyonlar 404 kalır. Paylaşılan LocalLink'in otomatik Almanca adres üretimi bu hedef geri dönüşü sayesinde kırık sayfa yerine gerçek içerikle sonuçlanır.
- Almanca sitemap ülke/bölge adreslerini yalnız yayımlanmış çevirilerden türetir. Kanada çocuğu önizlemede boş, olmayan Almanca bölgeler listelenmiyor. Destinasyon dil seçenekleri zaten tekil yayımlanmış çeviri sorgusunu kullanıyordu; yayın betikleri çeviri durumunu ve coğrafyayı kaydediyor, değişiklik gerekmedi. Veritabanı kayıtları, izinler ve ayarlar değiştirilmedi.
- 11 ilgili test geçti; önizlemede ülke, bölge, park geri dönüşleri ve boş Kanada Almanca sitemap doğrulandı. Bu ek düzeltmeler için yayın istendi; canlı yayının son sürüm doğrulaması bekliyor.
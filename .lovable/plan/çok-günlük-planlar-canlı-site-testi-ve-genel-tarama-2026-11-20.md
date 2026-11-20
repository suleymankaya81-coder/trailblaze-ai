# Çok günlük planlar, canlı site testi ve genel tarama

Bugünkü durum: yayındaki 3.231 yerin 1.093'ünde çok günlük plan var; 2.138 yerde tek günlük plan var.

## 1. Her yere 2–3 günlük plan
- Kaynaklarda yeterince gezilecek nokta olan yerler: mevcut yöntemle (yalnızca kaynakta adı geçen noktalarla) 2–3 güne çıkarılacak.
- Kaynakta tek nokta olan yerler: 2. ve 3. gün, aynı ülkedeki **yayında ve konumu doğrulanmış en yakın parklardan** (yaklaşık 150 km içinde) oluşturulacak. Her gün o parkın kendi sayfasına bağlanacak. Uydurma yer eklenmeyecek.
- Yakınında uygun park olmayan yerler (adalar, uzak bölgeler) tek gün kalacak ve listede gösterilecek.
- Günlük harita çizgileri, Google Maps bağlantıları ve Almanca metinler güncellenecek.
- Yapay zekâ kullanılmayacak, kredi harcanmayacak.

## 2. wildparkroutes.com canlı test
- Koyu temada ana sayfa, ülke sayfası ve park sayfası; telefon ve bilgisayar ekranı.
- Her ülke haritasında parka tıklayınca doğru park sayfasına geçiş (EN ve DE).
- Okunmayan yazı, kaybolan harita gibi sorunlar düzeltilecek.

## 3. Park bağlantıları (EN + DE)
- Site haritasındaki ve ülke sayfalarındaki her park bağlantısı açılacak.
- 404 veren, yanlış sayfaya giden ya da Almancası olmadığı halde listelenen bağlantılar düzeltilecek.

## 4. Genel tarama ve site haritası
- Tüm site haritası dosyalarındaki adresler: doğru alan adı (wildparkroutes.com), doğru ülke/bölge/park yazımı, yönlendirme veya 404 olmaması, EN/DE dil eşleşmeleri.
- Sayfa başlıkları, eksik açıklamalar, kırık iç bağlantılar ve konsol hataları.
- Bulunan sorunlar düzeltilip kısa bir rapor hazırlanacak.

## Teknik ayrıntılar
- Yeni betik: yakındaki yayımlanmış yerlerden gün oluşturan tek seferlik üretim (`travel_plan` güncellemesi + `content_translations` Almanca günler + `routes.json`); mevcut `multiday-europe.py` sonuçları korunur.
- Canlı kontroller Playwright ile; sitemap taraması tüm `<loc>` adreslerini durum kodu ve hreflang açısından kontrol eder.
- Kural değişikliği AGENTS.md'ye eklenir; testler çalıştırılır.

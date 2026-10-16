# Pinterest kanalı: panolar, destinasyon pinleri ve otomatik RSS

## Hedef
Her yayınlanmış destinasyon ve rehber, kendine özel dikey bir pin görseliyle (fotoğraf + başlık yazısı) Pinterest'e otomatik gitsin ve tıklayan kişi doğru sayfaya gelsin.

## 1. Panolar (sizin yapacağınız, 5 dakika)
Pinterest'te şu 4 panoyu açın (açıklamaları hazır vereceğim):
1. National Parks & Scenic Drives — park ve rota rehberleri
2. Campervan & RV Road Trips — karavan/kamp odaklı rehberler
3. Best Time to Visit — "ne zaman gidilir" rehberleri
4. Things to Do Outdoors — aktivite rehberleri

## 2. Pin görselleri (sitede otomatik)
- Her destinasyon ve rehber için 1000x1500 dikey pin görseli, site tarafından anında çizilir ve önbelleğe alınır (ek AI kredisi harcanmaz).
- Tasarım: destinasyonun lisanslı kapak fotoğrafı, üstte kısa başlık (ör. "Yellowstone Road Trip Guide"), altta alt başlık (en iyi sezon / süre) ve küçük "minialife.com" imzası. Sitenin renk ve yazı tipleriyle uyumlu.
- Fotoğraf kredisi pin açıklamasına yazılır (lisans gereği).
- Fotoğrafı olmayan sayfa pin listesine alınmaz.

## 3. Pin metinleri
- Başlık: ~100 karakter; açıklama: ~400–500 karakter, sayfanın mevcut başlık/açıklama/sezon bilgisinden otomatik derlenir (ek AI üretimi yok).
- Yalnızca yayınlanmış ve "noindex" olmayan sayfalar girer.

## 4. RSS beslemeleri
Pinterest her RSS'i tek panoya bağladığı için panoya özel 4 besleme:
- /rss/parks.xml, /rss/rv.xml, /rss/best-time.xml, /rss/things-to-do.xml
- Ayrıca genel /rss.xml (tüm yeni içerik).
- Her öğe: başlık, açıklama, sayfa linki, pin görseli, yayın tarihi. En yeni 200 öğe; Pinterest yeni eklenenleri günde birkaç kez çeker, böylece 2.000+ sayfa zamanla ve spam sayılmadan pinlenir.
- Pinterest'ten gelen tıklamalar analizde ayrı görünsün diye linklere utm_source=pinterest eklenir.

## 5. Sayfa hazırlıkları (Rich Pins)
- Destinasyon ve rehber sayfalarına og:image olarak pin görseli/kapak, article tipi ve yayın tarihi bilgisi; Pinterest bunları otomatik zengin pine çevirir.
- Sayfa başlığına RSS bağlantı etiketi eklenir.

## 6. Doğrulama
- Beslemelerin geçerli XML olduğu ve görsellerin açıldığı kontrol edilir; 3 örnek pin görselini size gösteririm.
- Bir test ile: noindex/yayınsız sayfa beslemeye girmez, görseli olmayan sayfa girmez.

## 7. Yayın ve bağlama (sizin adımınız)
1. Değişiklikleri yayına alırız (Pinterest doğrulama etiketi de böylece canlı olur → "Doğrula").
2. Pinterest > İçeriği içe aktar > RSS Akışını Bağla: her besleme adresini ilgili panoya bağlarsınız.

## Teknik ayrıntılar
- Pin görseli: `src/routes/api/pin/$kind.$slug.png.ts` sunucu rotası; workerd uyumlu SVG→PNG (satori + resvg-wasm) veya uyumsuzsa SVG tabanlı fallback; Cache-Control uzun süre.
- Beslemeler: `src/lib/seo/rss.server.ts`, sitemap gibi `src/server.ts` içinde yakalanır; veriler destinations + seo_landing_pages (published, noindex hariç), page_type → pano eşlemesi.
- Test: `src/lib/seo/rss.test.ts`. AGENTS.md'a kural: pinler/RSS ziyaret başına değil, mevcut veriden üretilir.

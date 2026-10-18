# Fly & Drive sayfaları (Programmatic SEO, Seçenek B)

## Hedef
"Bozeman'a uç, Yellowstone'a sür" gibi aramalara cevap veren, her destinasyon için tek bir "Fly & Drive" sayfası. Adres yapısı: `/fly-and-drive/bozeman-bzn-yellowstone`. Sayfanın amacı ziyaretçiyi dört işleme yönlendirmek: **uçuş, araç kiralama, valiz emaneti, ilk gece konaklama**.

Mevcut veri yeterli: yayındaki 440 destinasyonun hepsinde en yakın havalimanı ve sürüş süresi kayıtlı (233 farklı havalimanı). Yeni AI kredisi harcanmaz; metinler mevcut verilerden kurulur.

## Adım adım uygulama (her adımdan sonra durup size gösterilecek)

**Adım 1 — Şablon ve tasarım (yalnız 3 pilot sayfa: Yellowstone, Zion, Moab)**
Sayfa yapısı, yukarıdan aşağı:
1. Üst bölüm: destinasyon fotoğrafı, büyük başlık "Fly into BZN, drive to Yellowstone", altında 3 hızlı bilgi rozeti (sürüş süresi · mil · rezervasyon durumu).
2. Rota kartı: büyük havalimanı kodu → çizgi → park; küçük statik harita (mevcut ücretsiz harita sistemi).
3. "Your arrival plan" — 4 adımlı yatay akış (mobilde dikey), her adım tek tıklanabilir kart:
   - Uçuş (Aviasales, varsa "~$X'ten, tahmini")
   - Araç kiralama (EconomyBookings, havalimanı koduyla)
   - Valiz emaneti (Radical Storage)
   - İlk gece konaklama (mevcut konaklama ortakları; yalnız anlaşmalı/çalışan linkler)
4. "Before you land" — rezervasyon notu (destinasyona özel, zaten var) + en iyi sezon.
5. Kısa SSS (3 soru, veriden üretilir: kaç saat sürüş, hangi havalimanı en yakın, rezervasyon gerekir mi).
6. Ana destinasyon rehberine ve aynı havalimanını kullanan diğer parklara bağlantılar.
Tasarım: mevcut site renkleri ve yazı tipleri, bol boşluk, büyük tipografi, kartlarda "Partner link · Marka" etiketi.

**Adım 2 — Sizin onayınızdan sonra 440 sayfaya açma**
- Sayfa listesi ve sitemap'te yeni "fly-and-drive" alt haritası.
- İnce içerik kontrolü: sürüş süresi veya havalimanı adı eksik olan sayfa yayına çıkmaz.

**Adım 3 — Arama motoru**
- Her sayfaya kendi başlık/açıklama, canonical, yapılandırılmış veri (Trip + FAQ + Breadcrumb).
- Yayın sonrası Search Console'a sitemap yeniden gönderimi.

## Önceden yakalanan riskler ve önlemler
- **Adres çakışması:** mevcut tek seviyeli rehber sayfaları (`/yellowstone-itinerary` gibi) etkilenmez; yeni sayfalar ayrı `/fly-and-drive/...` altında.
- **Kopya içerik:** her sayfada destinasyona özel rezervasyon notu, gerçek sürüş süresi ve aynı havalimanından gidilen diğer parklar bulunur; sadece isim değişen şablon olmaz.
- **Yanlış adres:** adres veriden üretilir; yanlış/eski adres gelirse doğru adrese kalıcı yönlendirilir, yoksa 404.
- **Fiyat/stok uydurma yok:** fiyat yalnız önbellekte gerçek veri varsa "tahmini" etiketiyle; yoksa gizlenir.
- **Ortak kuralları:** Motorhome Republic/REI doğrudan link etiketiyle; Awin linkleri ortak modülden; Travelpayouts kendi kartlarımız + sayfa bazlı takip kodu.
- **Fotoğraf:** yalnız o destinasyonun kendi kredili fotoğrafı.

## Teknik detaylar
- Route: `src/routes/fly-and-drive.$slug.tsx` (statik önek, `$landing.tsx` ile çakışmaz). Slug = `{airport-city}-{iata}-{destination-slug}`; loader `destination-slug`'ı sondan çözer, kanonik slug'la eşleşmezse 301.
- Veri: yeni `getFlyDriveData` server function (`src/lib/data/flyDrive.functions.ts`), mevcut `destinations` alanları (nearest_airport_code/name, airport_lat/lng, drive_minutes/miles, permit_*, hero_image, photo_credit) + aynı havalimanını paylaşan destinasyonlar. Tablo değişikliği yok.
- Saf yardımcılar `src/lib/seo/flyDrive.ts`: slug üretimi/çözümü, SSS metni, JSON-LD; `flyDrive.test.ts` ile test (slug gidiş-dönüş, eksik veride null, fiyat yoksa fiyat alanı yok).
- Bileşenler `src/components/flydrive/*` (Hero, RouteCard, ArrivalPlan, BeforeYouLand, FlyDriveFaq, RelatedLinks); linkler `tpLink(brand, slug)` ile.
- Sitemap: `sitemap.server.ts`'e `/sitemaps/fly-and-drive.xml` (görsel etiketiyle); Adım 1'de pilotlar noindex, Adım 2'de açılır.
- Doğrulama: Playwright ile 3 pilot sayfa masaüstü + mobil ekran görüntüsü, link takibi ve JSON-LD kontrolü; `bunx vitest run src/lib/seo`.
- AGENTS.md: Fly & Drive sayfalarının mevcut verilerden, AI kredisi olmadan üretildiği kuralı.

# Görsel SEO — A seçeneği

Amaç: Google Görseller ve Google Lens'in destinasyon ve rehber fotoğraflarımızı doğru sayfa, doğru yer adı ve doğru fotoğraf kredisiyle tanıması. Sayfa görünümü değişmez; değişiklik arama motorlarına verilen bilgidedir.

## Yapılacaklar

1. **Destinasyon sayfalarında fotoğraf bilgisi (yapılandırılmış veri)**
   - Kapak fotoğrafı ve galeri fotoğrafları, yer adını içeren açıklama, fotoğrafçı adı, lisans ve Commons kaynak sayfasıyla birlikte tanımlanır.
   - Günlük plan durakları için fotoğraf **eklenmez**: duraklarda kayıtlı, doğrulanmış fotoğraf yok; yanlış manzarayı bir durağa bağlamak güveni bozar.
   - Kredisi veya lisansı çözümlenemeyen fotoğraf yapılandırılmış veriye girmez (sayfada görünmeye devam eder).

2. **Görsel site haritası**
   - Destinasyon site haritasındaki her sayfaya kapak + galeri fotoğrafları (en fazla 10) eklenir.
   - Rehber site haritalarına (best time, things to do, itinerary, glamping) her rehberin sayfada gösterilen kapak fotoğrafı eklenir; kapak yoksa destinasyonun kendi kapak fotoğrafı kullanılır (mevcut kuralla aynı), başka destinasyonun fotoğrafı asla kullanılmaz.
   - Yalnızca tam https adresli fotoğraflar listelenir.

3. **Doğrulama**
   - Otomatik testler, yayın öncesi kontrol ve 3 sayfada tarayıcıyla gözle kontrol (Yellowstone, Moab, bir rehber sayfası).
   - Değişiklikler canlı siteye bir sonraki yayında geçer; ardından Search Console'da site haritasını yeniden göndermen yeterli.

## Hata önleme tedbirleri

- Site haritası XML'ine görsel ad alanı eklenir; tüm adresler ve metinler XML'e uygun kaçışlanır (`&`, `<`, tırnak). Commons adreslerindeki `%2C` gibi kodlamalar bozulmaz.
- Göreli adresli (`/__l5e/...`) rehber kapakları `https://minialife.com` ile tam adrese çevrilir; boş veya `http://` adresler atlanır.
- Yinelenen fotoğraflar (kapak = galeri) bir kez listelenir; sayfa başına 1.000 görsel sınırının çok altında kalınır.
- Veri çekme hatasında mevcut davranış korunur (boş liste, 404 değil); görsel alanı eksik olan satır tüm haritayı bozmaz.
- Mevcut kurallar korunur: fiyat/stok/rezervasyon bilgisi uydurulmaz, TouristTrip yapısı ve durak sırası değişmez, `og:image` ayarları değişmez.
- Sitemap başına URL sayısı ve sorgu sayfalama (1.000 satır) aynı kalır; sayfa başına ek sorgu yapılmaz, her alt harita tek toplu sorguyla üretilir.

## Teknik detaylar

- `src/lib/seo/imageCredit.ts` (yeni, saf fonksiyonlar): `destinations.photo_credit` metnini (`Hero: … · Gallery: …` biçimi) ayrıştırır → `{ url, creator, license, sourceUrl }`; çözümlenemezse `null`. `toAbsoluteImageUrl()` göreli yolları minialife.com'a çevirir, https olmayanları reddeder.
- `src/lib/seo/destinationJsonLd.ts`: `TouristDestination.image` düz string yerine `ImageObject[]` (`contentUrl`, `name`, `caption`, `creator`{Person}, `creditText`, `license`, `acquireLicensePage`). Kredi yoksa yalnızca `contentUrl` + `caption`. `DestinationView`'a `photoCredit` alanı eklenir (`destinations.functions.ts` sorgusu zaten satırı okuyor; alan eşlenir).
- `src/lib/seo/sitemap.server.ts`: `Url` tipine `images?: {loc,title?}[]`; `urlset` `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` ekler ve `<image:image><image:loc>` üretir. Destinasyon sorgusu `slug,updated_at,hero_image,gallery`; rehber sorgusu `cover_image` + `destinations(hero_image)` gömülü seçim. `landingCoverAssets` eşlemesi önce kontrol edilir (sayfada gösterilen kapakla aynı olsun diye).
- Testler: `imageCredit.test.ts` (kredi ayrıştırma, göreli→mutlak, http reddi), `sitemap.test.ts` (XML kaçışlama, ad alanı, yinelenen görsel tekilleştirme, başka destinasyon fotoğrafı kullanılmaması), `destinationJsonLd.test.ts` güncellenir (ImageObject, kredisiz fotoğrafta creator olmaması; mevcut 3 test korunur).
- Doğrulama: `bunx vitest run src/lib/seo`, build log, Playwright ile `/sitemaps/destinations.xml` ve bir guide haritasının XML olarak ayrıştırılması + JSON-LD'nin `JSON.parse` ile okunması.
- `AGENTS.md`: "Görsel yapılandırılmış veri yalnız kredisi çözümlenen Commons fotoğraflarını tanımlar; durak fotoğrafı uydurulmaz" kuralı eklenir.

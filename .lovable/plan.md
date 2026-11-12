# Bölüm 2 — Alan adı altyapısı ve uluslararası adres yapısı

## Mevcut durum (kontrol edildi)
- `https://minialife.com` 49 dosyada sabit yazılı (sitemap, RSS, JSON-LD, yasal sayfalar, testler). "MiniaLife" adı 51 dosyada geçiyor.
- Yayındaki 500 destinasyonun hepsi ABD'de ve 51 eyalete dağılıyor. Veritabanında ülke alanı yok.
- Destinasyon adresleri: `/destinations/{slug}`, `/de/destinations/{slug}`; rehberler kök seviyede `/{slug}-glamping` gibi.

## Hedef adres yapısı
```text
/                                   ana sayfa
/destinations                       tüm ülkeler
/destinations/us                    ülke sayfası
/destinations/us/utah               eyalet/bölge sayfası (yeni, iç bağlantı merkezi)
/destinations/us/utah/zion          destinasyon sayfası
/destinations/us/utah/zion/glamping rehber sayfaları (best-time, things-to-do, itinerary, glamping)
/road-trips/us/{slug}               rotalar; aynı mantık fly-and-drive, rv-camping, no-reservation için
/de/...                             aynı yapı Almanca (dil önekiyle)
```
- Ülke kodu ISO (us, ca, …), slug'lar mevcut slug'larla aynı kalır.
- Kanada ve Avrupa parkları yalnızca veri ekleyerek açılır; yeni kod gerekmez.
- Dil (`/de`) ile ülke ayrı tutulur: Almanca bir ziyaretçi ABD parkını `/de/destinations/us/...` adresinde görür.

## Adımlar (parça parça)
1. **Merkezi site ayarı:** Alan adı, marka adı, iletişim e-postası, logo ve affiliate etiketleri tek bir ayar dosyasında toplanır. 49 dosya bu dosyayı kullanacak şekilde değiştirilir. Taşıma gününe kadar değer minialife.com kalır; taşıma günü tek satır değişir.
2. **Veritabanı alanları:** Destinasyonlara `country_code` (varsayılan 'us'), `region_slug` ve `currency` eklenir. Ülke ve bölge sayfaları için ayrı bir bölgeler tablosu açılır. Mevcut 500 kayıt eyalet bilgisinden doldurulur.
3. **Adres oluşturucu:** Tüm bağlantılar tek bir yardımcıdan üretilir: destinationPath, guidePath, regionPath. Kod içinde elle yazılmış adres kalmaz. Bu, LocalLink, breadcrumb, sitemap, hreflang ve JSON-LD için de geçerli.
4. **Yeni sayfalar:** Ülke dizini, ülke sayfası ve eyalet sayfası İngilizce ve Almanca hazırlanır. Destinasyon ve rehber sayfaları yeni iç içe adreslere taşınır.
5. **Eski adreslerden yönlendirme:** `/destinations/zion` → `/destinations/us/utah/zion`, `/zion-glamping` → `.../zion/glamping` şeklinde, Almanca dahil kalıcı (301) yönlendirmeler yapılır. Tek bir eşleme tablosundan üretildiği için zincir yönlendirme oluşmaz.
6. **Ülkeye göre partnerler:** Araç, RV ve kamp ortakları ülke uygunluğuna göre seçilir. Örneğin Kanada'da Cruise Canada, ABD'de RoverPass/Campspot. Fiyat gösterimi ülkenin para birimine uyar.
7. **SEO katmanı:** Sitemap ülke ve tür bazında bölünür (`/sitemaps/us-destinations.xml` gibi). Canonical, hreflang (en, de, x-default), BreadcrumbList (Ana sayfa › Destinasyonlar › ABD › Utah › Zion) ve Organization şeması yeni marka/alan adıyla üretilir.
8. **Taşıma günü (Bölüm 4 ile):** Wildparkroutes.com birincil yapılır. minialife.com'un aktif sayfaları yeni adreslere 301 ile yönlendirilir. Eski 95 bin adres kuralı yeni sitede kaldırılır, world-national-parks.net eşlemesi devreye alınır, Search Console'da adres değişikliği bildirilir.
9. **Kontrol:** Mevcut 222 test yeni adreslerle güncellenir. Yönlendirme, sitemap ve hreflang için yeni testler yazılır. Örnek sayfalar tarayıcıda kontrol edilir.

## Önerilen sıra
1 → 2 → 3, ardından görünür bir değişiklik olmadan yayına alınır. Sonra 4 + 5 birlikte yapılır, çünkü adresler ancak yönlendirmeler hazır olduğunda değişebilir. Ardından 6, 7, 8 ve 9.

## Teknik ayrıntılar
- `src/config/site.ts`: SITE_ORIGIN, BRAND, CONTACT_EMAIL, AFFILIATE_TAGS. Sunucu tarafı `process.env.SITE_ORIGIN` ile ezilebilir, istemcide sabit kalır.
- Migration: `destinations.country_code text not null default 'us'`, `region_slug text`, `currency text default 'USD'`. Yeni `regions` tablosu (country_code, slug, name, intro), herkese açık SELECT ve GRANT ile.
- `src/lib/routes/paths.ts` + test. Rotalar: `destinations.$country.index.tsx`, `destinations.$country.$region.index.tsx`, `destinations.$country.$region.$slug.tsx`, `destinations.$country.$region.$slug.$guide.tsx`; aynısı `de.` önekiyle. Geçersiz ülke/bölge/slug birleşimi 404 döner, yanlış bölge 301 ile doğrusuna gider.
- `$landing.tsx` ve eski `destinations.$slug.tsx`, `src/lib/seo/legacy.ts` üzerinden yönlendirmeye dönüşür. Content pipeline script'leri yeni adres yardımcısını kullanır. `pin_assets.link` ve `seo_landing_pages.path/canonical_url` toplu güncellenir.

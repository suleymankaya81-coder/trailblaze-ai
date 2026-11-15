# Birleşik Krallık: kaynak temelli üretim planı

## Amaç
150 maddelik UK listesini, Kanada'daki gibi "önce üret sonra düzelt" yerine **önce resmi kaynak, sonra yalnız o kaynaktan yazım** yöntemiyle, küçük gruplar halinde yayına almak. Her grup kendi kontrolünü geçmeden yayınlanmaz; sonradan toplu doğrulama gerekmez.

## Otorite domain'de UK nasıl kurulmuştu
- Arşivde tek bir ülke sayfası bulunuyor: `world-national-parks.net/eu/uk/uk.htm` (kıta / ülke / ülke sayfası yapısı).
- Ülke sayfası millî parkları listeleyen bir dizindi; tek tek park sayfaları arşivde görünmüyor (ilk adımda tam liste ve içerik kontrol edilecek).
- Bize uyarlama:
  - `/eu/uk/uk.htm` → `/destinations/gb` (ülke sayfası) 301.
  - Arşivde park bazlı adres çıkarsa → ilgili yeni park sayfasına 301; karşılığı yoksa ülke sayfasına.
  - Ülke sayfasında eski yapıya benzer şekilde **15 millî park önce**, ardından National Landscapes / National Scenic Areas / kıyı ve doğal alanlar.

## Liste temizliği (üretimden önce)
Dosyada düzeltilmesi gereken noktalar:
- Mükerrer: Wye Valley (İngiltere 25 ve Galler 98) → tek sayfa, iki bölgede bağlantı. Assynt-Coigach (61 ve 90), Loch Shiel (81 ve 84), Mourne (123/137) birleştirilecek veya birbirine bağlanacak.
- "Skomer" İngiltere'den çıkarılıp Galler'e alınacak.
- Numara çakışması (56 iki kez) düzeltilecek.
- Alt yerler (Quiraing, Old Man of Storr, Fairy Pools, Durdle Door, Lulworth Cove...) ayrı sayfa olarak kalabilir ama ana sayfaya (Isle of Skye, Jurassic Coast) bağlanacak; aynı fotoğraf kullanılamaz.
- North Coast 500 park değil, rota: destinasyon yerine "Road Trip" sayfası olarak işlenecek.
- Sonuç: tek temiz katalog (yer, bölge, tür, yetkili kurum, resmi kaynak, erişim türü).

## URL ve bölgeler
- Ülke kodu `gb`, bölgeler: `england`, `scotland`, `wales`, `northern-ireland`.
- Örnek: `/destinations/gb/scotland/glen-coe`, Almanca `/de/destinations/gb/scotland/glen-coe`.
- Bölge sayfası, içinde yayımlanmış yer olunca açılır.

## Kaynak temelli üretim akışı (her yer için)
```text
1 Resmi kaynak paketi  -> National Parks UK, National Landscapes, NatureScot,
                          Natural England, Natural Resources Wales, DAERA,
                          National Trust / RSPB / Forestry England (ilgiliyse), Wikipedia (yalnız arka plan)
2 Paket onayı          -> paket yoksa veya resmi kaynak yoksa: BEKLET (üretim yok)
3 Gerçekler            -> koordinat, en yakın havalimanı, fotoğraf (tam yer, lisanslı), duraklar
4 Yazım                -> AI yalnız paketteki metinden; her iddiaya kaynak alıntısı
5 Otomatik kontrol     -> alıntı yoksa iddia silinir; durak adı kaynakta yoksa reddedilir
6 Yayın                -> tüm kontroller geçerse
```
Değişken bilgiler (otopark ücreti, gelgit saatleri, feribot, kapanışlar) yalnız resmi bağlantıyla ve "kontrol edin" notuyla yazılır.

## Gruplar ("doğrudan kanallar")
Her grup ayrı çalıştırılır, ayrı rapor verir, sonra bir sonrakine geçilir:
1. 15 millî park (İngiltere 10, İskoçya 2, Galler 3) — pilot; sonuç size gösterilip onay alınır.
2. İngiltere National Landscapes + kıyılar.
3. İskoçya adaları, gölleri, NSA'lar.
4. Galler kalanları.
5. Kuzey İrlanda.
6. Fotoğraf bulunamayanların listesi size verilir.

## UK'ye özel ayarlar
- Fiyatlar USD, UK ortalamasına göre (kiralık araç, karavan, otel; GBP→USD tarihli kur).
- Ortaklar: ABD'ye özel kamp ortakları ve Black Friday gizli; Motorhome Republic UK araması, Viator UK; uygun olmayan kart gösterilmez.
- Sol şerit sürüş, tek şeritli yollar, gelgit adaları (Lindisfarne, St Michael's Mount) için güvenlik notu kaynaklıysa eklenir.
- Ada/feribot ve yürüyüşle ulaşılan yerler (St Kilda, Knoydart) yol gezisi yerine "erişim aşamaları" ile gösterilir.
- Almanca sürümler yayımlanan sayfalar için tek seferde çevrilir.

## Teknik detaylar
- `scripts/content-pipeline/uk/catalog.json` + `uk/review.json` (Kanada yapısıyla aynı).
- `source_evidence.py` / `collect-sources.py` UK kurum alan adlarıyla genişletilir; `prepare-wave.py`, `generate-travel-content.py`, `generate-permit-notes.py` ülke bağımsız hale getirilir (`--country gb --wave N`).
- `countryPartners.ts`'e GB girdisi; `regions` tablosuna 4 GB bölgesi (taslak); sitemap `gb-destinations.xml`; `legacy.ts`'e otorite domain UK eşlemesi.
- Testler: katalog mükerrer kontrolü, GB ortak uygunluğu, otorite yönlendirmesi, kaynak paketi olmadan üretimin durması.
- Kredi: yazım yalnız Gemini Flash ile, yer başına tek çağrı + en fazla bir yeniden yazım; sonradan toplu doğrulama yok.

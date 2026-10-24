# MiniaLife — Denetim, Tasarım ve Dönüşüm Düzeltmeleri (eksiksiz plan)

Kaynak: yüklenen denetim raporu + bu sohbetteki tasarım ve dönüşüm (kiralama/satın alma) değerlendirmeleri. Mevcut yapı korunur; yeni destinasyon, uydu SEO sayfası, paketleme içeriği üretilmez, AI kredisi harcanmaz.

## Aşama 1 — Acil düzeltmeler (P0)
1. **Arama hatası**: "Glamping Weekend" artık Los Angeles'a gitmez, "RV Adventure" hata vermez.
   - Eşleştirme harf parçası yerine tam kelime/tam ad ile yapılır (kısa takma adlar "la" gibi kelime içinde eşleşmez).
   - Rota/tür aramaları (glamping, RV, camping, road trip, fly & drive, no reservation) ilgili sayfaya gider: Glamping → konaklama filtreli destinasyon listesi, RV → /rv-camping, road trip → /road-trips vb.
   - Bulunamazsa sayfa yakın önerileri ve popüler rotaları gösterir.
2. **robots.txt**: SemrushBot ve AhrefsBot engeli kaldırılır; /go/, /out/ ve sunucu yolları yine tüm botlara kapalı kalır (affiliate tıklamaları korunur).

## Aşama 2 — Gezinme ve rotalar (P1)
3. **Tek "Road Trips" menüsü**: Menüde iki başlık yerine tek "Road Trips"; içinde "Havalimanından başlayan rotalar (24)" ve "Çok parklı döngüler (30)" sekmeleri. Eski adresler çalışmaya devam eder (yönlendirme yok, sadece birleşik giriş).
4. **30 döngüye rezervasyon bloğu**: Her döngü sayfasına en yakın havalimanı (mevcut verilerden), numaralı rezervasyon adımları ve canlı Viator turları eklenir. Havalimanı verisi olmayan döngülerde blok gösterilmez (uydurma yok).
5. **Numaralı rezervasyon akışı** (gateway rotaları, döngüler, Fly & Drive, destinasyon): 1) Uçuş (Aviasales, önbellekli fiyat varsa "~$X'ten") 2) Araç/Karavan (Airport Rentals / Motorhome Republic) 3) Konaklama 4) İnternet (Airalo) 5) Turlar (Viator). Akış sayfanın üst yarısına taşınır.
6. **Destinasyon ↔ rota geri dönüşü**: Destinasyon sayfasında "Bu yer şu rotalarda" bağlantıları (24 rota + 30 döngü verisinden).
7. **Destinasyon listesi filtreleri**: Bölge, mevsim ve isimle arama; alfabetik uzun liste yerine kartlar.
8. **Rota kartları**: /road-trips ve /corridors kartlarına havalimanı kodu, gün sayısı, mil ve durak sayısı rozetleri; yalnızca metin olan kartlara rotanın ilk destinasyon fotoğrafı.

## Aşama 3 — Dönüşüm ve güven (P1)
9. **Konaklama kartları**: Sahte tekil otel görünümü kaldırılır; "Search cabins & lodges near [Yer] on Vrbo / Expedia" arama çağrısı olarak sunulur; "illustrative / not an actual listing" uyarısı gerekmez hale gelir.
10. **Araç kartları**: Standart araç/SUV kartlarına konuya uygun fotoğraflar (mevcut lisanslı servis fotoğraf listesinden), net CTA ("Compare cars at [havalimanı]"), sağlayıcı bilgisi. Fiyat uydurulmaz; "canlı fiyatı partner sitesinde görün" yazısı kalır.
11. **Fotoğraf künyeleri**: Kart altındaki uzun künye satırı küçük bir "©" bilgi simgesine/tek satıra indirilir (lisans bağlantısı korunur).
12. **CTA dili**: Pasif "Check on…" yerine eylem odaklı ("Find flights to BHB", "Compare RVs from Denver"). Aynı bölümde rakip seçenek sayısı azaltılır.
13. **Gear ↔ plan bağlantısı**: Destinasyon planının altında, yerin iklim/aktivitesine göre 2–3 "Curated Trip Essentials" ürünü (mevcut ROCKBROS/WILDGUARDER verisinden, kural tabanlı eşleme, AI yok). Paketleme bölümü geri gelmez.

## Aşama 4 — Görsel rötuşlar (P2)
14. Ana sayfa tür etiketlerinin (chips) kontrastı artırılır.
15. Ana sayfa koyu "Complete trip plan" bölümündeki 5 asimetrik kart dengeli ızgaraya alınır.
16. Kiralama arama bölümü site tasarımına uyar; form yüklenmezse görünür takipli yedek buton kalır.
17. Trip Guides hub'ına her kategoride sayfa sayısı, örnek sayfalar ve görsel eklenir.
18. Gear Shop'taki boş partner marka alanı kaldırılır (Gear Shop tasarımı başka değişmez).
19. Düşük kaliteli/uyumsuz destinasyon kapak fotoğrafları için tarama yapılır; sorunlu olanlar listelenir ve lisanslı Commons alternatifiyle değiştirilir.

## Aşama 5 — Doğrulama
- Arama kuralları, robots kuralları, rezervasyon adımı sırası ve döngü→havalimanı eşlemesi için testler.
- Tarayıcıda: ana sayfa öneri butonları, bir destinasyon, bir döngü, bir gateway rota, Fly & Drive, mobil menü (390px) kontrol edilir; tüm partner bağlantılarında takip kodları (Awin 3115962, Viator P00327298, Webjet minialife, Travelpayouts) doğrulanır.
- Sonrasında Semrush site audit başlatılabilir.

## Kapsam dışı / doğrulanamayan
- Döngü haritalarındaki düz çizgilerin gerçek yol rotasına çevrilmesi ayrı iş (önceden hesaplanmış rota dosyası genişletilir); bu turda değil, istenirse eklenir.
- Gelir/tıklama ve Search Console verileri partner panellerinde; Webjet canlı formu Hosted Domains onayına bağlı.

## Teknik detaylar
- Arama: `findDestinationSlugByQuery` içinde kelime sınırı regex, min. alias uzunluğu, niyet sözlüğü (`src/lib/data/searchIntent.ts`) + `search.tsx` yönlendirmesi; `SearchBar` öneri listesi niyet sayfalarına bağlanır.
- Menü: `Header.tsx` tek giriş; `/road-trips` sayfasına sekme; `/corridors` korunur.
- Döngüler: `loops.json` duraklarından en yakın havalimanı `destinations.airport_code` ile türetilir; ortak `BookingSteps` bileşeni `CorridorBookings` mantığını yeniden kullanır; tüm Awin linkleri `buildAwinLink`, Webjet linkleri `webjet.ts`.
- Konaklama: `VrboSearchWidget.tsx` arama CTA'sına dönüşür; `PartnerPhotoCard` künyesi sıkıştırılır.
- Gear eşleme: `src/lib/data/tripEssentials.ts` (aktivite/iklim → kategori), JSON-LD'ye eklenmez.
- AGENTS.md: birleşik Road Trips girişi, BookingSteps sırası ve arama niyet sözlüğü kuralları eklenir.

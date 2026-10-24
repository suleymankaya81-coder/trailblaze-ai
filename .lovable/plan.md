# Ekran görüntüleri + CRO notları: kontrol ve kalan düzeltmeler

## Durum kontrolü (ekran görüntüleri eski sürümden)
Zaten düzeltilmiş olanlar (tekrar yapılmayacak, yalnızca doğrulanacak):
- Menüde ayrı "Gateway Road Trips" yok; tek "Road Trips" + iki sekme.
- Ana sayfa çipleri kontrastı, koyu bölümde 5 kart tek sıra.
- Gear Shop'taki boş "More partner brands" kutusu kaldırıldı.
- Destinasyon listesinde arama / bölge / sezon filtreleri.
- Loop sayfalarında numaralı rezervasyon bloğu + Viator.
- Arama hatası, robots.txt, Trip Guides sayıları.

## Kalan sorunlar ve düzeltmeler

### 1. Telif yazıları hâlâ uzun olan yerler
- Ana sayfa konaklama kartları ("From canvas tents…"): "Illustrative · isim · lisans" satırı → küçük © simgesi (üzerine gelince tam bilgi).
- Arama rehberi teklif kartları, ortak foto kartları, Harvest Hosts kartı: aynı © düzeni.

### 2. Pasif butonlar
- "Check availability" (destinasyon teklif kartları, arama rehberi kartları) → türüne göre eylem dili: konaklama "See stays near {yer}", karavan "Check RV availability for {yer}", araç "Compare rates at {IATA}", deneyim "See tours in {yer}".

### 3. Kiralama kartlarına güven rozetleri
- Airport Rentals araç/SUV kartlarına: "Compare suppliers at {IATA}", "Free cancellation on most rates".
- Motorhome Republic: "Compare RV & campervan suppliers". Yalnızca sağlayıcının kendi sitesinde belirttiği genel ifadeler kullanılır; uydurma fiyat veya "%X indirim" yok.

### 4. Araç fotoğrafları
- Ana sayfadaki Çin plakalı binek araç ve SUV görselleri, Commons'tan lisanslı ABD plakalı standart araç / SUV / kamper fotoğraflarıyla değiştirilecek (paylaşılan foto listesi; tüm sayfalarda geçerli).

### 5. Uçuş kutusunda fiyat hissi
- Destinasyon, Fly & Drive ve gateway uçuş kartında 24 saatlik önbellekteki Aviasales fiyatı varsa "Flights from $X (checked {tarih})" rozeti; veri yoksa rozet gizlenir.

### 6. Görsel liste sayfaları
- Gateway Road Trips kartları: kapak fotoğrafı (ilk durağın destinasyon fotoğrafı) + IATA / gün / mil rozetleri.
- Multi-park loop listesi: aynı kart düzeni (foto + gün + durak sayısı).

### 7. Ana sayfa kiralama formu uyumu
- Sağlayıcı formunun etrafına site renkleriyle çerçeve/başlık; form yüklenmezse görünen yeşil "Search on Motorhome Republic / Airport Rentals" butonu öne çıkar.

### 8. Doğrulama
- Ana sayfa, Acadia, Utah Mighty 5, California Icons, BHB Fly & Drive, Gear Shop, Destinations, Road Trips sayfalarında masaüstü + telefon ekran görüntüsü; affiliate tıklamalarının takip parametreleri; mevcut testler + yeni küçük testler (rozet metni uydurma fiyat içermez, uçuş rozeti veri yoksa gizli).

## Kapsam dışı
- Araç/otel için canlı fiyat (ortak API'si yok; uydurma fiyat gösterilmez).
- Gear Shop tasarımı değişmez.

## Teknik notlar
- © düzeni için ortak küçük `PhotoCredit` bileşeni; index.tsx, LandingOfferCard, PartnerPhotoCard, HarvestHostsCard kullanır.
- CTA etiketi offer.type'a göre tek yardımcı fonksiyonda.
- Uçuş rozeti flight_price_cache'ten okunur, ziyaret başına API çağrısı yok.
- Liste kartları corridors.ts / loops.json verisi + destinasyon hero fotoğrafı; yeni AI üretimi yok.

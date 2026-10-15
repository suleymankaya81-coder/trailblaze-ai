# Travelpayouts ortaklarını siteye yerleştirme

Gönderdiğiniz 10 takipli link, MiniaLife'ın kendi tasarımındaki resimli kartlarla sayfalara eklenecek. Hazır iframe widget kullanılmayacak, böylece site hızlı kalacak.

## Hangi marka nereye

| Bölüm | Marka | Ne işe yarar |
|---|---|---|
| Destinasyon: "Getting there" | Aviasales (uçuş), EconomyBookings + QEEQ (araç) | En yakın havalimanına uçuş ve araç kiralama |
| Destinasyon: "Things to do" | Klook, Tiqets (+ Viator onaylanınca) | Turlar, park girişleri, aktiviteler |
| Destinasyon: "Before you hit the road" | EKTA (sigorta), Airalo (eSIM), Radical Storage (bagaj) | Yola çıkmadan önce hazırlık |
| Gateway şehirler (Las Vegas, SF, Denver vb.) | Go City | Şehir gezi kartı, ilgili sayfalarda gösterilir |
| Anasayfa kiralama + ekipman kartları | BikesBooking, EconomyBookings | Bisiklet ve araç kiralama kartları |
| Uçuş fiyat kutusu (destinasyon) | Aviasales Data API | "Bu havalimanına uçuşlar ~$X'ten" bilgisi, günde bir kez önbelleğe alınır |

## Ziyaretçi için
- Her kartta "Partner link · Marka" etiketi, sponsorlu işaretleme ve bot filtreli tıklama sayımı olacak.
- Fotoğraflar lisanslı Commons görselleri ve "illustrative" etiketiyle gösterilecek. Fiyatlar tahmini olarak belirtilecek.
- Affiliate Disclosure sayfasına Travelpayouts markaları eklenecek.

## Sizden gereken
- Yok. Aviasales API anahtarı ve partner ID, kodun içine değil güvenli bir şekilde saklanacak.

## Teknik detaylar
- `src/lib/affiliates/travelpayouts.ts`: marka → tpm.lv linki eşlemesi, `sub_id` ile destinasyon slug'ını ekleme.
- Yeni bileşenler `src/components/destination/TravelpayoutsCards.tsx` (uçuş/araç, aktivite, hazırlık grupları); anasayfa kiralama kartlarına BikesBooking/EconomyBookings eklenir.
- Aviasales: `AVIASALES_API_TOKEN` ve `AVIASALES_PARTNER_ID` secret olarak saklanır; `createServerFn` ile `prices_for_dates` uç noktası, havalimanı kodu başına önbellek (yeni `flight_price_cache` tablosu, 24 saat). Veri yoksa kutu gizlenir, link kartı kalır.
- Go City yalnızca kapsadığı şehirlere yakın destinasyonlarda gösterilir (statik eşleme listesi).
- `compliance.ts` PARTNER_LABELS'a yeni markalar; tıklamalar mevcut track akışından geçer.
- Link eşlemesi için birim testi; Playwright ile bir destinasyon sayfasında kartların ve yönlendirmenin kontrolü.
- AGENTS.md: "Travelpayouts markaları kendi kartlarımızla, iframe widget olmadan gösterilir; uçuş fiyatları günde bir önbelleğe alınır."

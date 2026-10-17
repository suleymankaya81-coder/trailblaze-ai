# Destinasyona özel rezervasyon bilgisi + daha çekici uçuş kutusu

## Hedef
"Reservation needed" kutusundaki genel cümle (ör. "Book peak-season stays early") kalkacak. Yerine her destinasyon için o yere özel 2–3 cümlelik bilgi gelecek. Sağdaki havalimanı kutusu daha görsel ve tıklanmaya davet eden bir karta dönüşecek. "Where you'll want to sleep" üstündeki bu şerit büyüyecek.

## 1. Her destinasyona özel rezervasyon bilgisi (446 yer)
- Her destinasyon kaydına kalıcı bir "rezervasyon bilgisi" alanı eklenecek: kısa başlık (ör. "Timed entry May–Oct") + 2–3 cümle açıklama + isteğe bağlı resmi kaynak linki (NPS / Recreation.gov).
- İçerik, sayfa her açıldığında değil, **bir kez** üretilip veritabanına kaydedilecek. Bu yüzden her ziyaret başına maliyet yok.
- İçerik şunlara dayanacak: destinasyon adı, bölge, en iyi sezon, mevcut izin seviyesi, havalimanı/sürüş bilgisi. Kural: belirli tarih/fiyat garantisi yok, "tahmini, değişebilir" dili, uydurma işletme adı yok.
- Önce canlıdaki 20 ana destinasyon (Yellowstone, Yosemite, Zion, Glacier, Arches/Moab...) yazılacak ve sana örnek gösterilecek; onay sonrası kalan yerler gruplar halinde doldurulacak (aylık 200 kredi sınırı korunarak).
- Yeni destinasyonlar eklendiğinde aynı adım yayına alma kontrol listesine eklenecek: bu bilgi yoksa sayfa yayına çıkmaz.
- Bilgisi henüz olmayan yerlerde geçici olarak isim + sezon içeren dolu bir cümle gösterilir; asla 5 kelimelik genel metin kalmaz.

## 2. Havalimanı kutusu: görsel ve tıklama hedefli
- Kart tamamen tıklanabilir, belirgin bir uçuş kartı olacak: büyük havalimanı kodu, küçük rota çizgisi "BZN ✈ ——— Yellowstone · 1 s 56 dk".
- Hafif uçak/gökyüzü dokulu arka plan (sitenin renkleriyle), sağda belirgin "Find flights" butonu.
- Tahmini fiyat varsa küçük rozet: "recent fares from ~$X (estimate)".
- Altta "Partner link · Aviasales" etiketi korunur (açıklık kuralı).

## 3. Şeridi büyütmek
- İki kutu daha geniş boşluklu, daha büyük yazı ve ikonlarla; sol kutu durum rengine göre (yüksek / orta / yok) hafif renkli kenarlık.
- Mobilde alt alta, masaüstünde yan yana eşit yükseklikte.

## Teknik detaylar
- Veritabanı: `destinations` tablosuna `permit_headline text`, `permit_note text`, `permit_source_url text` sütunları (migration).
- Üretim betiği: `scripts/content-pipeline/generate-permit-notes.py` (google/gemini-3-flash-preview, uzunluk ve uyum kontrolleri, kaldığı yerden devam edebilir); `publish-wave.py` kontrolüne permit_note eklenir.
- `getDestinationPageData` yeni alanları döndürür; `TripRadar.tsx` yeniden tasarlanır, `PERMIT_COPY` sadece rozet etiketi için kalır.
- Doğrulama: Yellowstone, Zion ve bir katalog yeri Playwright ile masaüstü + mobil ekran görüntüsü.
- AGENTS.md: permit notlarının bir kez üretilip DB'de tutulduğu kuralı.

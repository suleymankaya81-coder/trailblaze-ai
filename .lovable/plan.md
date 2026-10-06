# Tier 3: kalan 39 yer, Tier 1–2 ile aynı kurallar

## Ne yapılacak
- Tier 3'teki 39 yer hazırlanır ve yayına alınır.
- Ücretsiz veriler önce toplanır, bunlar kredi harcamaz: Wikimedia fotoğrafları ve kredileri, konum, en yakın havalimanı, sürüş süresi ve rota.
- AI (Gemini) yalnızca gezi özetini ve 4 rehberi yazar: en iyi zaman, yapılacaklar, gezi planı ve glamping.
- Her rehber en az 600 kelime olur. Kısa kalan rehber bir kez yeniden yazılır. Yine kısa kalırsa o yer yayına alınmaz.
- Bir yer, ancak tüm kontrolleri geçerse yayına alınır: kendine ait kapak fotoğrafı ve kredisi, konum ve sürüş bilgisi, en az 15 teklif, 4 rehber, harita rotası ve 3 aktivite fotoğrafı.
- Başlıklar ve açıklamalar Google için otomatik kısaltılır. Site haritası yeni sayfaları kendiliğinden ekler.

## Kredi
- Tier 2'de yer başına gerçek maliyet yaklaşık 0,02–0,1 krediydi. 39 yer için tahmini maliyet 2–5 kredi.
- Aylık sınır 200'de kalır, değiştirilmez. Sınıra ulaşılırsa işlem durur ve eksik yer yayına alınmaz.

## Akış
1. 39 yer için ücretsiz verilerin toplanması
2. 10'arlı gruplarla yazım, kontrol ve yayın
3. Önizlemede kontrol: sayfaların açılması, telefon görünümü, site haritası sayısı
4. Onayınla minialife.com'a yayın ve site haritasının Search Console'a yeniden gönderilmesi

## Sonuçta göreceklerin
- Yayına giren yer ve rehber sayısı, ortalama rehber uzunluğu, bekleyen yerler ve bekleme nedenleri, harcanan kredi.

## Teknik detaylar
- Tier 2'de kullanılan aynı betikler kullanılır: prepare-wave.py → apply-wave.py → generate-landing-pages.py (gemini-3-flash-preview, MIN_WORDS 600) → insert-landing-pages.py → publish-wave.py.
- /tmp/lovable_ai.py, /tmp/airports.csv ve batch betiği eksikse yeniden oluşturulur. Batch betiği şöyle çalışır: 10'arlı gruplar, /tmp/STOP ile durdurma, 402/403 hatasında durma.
- Koordinatı ya da fotoğrafı bulunamayan yerler için WIKI_ANCHORS, COORDS ve SEARCH_TERMS girdileri eklenir. Başka bir yerin fotoğrafı kullanılmaz.
- roadmap.md güncellenir.

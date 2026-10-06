# Tier 2: 200 yer, Tier 1 ile aynı kurallar, Gemini ile

## Durum
- Tier 2'de 200 yer var, hepsi henüz hazırlanmadı (fotoğraf, konum, rehber yok).
- Tier 1'de 3 kayıt da hâlâ hazırlanmamış görünüyor; bunlar önceki yinelenen kayıtlar olabilir. Kontrol edilip gerekirse listeye eklenecek.

## Yaklaşık kredi maliyeti
- Fotoğraf, konum, havalimanı ve sürüş rotası ücretsiz kaynaklardan gelir, kredi harcamaz.
- Kredi yalnızca yapay zekâ yazımına gider: gezi özeti + 4 rehber (her biri 600+ kelime).
- Gemini ile yer başına tahmin: 0,3–0,5 kredi. 200 yer için toplam yaklaşık 60–100 kredi.
- Bu bir tahmin. İlk 5 yerde gerçek harcamayı ölçüp sana bildireceğim; tahmin tutmazsa durup soracağım.
- Aylık sınır 200 kredi olarak kalır ve 1 Kasım'da sıfırlanır. Bu ay kalan pay bitmeye yaklaşırsa iş durur, kalan yerler Kasım'da aynı kurallarla tamamlanır. Sınırı değiştirmem.

## Akış
1. Ücretsiz hazırlık: 200 yerin hepsi için fotoğraflar (1 kapak + 2 galeri + 3 aktivite, her biri kredili ve kapaklar birbirinden farklı), konum, en yakın havalimanı ve sürüş rotası. Eşleşmeyen bölge isimleri için yakın kasaba ya da bilinen bir yer işareti kullanılır.
2. Pilot: 5 yer üretilir, kredi ölçülür, rehber uzunlukları raporlanır.
3. Kalan yerler 10'arlı gruplar halinde üretilir.
4. Kurallar Tier 1 ile aynı: her rehber en az 600 kelime, kısa kalırsa bir kez yeniden yazılır, yine kısaysa yer yayına alınmaz. Bir yer ancak tüm kontrolleri geçerse yayına alınır (kapak + kredi, konum + sürüş, en az 15 teklif, 4 rehber, harita rotası, 3 aktivite fotoğrafı).
5. Önizlemede kontrol, sonra minialife.com'a yayın ve site haritasının Search Console'a yeniden gönderilmesi.

## Sonuçta göreceklerin
- Kaç yer yayına girdi, hangileri neden bekliyor, gerçek kredi harcaması, rehber uzunlukları ve yeni site haritası adres sayısı.

## Teknik detaylar
- Model: google/gemini-3-flash-preview (generate-landing-pages.py ve prepare-wave.py'deki özet çağrısı; özet çağrısı da Gemini'ye sabitlenir).
- prepare-wave.py --facts-only ile ücretsiz veriler önce kaydedilir (wave-facts klasörü), sonra AI adımı.
- Batch: paralellik 4, /tmp/STOP ile durdurma, 402/403'te durur, önbellekteki dosyalar atlanır; her 10 yerde kredi kullanımı kontrol edilir.
- publish-wave.py ve insert-landing-pages.py MIN_WORDS=600 aynı kalır.
- Doğrulama: yeni sayfalarda 200, örnek Playwright kontrolleri (telefon genişliği dahil), sitemap sayımı. roadmap.md'ye Tier 2 eklenir.

# Wave 3: kalan 128 Tier 1 yeri tek seferde, rehberler en az 600 kelime

## Ne yapılacak
- Hazırlığı biten 128 yer (Buena Vista dahil) için AI gezi planı ve 4 rehber (en iyi zaman, yapılacaklar, gezi planı, glamping) üretilecek.
- Rehberler kaydedilmiş gerçek verilerle yazılacak: fotoğraflar, konum, en yakın havalimanı, sürüş süresi ve mesafesi.
- Her rehber **en az 600 kelime** olacak. 600'ün altında kalan rehber bir kez daha yazdırılır. Yine kısa kalırsa o yer yayına alınmaz ve bekleme listesine yazılır.
- Bir yer, ancak tüm kontrolleri geçerse yayına alınır: kapak fotoğrafı ve kredisi, konum ve sürüş bilgisi, en az 15 teklif, 4 rehber, harita rotası ve 3 aktivite fotoğrafı.

## Kredi
- Bir yer yaklaşık 0,22–0,26 kredi tutuyor. 128 yer için toplam yaklaşık 30–35 kredi gerekiyor. Mevcut bakiye bunu karşılıyor.
- Bakiye her 10 yerde bir kontrol edilir. Bakiye 10 kredinin altına düşerse işlem durur, eksik sayfa yayına alınmaz.

## Sonuçta göreceklerin
- Kaç yerin yayına girdiği, hangilerinin neden beklediği, ortalama rehber uzunluğu ve site haritasındaki yeni adres sayısı.
- Her şey önce önizlemede kontrol edilir. Ardından onayınla minialife.com'a yayınlanır ve site haritası Google'a yeniden gönderilir.

## Teknik detaylar
- generate-landing-pages.py: istemdeki bölüm uzunluğu 120–170 kelimeye çıkarılır, istemde "toplam ≥ 650 kelime" ifadesi yer alır. Yazımdan sonra kelime sayımı yapılır. 600'ün altındaki sayfa yalnız bir kez yeniden üretilir. Bağlantı kopmasında (ör. ConnectionReset) 429/5xx için en fazla 2 deneme yapılır.
- insert-landing-pages.py ve publish-wave.py: kısa rehber eşiği 450'den 600'e çıkar (yalnız yeni üretimler için; eski sayfalara dokunulmaz). 4 rehberin tamamı ≥600 değilse yer HELD olur.
- Sınırlı batch betiği: 10'arlı gruplar halinde prepare → generate → apply → insert → publish adımları çalışır, paralellik 4 olur. 402/403 gelirse durur ve önbelleğe alınmış dosyaları atlar.
- Doğrulama: yeni sayfalarda 200 durumu, Playwright ile örnek kontroller (telefon genişliği dahil), site haritası sayımı. roadmap.md ve AGENTS.md'deki eşik kuralı güncellenir.

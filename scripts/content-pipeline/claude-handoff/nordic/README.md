# Nordik destinasyonlar — Claude teslim paketi

Bu paket **sayfa üretim girdisidir**; sayfalar yayımlanmış veya tüm bilgiler doğrulanmış değildir.

## Dosyalar

- `no-catalog.json`: Norveç; Svalbard kayıtları ayrıca işaretlenir.
- `is-catalog.json`: İzlanda; birleşmiş eski milli park adları güncel parkın altında açıklanır.
- `se-catalog.json`: İsveç.
- `fi-catalog.json`: Finlandiya.
- `dk-catalog.json`: Danimarka; Faroe/Grönland bu ülke dosyasına dahil edilmez.
- `realm-territories-supplement.json`: Faroe/Grönland için ayrı araştırma adayları; kendi ülke kodları ve ulaşım kontrolleri olmadan aktarılmamalıdır.
- `coverage.json`: Resmî listelerdeki her park/rota adının katalogdaki karşılığı.
- `sources.json`: Kapsam, kullanılan kaynak listeleri ve dışlama açıklamaları.
- `authority-audit.json`: World-national-parks.net kontrolü; görülebilen tarihî isimler, eşlemeler ve erişilemeyen arşivler.
- `REPORT.md`: Ülke sayıları, kapsam karşılaştırması ve açık doğrulama noktaları.
- `PROMPT.md` + `schema.json`: Claude üretim talimatı ve çıktı biçimi.
- `batches/` + `batch-manifest.json`: En fazla 25 kayıtlık, sıralı gönderim dosyaları; katalogdaki hiçbir slug atlanmaz.
- `validate_catalogs.py` + `test_catalogs.py`: Çevrimdışı yapısal ve kapsam kontrolleri.

## Kullanım

1. Claude'a `PROMPT.md` talimatını ve `schema.json` dosyasını gönderin.
2. Aynı ülkenin `batches/<ülke>-input-partNN.json` dosyalarını sırasıyla gönderin. Ülke kataloğu ve rapor bağlam içindir; tüm kataloğu her mesajda tekrar göndermeyin.
3. Her yanıtı `<ülke>-result-partNN.json` olarak kaydedin. Kanıt bulunamayan yerler de kendi slug'ıyla `hold` kaydı olarak dönmelidir.
4. Sonuçları ve `batch-manifest.json` dosyasını buraya yükleyin. Yer/durak kimliği, alıntılar, ulaşım, lisanslı fotoğraflar ve yayıma uygunluk ayrıca kontrol edilir; Almanca çeviriler bundan sonra hazırlanır.

## Alanların anlamı

Önceki katalogların temel alanları korunmuştur. `source_urls` her yerin araştırma başlangıç kaynaklarını; `access_note` ulaşım sınırlarını; `identity_status` kimlik doğrulama seviyesini belirtir. `lat/lng: null` doğrulanmış konum bulunmadığı anlamına gelir. Katalog koordinatları park merkezini veya genel coğrafi noktayı gösterebilir; **araç parkı, rota durağı veya ziyaretçi giriş noktası değildir**.

`wave`: 1 milli parklar; 2 belirlenmiş doğa/yürüyüş/koruma alanları; 3 ziyaretçi bölgeleri, ikonik doğal yerler ve manzaralı rotalar. Resmî milli park sayısı ile tüm destinasyon sayısı farklıdır. Tarihî/birleşmiş parklar, ana bölge ve alt doğal duraklar raporda açıklanır; aynı yerin farklı adları yeni park gibi çoğaltılmaz.

Kapsam: milli parklar, belgelenmiş ziyaretçi doğa alanları, önemli yürüyüş/karavan bölgeleri ve manzaralı rotalar. Her küçük biyotop, belediye parkı, şehir veya tarihî yapı bu katalog kapsamına girmez. Resmî envanter karşılaştırması bu kapsam içinde yapılır; dünyadaki her turistik noktanın eksiksiz sayıldığı iddia edilmez.

Ücretler, kamp hakkı, güvenlik, yol/feribot durumu ve sezonluk erişim **güncel resmî kaynaklarla üretim sırasında kontrol edilmelidir**. Kaynak URL'sinin varlığı, içeriğin veya yol erişiminin doğrulandığı anlamına gelmez. Lisanslı fotoğraf eşleme ve Almanca çeviri bu katalog tesliminin parçası değildir.
# Avustralya ve Yeni Zelanda katalog raporu — 19 Kasım 2026

**Toplam: 1.016 aday destinasyon; hiçbir sayfa yayımlanmadı.**

| Ülke | Aday | Milli park adayları | Diğer doğal yer/rota | Konumu belirsiz | Bölgesi belirsiz |
|---|---:|---:|---:|---:|---:|
| Avustralya | 887 | 835 | 52 | 13 | 0 |
| Yeni Zelanda | 129 | 13 | 116 | 17 | 43 |

Avustralya milli park adayları **güncel kamuya açık 835 park demek değildir**: CAPAD 2024 envanteri ile Wikipedia farklarını ve 9 scientific parkı da inceleme kaydı olarak içerir. Bunların ziyaretçi erişimi ve güncel statüsü üretimden önce doğrulanmalıdır.

## Kapsam kontrolü

- Resmî CAPAD hizmetinden 1.550 arazi kaydı indirildi. Seçili milli park türlerinde 796 eyalet/ad grubu tekil kayıt olarak uzlaştırıldı; aynı parkın parçaları ayrı destinasyon yapılmadı. Seçim dışındaki önerilen/kanun eki arazi kayıtları `exclusions.json` dosyasında gerekçeleriyle saklandı.
- Avustralya: ACT 1, NSW 257, NT 27, QLD 339, SA 38, TAS 27, VIC 63, WA 134, Jervis Bay 1. Bunlar tüm aday türlerini içerir; eyalet başına milli park sayısı değildir.
- Dış topraklar için 5 ayrı araştırma kaydı; Norfolk adasının iki arazi kesimi dahil. Ana kara kataloğuna karıştırılmadı; ada parçaları/alias birleşimi ve ulaşım üretimden önce ayrıca incelenmelidir.
- Yeni Zelanda: 13 güncel milli park ve 11 resmî Great Walk tek tek katalog slug’larına bağlandı. Te Urewera milli park değil ayrı korunan alan; Egmont güncel Te Papa-Kura-o-Taranaki adı altında tutuldu.
- Büyük doğal yerler ve manzaralı/yürüyüş rotaları mevcut Wikipedia makale kimlikleriyle keşif girdisi olarak eklendi. Lake St Clair’ın yanlış Kanada/ABD gölü eşleşmesi yakalanarak Tasmanya makalesiyle değiştirildi.
- 42 kayıpsız dosya, dosya başına en fazla 25 kayıt; içerik üretim talimatı ve Nordik sonuç şeması hazır.

## Eski otorite domaini

- Avustralya `/au/au.htm` tarihî sayfası kurtarıldı: 294 ad satırının 225’i tam ad, 36’sı açık alias eşlemesiyle bağlandı; 32 kimlik çözülemedi, Mitchell River iki eyaletteki park nedeniyle belirsiz bırakıldı. Aliaslar üretim incelemesi için eşlemelerdir; mevcut resmi park statüsü/erişim onayı değildir.
- Kurtarılan Avustralya sayfasında parklar düz metin; tekil park adresi bağlantısı yok. Olmayan URL’ler üretilmedi.
- Yeni Zelanda `/ne/ne.htm` ülke bağlantısı eski ana sayfada doğrulandı; ülke arşivi `File Not Found` dönüyor. Tarihî park isimlerinin eksiksizliği doğrulanamadı.
- Yönlendirmeler değiştirilmedi: yayımlanmamış ülkelere çalışır sayfa varmış gibi 301 eklenmedi.

## Doğrulananlar ve sınırlar

Beş çevrimdışı test geçti: Nordik alanları, tekrar kimlikler, koordinat çiftleri/ülke sınırları, kaynak URL biçimleri, 13 güncel park, 11 Great Walk, tekilleştirilmiş arazi parçaları ve kayıpsız batch kontrolü. Uygulama derlemesi hatasız; uygulama sayfaları değiştirilmedi.

30 koordinat ve 43 Yeni Zelanda bölgesi doğrulanamadığından null bırakıldı. Konumu bulunan kayıtlar da ziyaretçi girişi veya navigasyon noktası olarak doğrulanmış değildir. Fotoğraflar, güncel yol/kamp/izin kuralları, kaynak URL’lerinin tek tek canlı kontrolü, Almanca çeviriler ve Webjet yer bazlı hizmet uygunluğu **üretim aşamasına bırakıldı**. Katalog hazırlığı içerik modeli çağrısı veya veritabanı yayını yapmadı; tüm saklanmış kaynaklar tekrar kullanılabilir.
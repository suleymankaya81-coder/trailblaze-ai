# Avustralya ve Yeni Zelanda katalog raporu — 19 Kasım 2026

**Güncellenmiş toplam: 1.006 aday destinasyon; hiçbir sayfa yayımlanmadı.**

| Ülke | Aday | Milli park adayları | Diğer doğal yer/rota | Konumu belirsiz | Bölgesi belirsiz |
|---|---:|---:|---:|---:|---:|
| Avustralya | 877 | 825 | 52 | 7 | 0 |
| Yeni Zelanda | 129 | 13 | 116 | 1 | 3 |

Avustralya milli park adayları **güncel kamuya açık 825 park demek değildir**: CAPAD 2024 envanteri ile Wikipedia farklarını ve 9 scientific parkı da inceleme kaydı olarak içerir. Bunların ziyaretçi erişimi ve güncel statüsü üretimden önce doğrulanmalıdır.

## Kapsam kontrolü

- Resmî CAPAD hizmetinden 1.550 arazi kaydı indirildi. Seçili milli park türlerinde 796 eyalet/ad grubu tekil kayıt olarak uzlaştırıldı; aynı parkın parçaları ayrı destinasyon yapılmadı. Seçim dışındaki önerilen/kanun eki arazi kayıtları `exclusions.json` dosyasında gerekçeleriyle saklandı.
- Avustralya eyalet sayıları güncel `coverage.json` ve ülke dizisinden okunmalıdır; eski/yeni aynı-yer kimlikleri birleştirilerek 10 tekrar giderildi. Bunlar tüm aday türlerini içerir; eyalet başına milli park sayısı değildir.
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

Altı çevrimdışı katalog testi ve 11 ülke/harita bağlantı testi geçti. `Aoraki / Mount Cook` gibi adlarda eğik çizginin makale kimliğini bozması düzeltildi; kaynaklı konumlar geri kazanıldı. Avustralya/Yeni Zelanda adları ve Okyanusya sınıflaması mevcut ülke dizinine eklendi; boş/yayımlanmamış dizinler hâlâ 404 verir. Uygulama derlemesi hatasız.

Kaynaklı 22 genel konum ve 40 Yeni Zelanda bölgesi tamamlandı; 8 konum ve 3 bölge belirsiz kaldı. Eksik bölgeler: Hanmer Conservation Park, Northland Conservation Park, Pirongia Forest Park. Eksik konumlar: Georges River Koala National Park, Great Koala National Park, Muundhi National Park, North East Island National Park, Larapinta Trail, Overland Track, Great Alpine Road ve Milford Track. Uzun rotalara uydurma merkez/başlangıç noktası atanmadı. North East Island makalesinin genel park listesine yönlendiği görüldü; yanlış QID bağlantısı kaldırıldı.

83 benzersiz Wikipedia dışı kaynak adresinin 73’ü 200 döndü, 10’u zaman aşımına uğradı; erişilemeyenler bozuk ilan edilmedi. 832 makale kimliği API ile incelendi; 129 Yeni Zelanda adayının tamamında QID var. Resmî DOC park listesinden 12 ek park adresi kurtarıldı; Yeni Zelanda’da 23 kayıt tam resmî ziyaretçi adresine sahip. HTTP 200, metnin doğru veya güncel olduğu anlamına gelmez.

Tam ham Wikidata dökümü kayıt boyutu sınırını geçti; geçici yerel kopyası yeniden okunarak doğrulandı, ancak ortam sıfırlanınca korunacağı doğrulanmadı. Aday düzeltmeleri ve denetim sonuçları kalıcı dosyalarda saklandı; tam ham yanıt gerektiğinde yeniden alınmalıdır.

**İstenen sayfa/harita doğrulaması tamamlanamadı:** veritabanında AU/NZ yayımlanmış veya taslak kayıt yok. Dört ülke adresi İngilizce/Almanca ve telefon/bilgisayarda açıldı (8 kontrol); hepsi gerçek 404 ve harita yok. Park bağlantısı akışı henüz bulunmadığından çalışıyor denmedi. Fotoğraflar, exact-place ziyaretçi erişim kanıtları ve İngilizce/Almanca sayfa içerikleri üretilmeden ülkeleri yayına almak güvenilir değildir. Webjet AU/NZ adres kontrolleri zaman aşımına uğradı; partner uygunluğu doğrulanamadı. Hiçbir veritabanı veya yönlendirme değişikliği yapılmadı; `candidate-findings.json` her adayın kalan üretim engellerini saklar.
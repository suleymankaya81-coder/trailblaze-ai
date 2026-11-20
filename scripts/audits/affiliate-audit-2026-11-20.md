# WildParkRoutes — Ortaklık bağlantıları denetimi
**Tarih:** 20 Kasım 2026 · **Canlı site:** https://wildparkroutes.com

## Sonuç
Viator’un gösterilen gerçek ürün bağlantıları doğru doğrudan hesabı kullanıyor: **pid=P00327298, mcid=42383**. Ancak eski Viator tekliflerinde reddedilmiş Awin programına giden bir yol, ülke bazlı karavan yönlendirmelerinde yanlış hedefler ve raporlama hataları bulundu; bunlar düzeltildi. **EKTA bağlantısı gerçekten çalışmıyor: Travelpayouts hesabının kampanyaya kaydı/onayı gerekiyor.** Düzeltmeler henüz yayımlanmadı.

“Bütün ortaklıklar sorunsuz, komisyon kesin kaydediliyor” sonucu çıkarılamaz. Gönderilen kod, ulaşılan hedef, çerez/hesap tarafındaki ilişkilendirme ve satış komisyonu birbirinden farklı doğrulama aşamalarıdır.

## Denetimin kapsamı
- Veritabanındaki **35.529 teklifin** ortak, ağ, reklamveren numarası ve URL envanteri incelendi; 5.465 farklı ham adres var. Yayındaki destinasyonlara bağlı 35.297 teklif ve 10 genel teklif bulunuyor. Bunların tamamı ziyaretçiye gösterilmez; mevcut uygunluk filtreleri ayrıca uygulanır.
- Viator önbelleğindeki bütün ürün URL’lerinde hesap numarası ve API biçimi tarandı. İkinci anlık kontrolde **4.660 ürün kaydı / 3.956 farklı URL**, hepsinde doğru pid/mcid ve medium=api, api_version=2.0 vardı. Sayılar canlı önbellek yenilendikçe değişebilir.
- ROCKBROS tam beslemesi: **2.010 model, 7.521 takip bağlantısı**; tamamı yayıncı 3115962 ve reklamveren 58007. Sayfaların kullandığı JSON kataloglarında ayrıca 1.764 bağlantı tarandı; yanlış yayıncı bulunmadı.
- Ana sayfa EN/DE, Yellowstone, Almanca Geirangerfjord, Gear Shop ve üç Viator liste türü: sekiz canlı adres tarayıcıda açıldı. İncelenen sayfalarda JavaScript hatası görülmedi.
- **100 farklı temsilî dış bağlantı** ve bütün mevcut Motorhome Republic ülke hedefleri HTTP ile kontrol edildi; sorunlu örnekler ayrıca tarayıcıda denendi. Binlerce dış ürün sayfasının her biri ziyaret edilmedi; envanter taraması tüm kayıtları, dış erişim testi temsilî hedefleri kapsar.
- Gerçek Viator düğmesine EN/DE canlı sayfalarda ve düzeltilmiş önizlemede tıklandı. Norveç karavan kartının gerçek tıklama sonrası adresi de doğrulandı.
- **111 test geçti; son site derlemesi başarılı.** Rezervasyon/satın alma yapılmadı; komisyon veya dönüşüm kaydı doğrulanmadı. Denetimdeki test ziyaretleri ortak panellerinde test tıklamaları oluşturabilir; organik ziyaretçi başarısı sayılmamalıdır.

## 1. Viator — öncelikli inceleme
### Doğru çalışan bölüm
Ana sayfa, parkların ilk tur kartı, alt tur listesi ve rota tur listelerinde gerçek API ürünleri şu parametrelerle Viator’a gidiyor:
- pid: **P00327298**
- mcid: **42383**
- medium: **api**
- api_version: **2.0**
Manuel arama bağlantılarında medium=link kullanılıyor. API bağlantıları manuel link biçimine zorlanmadı. Geirangerfjord’dan gerçek tıklamada açılan yeni sekme doğru ürün adresi ve bu dört parametreyi taşıdı. İncelenen gerçek ürün bağlantılarında ikinci bir Awin/Travelpayouts geçişi veya hesap kodunun üzerine yazılması görülmedi.

### Bulunan ve düzeltilen sorunlar
1. **4.418 yayındaki eski teklif satırı** Viator için network=awin / reklamveren 11018 taşıyordu. Ortak Awin bağlantı üreticisi artık Viator’u doğrudan onaylı hesaba yönlendiriyor; eski veritabanı satırları değiştirilmeden normal tıklama ve yedek bağlantı yolu düzeltildi. Bu eski kayıtların tümü mevcut tasarımda görünmüyor; geçmişte kaç tıklamayı etkilediği kanıtlanamadı.
2. Eski Viator adaptörü onay bulunmadığını varsayıp aff_id/sub_id yer tutucuları kullanıyordu. Bunlar kaldırıldı; doğrulanmış pid/mcid kullanılıyor.
3. Viator listeleri ayrı gömülü belgelerde kendi GA sayfa görüntülemesini ve tıklamasını kaydediyordu. Tıklama görünse de gerçek park sayfası/Almanca bağlamı kayboluyordu. Artık aynı alan adındaki gömülü listeden tıklama **ana sayfanın GA kaydına**, doğru park slug’ıyla tek kez gönderiliyor; ekstra liste sayfası görüntülemeleri kaldırıldı.

### Panelde neden yalnızca “2 yönlendirme” görünüyor?
Sizin baktığınız yerin **Viator ortaklık paneli** olduğunu esas aldım. Bu panelin tarih filtresini, hangi site/mülkü kapsadığını, trafik filtrelemesini ve medium=api/link raporlarının birleştirilmesini doğrudan okuyacak yetkili bağlantı yok. Dolayısıyla “2”nin kesin nedeni bu turda tespit edilemedi.
- Doğru bağlantının gönderildiği kanıtlandı; Viator panelinin bunu kabul ettiği/raporladığı kanıtlanmadı.
- Eski Awin yolu olası kayıp nedenidir; tarihsel etkisi ölçülemedi.
- GA bağlam düzeltmesi Viator panelindeki sayıyı kendi başına artırmaz; bunlar farklı sistemlerdir.
- Yerel click_events tablosunda 55 toplam olay, Viator’a ait 10 olay var. Gerçek API kartları bu tabloyu kullanmadığından bu sayı Viator paneliyle karşılaştırılamaz; gerçek ve test trafiği ayrımı da kanıtlanmadı.
- Viator ürün sayfası test tarayıcısında otomatik erişim engeline takıldı (403). Yeni sekmede doğru adres/kod görüldü ama ürün sayfasının içeriği ve ilişkilendirme çerezi doğrulanamadı.

**Hesap tarafında gerekli kontrol:** P00327298 hesabında WildParkRoutes alan adının kayıtlı olduğunu, tüm siteler/tarih aralığı ve API + manuel link raporlarını kapsayan görünümü doğrulayın. MiniaLife eski site kaydı bulunması tek başına hata değildir. Yeni bir hesap açmayın veya pid’yi değiştirmeyin.

## 2. Ortaklar ve takip kodları
| Ortak | Kullanılan kimlik | Sonuç |
|---|---|---|
| Viator | P00327298 / 42383 | Gerçek API linklerinde doğru; eski Awin/adaptör yolu düzeltildi. Viator panelindeki kabul/komisyon doğrulanmadı. |
| Awin yayıncı | **3115962** | Ortak üretici, ürün katalogları ve örnek son hedeflerde doğru. 3100034 bulunmadı. |
| Campspot | Awin **22326** | 200; son adreste sv_campaign_id=3115962 ve awc=22326… korundu. |
| RoverPass | Awin **32065** | 200; son adreste aw_affid=3115962 ve awc=32065… korundu. |
| Harvest Hosts | Awin **111454** | 200; yayıncı, reklamveren ve MINIALIFE20 kampanya kodu korundu. |
| ROCKBROS | Awin **58007** | 7.521 besleme bağlantısı doğru; örnek ürün 200 ve 3115962/58007 takip bilgisi son hedefte mevcut. |
| WILDGUARDER | Awin **126831** | HTTP taraması 502 verdi, gerçek tarayıcı testi 200 açıldı; utm_id=3115962… ve awc=126831… korundu. Kalıcı bozuk link olarak sınıflandırılmadı. |
| Jackery | Awin **59183** | 3.231 yayındaki yerle ilişkili kayıt, ortak üreticide doğru yayıncı. Bu turda Jackery son mağaza/satış akışı ayrıca doğrulanmadı. |
| Airport Rentals | **affiliate=minialife** | 200; onaylı kod mevcut. Marka değişti diye kod WPR yapılmadı. |
| Motorhome Republic | **affiliate=minialife** | Ülke hedefleri ve kampanya kontrol edildi; ABD eski hedefindeki kod kaybı ve Hollanda/diğer ülke yanlış hedefleri düzeltildi. |
| Expedia | camref **1101l6uPqy**, creativeref **1100l68075** | Kayıtlı link üretici ve canlı düğme uyumlu; sağlayıcı insan doğrulaması/429 nedeniyle son rezervasyon sayfası doğrulanamadı. |
| Vrbo | camref **1110lRsGV**, creativeref **1101l63118** | Expedia’dan farklı doğru kayıtlı kod; sağlayıcı 429/insan doğrulaması engeli nedeniyle rezervasyon sayfası doğrulanamadı. |
| Travelpayouts | **786282** | Sağlanan kısa linkler korundu; Aviasales, Klook ve diğer örnek yönlendirmelerde 786282 zincirde görüldü. |
| Aviasales | oJDSEshT | 200; son hedef marker=786282… |
| Airalo | Cl55ghx0 | 200; Impact üzerinden affiliate yönlendirmesi oluştu, Travelpayouts zinciri mevcut. Son hedefte Travelspark Limited görülmesi ağın aracı hesabıdır; tek başına yanlış sahiplik kanıtı değildir. |
| Radical Storage | cRmtR6gn | 200; track_id içinde 786282. |
| Tiqets | wCgtWj6C | 200; partner=travelpayouts.com ve kampanya/tıklama kimliği içinde 786282. |
| Klook | nayF33og | Yönlendirme doğru ağ kodlarıyla oluştu; sağlayıcı 403 nedeniyle ürün erişimi doğrulanamadı. |
| Go City | pZP8UD8I | Yönlendirmede 786282 mevcut; sağlayıcı güvenlik engeli/403. |
| EKTA | uPEvRPbe | **Gerçek engel: 400, “marker is not subscribed to campaign”.** Kod yazım hatası değil, hesabın program üyeliği/onayı eksik. |
| BikesBooking | Q26wdHFR | Kayıtlı kısa link 200, alt kimlikte 786282; araç kiralama politikasına göre mevcut görünürlüğü ayrı konu. |
| EconomyBookings / QEEQ | Ldg7kknv / uGwBnrsc | Eski kayıtlı kısa linkler mevcut; emekliye ayrılan kiralama ortakları olarak yeniden etkinleştirilmedi. EconomyBookings 403, QEEQ 200. |

Diğer genel kayıtlarda Outdooractive=29649, Generali=49127, BNESIM=99589 var; eksik ağ numarası bulunan Awin satırı görülmedi. Bu numaraların güncel program onayını ve bu düşük görünürlüklü ortakların son hedeflerini bu turda bağımsız partner-panel belgesiyle sertifikalandıramadım.

REI bağlantıları bilerek doğrudan/komisyonsuzdur. Hipcamp, Glamping Hub, Arrive Outdoors, AllTrails, Wise ve World Nomads için veritabanında doğrudan kayıtlar bulunması onaylı gelir ortaklığı olduğu anlamına gelmez; bunlara yeni takip numarası uydurulmadı ve mevcut görünürlük filtreleri değiştirilmedi.

## 3. Motorhome Republic düzeltmeleri
- Eski **/usa/** hedefi 200 ana sayfaya yönleniyor ama affiliate=minialife parametresini kaybediyordu. Gerçek resmi menüdeki **/united-states-rv-rental?affiliate=minialife** doğrulandı (200) ve ortak üreticide eski USA yolları buna düzeltildi. Black Friday kampanya linki korundu.
- Hollanda için ülke bağlantısı yerine ABD kampanyası kullanılıyordu. **/netherlands-motorhome-rental?affiliate=minialife** doğrulandı ve düzeltildi.
- Destinasyon kartından kaydedilen tıklama ülke bilgisini kullanmayıp ABD varsayımına dönüyordu. Artık destinasyonun ülkesi okunuyor. Norveç EN/DE gerçek tıklamasının son adresi **/norway-motorhome-rental?affiliate=minialife** oldu.
- Ortak ülke tablosunda olmayan Polonya gibi yerlerde Kanada’ya sessiz geçiş vardı. Bunun yerine açık genel sağlayıcı araması ve aynı takip kodu kullanılıyor; yerel stok/hizmet varlığı iddiası eklenmedi.
- Kontrol edilen diğer 15 ülke URL’si 200 ve takip kodunu korudu; AU/NZ hedefleri de 200. Her ülkede gerçek tarih/sürücü bilgisiyle rezervasyon oluşturulmadı.

## 4. Diğer raporlama düzeltmeleri
- EN /destinations/us/wyoming/yellowstone yolunda ülke kodu yerine gerçek park slug’ı kaydediliyor.
- Almanca /de öneki ayrıştırılıyor; Almanca park tıklamaları doğru sayfa türü/parkla kaydediliyor.
- Airalo, EKTA, Radical Storage, Klook, Tiqets ve Go City artık yanlışlıkla “uçuş” sayılmıyor.
- Campspot, RoverPass, Harvest Hosts ve ekipman mağazaları ayrı ortak adı/kategorisiyle ölçülüyor.
- Mevcut tıklama olayı GA kuyruğunda doğrulandı; Google’ın raporlarında işlenmesi/hesaplar arası birleşmesi ayrıca doğrulanmadı.

## 5. Açık kalanlar ve yapılacaklar
1. **Yayın:** Bu kod düzeltmeleri için siteyi yeniden yayınlayın. Denetimde canlı sürüm ile önizleme ayrı kontrol edildi; düzeltmenin canlıya taşındığı iddia edilmiyor.
2. **EKTA:** Travelpayouts’ta EKTA programına üyelik/onay durumunu tamamlayın, sonra sağlayıcının verdiği yeni link varsa paylaşın. Onay olmadan farklı bir sigorta kodu veya komisyonsuz hedefe sessiz geçiş yapılmadı; mevcut hatalı bağlantı korunarak açık blocker olarak raporlandı.
3. **Viator:** Hesap panelinde doğru hesabı, yeni alan adı kaydını, tüm site/tarih filtrelerini ve API/manual trafik kapsamını kontrol edin; yalnız “2” görüntüsü nedeni belirlemeye yetmez. Hesap paneline erişim olmadığı için bu açık kalır.
4. **Dış güvenlik engelleri:** Expedia/Vrbo, Viator, Klook ve Go City için son sayfa ve rezervasyon kabulü normal ziyaretçi ortamında ayrıca kontrol edilmeli. 403/429 otomatik ortam engeli, tek başına yanlış affiliate numarası kanıtı değildir.
5. **Komisyon:** Hiçbir satın alma yapılmadığı için satış sonrası cookie/attribution/komisyon onayı bütün ortaklarda açık kalır.

## 6. Kod değişiklikleri — eksiksiz liste
- src/lib/affiliates/viator.ts: onaylı doğrudan Viator helper/adaptörü.
- src/lib/affiliates/awin.ts: tarihsel Viator Awin satırlarını doğrudan hesaba yönlendirme.
- src/lib/affiliates/viatorSearch.ts: aynı ortak helper’ını kullanma.
- src/lib/affiliates/track.functions.ts: kiralama tıklamasında gerçek destinasyon ülkesini okuma.
- src/lib/affiliates/webjet.ts: eski USA yolunu resmi ABD adresine düzeltme.
- src/lib/affiliates/countryPartners.ts: Hollanda hedefi ve doğrulanmış yönlendirme notları.
- src/lib/affiliates/corridorPartners.ts: desteklenmeyen ülkeyi Kanada’ya göndermeme.
- src/lib/affiliateTracking.ts: ortak/kategori ve EN/DE park bağlamı düzeltmeleri.
- src/lib/analytics.ts: aynı alan adındaki gömülü Viator tıklamalarını ana sayfa bağlamında ölçme.
- İlgili testler: viator.test.ts (yeni), webjet.test.ts, countryPartners.test.ts, corridorPartners.test.ts, rentalPolicy.test.ts, affiliateTracking.test.ts, analytics.test.ts.
- src/lib/affiliates/AGENTS.md (yeni): takip ve ülke hedefi kuralları; roadmap.md: bu denetimin durumu.

Veritabanı teklifleri, ortak hesapları, secret’lar ve onaylı publisher/pid/mcid/affiliate kodları değiştirilmedi. **MiniaLife adı Webjet affiliate kodunda ve Harvest Hosts MINIALIFE20 kampanyasında bilinçli korundu; bunlar marka yazısı değil, verilmiş hesap/kampanya kimliğidir.**

## 7. Son ortak-yol kontrolü
**Kural:** Ziyaretçinin gördüğü ortaklık bağlantısı, verilmiş hesap kimliğini koruyarak doğru sağlayıcıya gitmelidir; farklı sayfa veya dil bunu değiştirmemelidir.

| Ziyaretçinin karşılaştığı yol | Okunan/çalıştırılan yer | Kuralın durumu |
|---|---|---|
| Ana sayfa kiralama kartları ve sağlayıcı formu | RentalSearch.tsx; ortak Webjet üreticisi | Kod minialife, yedek bağlantılar ortak üreticiden. Sağlayıcı formunda gerçek tarihli arama henüz doğrulanmadı. |
| İngilizce/Almanca destinasyon kartları | DestinationPageView, TopShowcase, trackAndRedirect, destinations.functions | Düzeltilmiş üretici/gerçek ülke ve tıklama yolu kullanılıyor; Norveç EN/DE gerçek geçişi çalıştırıldı. |
| Ana sayfa, park üst/alt tur ve rota tur belgeleri | Üç experiences route dosyası, viatorPlace/corridorExperiences işlevleri | Gerçek API linkleri doğrulanıyor; gerçek Viator tıklaması çalıştırıldı. Önbellekten dönen tüm mevcut URL kimlikleri ayrıca tarandı. |
| Fly & Drive, diğer rehberler, rota/koridor rezervasyonları | FlyDriveSections, CorridorBookings; ortak Webjet/Expedia/Vrbo/Travelpayouts üreticileri | Okunan bağlantı yolları ortak üreticileri kullanıyor. Bu turda her rehber sayfasında ayrı dış tıklama çalıştırılmadı. |
| Arama rehberi ve eski teklif kartları | landingPages.functions, LandingOfferCard, ortak trackAndRedirect | Arama verisi yeni bir affiliate URL üretmiyor; kart tıklaması ortak düzeltmeden yararlanıyor. |
| Trip Builder gecelik kamp araması | tripBuilder.ts | Campspot 22326 / RoverPass 32065 ve ortak Awin üreticisi; mevcut testler kapsıyor. |
| Gear Shop kategorileri, ürün rehberleri, gezi ekipmanları | gearShop.functions, rockbrosGear, TripEssentials | Katalog/ortak Awin üreticisi; tüm katalog kimlikleri ve ilgili testler kontrol edildi. |
| İçerik üretimi ve ürün beslemesi | apply-wave.py, publish-fr-pt-gr.py, build-gear-categories.py; Nordic produce çağrı noktası | Eski üreticiler hâlâ Viator Awin=11018 ve bazı etiketsiz ham Webjet URL’leri saklayabiliyor; ziyaretçiye çıkışta ortak düzeltici bunları doğru hesaba dönüştürüyor. Ham kayıtlar/üretim işleri çalıştırılmadı; yayın ve geçmiş kayıtlar değiştirilmedi. Ürün kategori üreticisi 3115962/58007 kontrolü yapıyor. |
| Uçuş önbellek yenilemesi | flights.functions.ts | Fiyat bilgisi getiriyor, ziyaretçi takip linki üretmiyor; rezervasyon linki Travelpayouts üreticisinden. |
| Veritabanı işlevleri/eski ağ ataması | Şema kartı ve ilgili migration tanımları | Eski migration Viator’a Awin metadata atamış; mevcut çıkış kuralı bunu düzeltir. Tıklama, geçmiş olay veya tamamlanmış işlem kayıtları değiştirilmedi. |

Bu son kontrol yeni bir davranış hatası ortaya çıkarmadı; mevcut düzelticilerin farklı yapılmış yolları da kapsadığı kaynak okuyarak doğrulandı. Partner paneli, EKTA program onayı, sağlayıcı güvenlik engelleri, gerçek rezervasyon formu ve satış sonrası komisyon doğrulaması açık kalır.

# WildParkRoutes — arama görünümü ve otorite denetimi

## Tamamlanan işlemler

- Süleyman'ın mevcut Google Search Console bağlantısı projeye bağlandı. Google'ın `/sites` yanıtından alınan doğrulanmış **`https://wildparkroutes.com/`** mülkü kullanıldı; mülk adı tahmin edilmedi.
- `https://wildparkroutes.com/sitemap.xml` gönderimi **204** ile kabul edildi. Ardından okunan kayıt: **0 hata, 0 uyarı**, beklemede değil. Google 9.966 web adresi ve 4.586 görsel bildiriyor; bunlar dizine alınmış sayfa sayısı değildir. Kullanımdan kaldırılan `indexed` alanı değerlendirilmedi.
- Ana sayfanın Google dizinindeki kopyası **Submitted and indexed / PASS**. Google ve kullanıcı canonical adresleri aynı: `https://wildparkroutes.com/`. Son tarama: 15 Kasım 2026. Bu sonuç yalnızca ana sayfa içindir; canlı Google testi veya yeniden indeksleme talebi değildir.
- Canlı sitemap dizininin **245 alt dosyası** okundu: tamamı 200 ve geçerli XML. **16.584 URL kaydı / 12.907 benzersiz sayfa adresi** var; tüm sayfa `<loc>` değerleri `https://wildparkroutes.com/` altında, boşluk veya bozuk karakter yok. Dosyalar arasında bazı adresler tekrarlanıyor; Google'ın hata raporu yok. Bu çalışma her 12.907 hedef sayfanın durumunu tekrar taramadı.
- Eski alan adının dört HTTP/HTTPS ve www ana sayfa biçimi ile 24 ülke eşlemesinin www/www olmayan biçimleri: **52/52**, yalnızca 301 zincirleri üzerinden yeni domaindeki 200 sayfalara ulaşıyor. HTTP ana sayfada önce HTTPS'e, sonra yeni domaine iki 301 var. Diawling'in kaldırılmış eski sayfası 410; bu davranış değiştirilmedi.

## Düzenlenen arama ve paylaşım metinleri

| Sayfa | Başlık | Başlık/açıklama uzunluğu |
|---|---|---|
| `/` | National Park Road Trip Planner — WildParkRoutes | 48 / 151 |
| `/de` | Nationalparks & Roadtrips planen \| WildParkRoutes | 49 / 142 |
| `/destinations` | National Parks by Country — WildParkRoutes | 42 / 153 |
| `/de/destinations` | Nationalparks nach Land entdecken \| WildParkRoutes | 50 / 148 |

Ana sayfa ve destinasyon dizini açıklamaları Avrupa, Kuzey Amerika, Avustralya ve Yeni Zelanda kapsamını gösteriyor; eski dar ABD/sekiz ülke anlatımı ve sabit destinasyon sayısı kaldırıldı. Ana sayfa başlığı artık kısa geri dönüş metnine düşmeden hem “national park” hem “road trip planner” içeriyor. İngilizce ve Almanca açıklamalar görünür çok günlük planlar ve haritalarla uyumlu; doğrulanmış rezervasyon/ulaşılabilirlik garantisi verilmedi.

Ana sayfanın EN/DE Open Graph ve Twitter etiketleri aynı **1200×630 / 268.986 bayt** Dolomitler fotoğrafını kullanıyor. Fotoğraf ana sayfanın ilk kolajındaki gerçek fotoğrafın kırpılmış kopyası; stok/başka yer fotoğrafı veya yeni bir yapay görsel değil. Kaynak değişirse bu kopyanın etiketleri verilmez. Etiketler kök şablona değil ilgili sayfalara eklendi. Başlık, açıklama, tek canonical ve görselin açılması tarayıcıda kontrol edildi; sayfa hatası görülmedi. Diğer içerik sayfalarının mevcut ayrı `head()` düzeni korundu; `de.tsx` yalnızca düzen şablonu, `$landing` eski adres yönlendirme/404 sayfası.

Fotoğraf: **kallerna**, [Faloria Cortina d'Ampezzo 10](https://commons.wikimedia.org/wiki/File:Faloria_Cortina_d%27Ampezzo_10.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0). Paylaşım kopyası kırpılmıştır ve aynı lisansla dağıtılır; kaynak/lisans kod açıklamasında, fotoğraf adı ve lisans görselin alternatif metninde korunur.

## Otorite backlinkleri — gerçekte ne doğrulandı?

Semrush anlık profili, Google'ın ölçümü değildir:

- Eski alan adı: **654 backlink / 325 yönlendiren alan adı**, Authority/Trust **4/100**. Görülen gerçek adaylar: Bulgaristan ormancılık kurumu **iag.bg** (150 bağlantı), eğitim portalı **schule.at** (12), **tarcu.ro** (4).
- Yeni alan adı: **281 backlink / 47 yönlendiren alan adı**, Authority/Trust **0/100**; 234 bağlantı `minialife.com` kaynaklı görünüyor. Bu sayılar taşınmanın başarısız olduğunu veya Google sıralamasını kanıtlamaz.
- Her iki profilde de konuyla ilgisiz SEO/PBN satış ifadeleri ve düşük nitelikli alan adları var. Bunların kullanıcı tarafından satın alındığı, Google cezası oluşturduğu veya tek başına reddedilmesi gerektiği sonucuna varılmadı. **Disavow yapılmadı; ücretli/PBN bağlantı satın alınmadı.**
- Sağlam 301'ler ve yeni canonical adresleri otorite aktarımının teknik temelini koruyor. Bu tur yönlendirme kodu değiştirilmedi: mevcut kurallar canlıda çalışıyor. Harita gönderimi de yeni içeriklerin keşfine yardımcı olur, yeni harici backlink oluşturmaz.
- Eski ülkelerdeki bilinmeyen park adresleri mevcut güvenli ülke hedeflerine gider. Arşivden kesin park kimliği elde edilmeden özel park eşlemesi uydurulmadı; tüm eski park URL'lerinin kurtarıldığı iddia edilmez.

### Dışarıda yapılması gereken güçlendirme

1. iag.bg, schule.at ve tarcu.ro gibi gerçek ilgili kaynaklardaki bağlantıların bulunduğu sayfaları ve hedeflerini tek tek doğrulayıp, sahiplerinden bağlantıyı yeni URL'ye güncellemelerini istemek. Semrush özeti kaynak sayfa adreslerini vermediği için bu tur kaynak sayfa sahibi adına mesaj gönderilmedi veya gönderilmiş gibi gösterilmedi.
2. Güncelleme isterken eski hedef ana sayfaysa `https://wildparkroutes.com/`, ülke sayfasıysa ilgili yeni ülke sayfası, park kimliği kesinleşirse ilgili gerçek park sayfası kullanılmalı; tüm bağlantılar ana sayfaya zorlanmamalı.
3. Search Console Adres Değişikliği işleminin tamamlanması kullanıcı arayüzünden kontrol edilmeli. Bu tur araç üzerinden başlatılmadı; önceki tamamlanma durumu doğrulanmadı. Sahiplik, erişim ve 301 kontrolü Google'ın bu işlemi kabul ettiği anlamına gelmez.
4. Sadece ispatlanmış zararlı bağlantılar ve manuel işlem gibi gerekçelerle ayrıca disavow değerlendirmesi yapılmalı; skor düşüklüğü tek başına yeterli değil.

Bağlantı güncelleme isteği için İngilizce taslak:

> Subject: Update to your national parks resource link
>
> Hello, your page links to a resource on world-national-parks.net. The relevant visitor guides are now available at WildParkRoutes, with country guides, route maps and English/German itineraries. Would you consider updating the old link to the matching page at [verified new destination URL]? The old address still redirects. Thank you for keeping your resource list current.

## Kod değişiklikleri ve doğrulama

- `src/lib/seo/hubSeo.ts`: EN ana sayfa başlığı/açıklaması ve destinasyon dizini açıklaması.
- `src/routes/index.tsx`, `src/routes/de.index.tsx`: sayfaya özgü paylaşım fotoğrafı ve Twitter metinleri; EN dil bilgisi, DE karşı dil bilgisi; DE arama metni.
- `src/routes/de.destinations.index.tsx`: dünya kapsamlı Almanca başlık/açıklama.
- `src/lib/seo/homeShare.ts`: görünen fotoğraf kimliğiyle eşleşen kredili paylaşım kopyası.
- `src/assets/seo/dolomites-share.jpg.asset.json`: dışarıda depolanan fotoğrafın kaynak işaretçisi.
- `src/lib/seo/AGENTS.md`, `roadmap.md`: kural ve görev kaydı.
- **53 test geçti**, son önizleme derlemesi başarılı. Dört sayfa tarayıcıda kontrol edildi; EN/DE fotoğraf kopyaları aynı, 200 ve 1200×630.

**Yayın durumu:** Bu tur site yayımlanmadı. Yeni başlıklar/açıklamalar/paylaşım etiketleri sonraki yayında canlıya ulaşır; site haritası gönderimi ise zaten tamamlandı ve yeni bir yayın beklemiyor. Google sonuç metnini yeniden taramada güncelleyebilir veya kendi metnini seçebilir; sıralama, trafik artışı ve tüm backlink değerinin aktarımı garanti edilmez.
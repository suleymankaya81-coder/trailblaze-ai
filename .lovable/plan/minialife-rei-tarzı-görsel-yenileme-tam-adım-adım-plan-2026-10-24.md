# MiniaLife REI tarzı görsel yenileme: tam, adım adım plan

Bu plan iki ek dosyadaki konuşmanın tamamını kapsıyor (REI incelemesi + entegrasyon yol haritası). Önceki turda bazı adımlar "yapıldı" diye işaretlendi ama ikon kullanımı, kart ölçüleri, serif başlıklar, editoryal yeşil kartlar ve mobil kaydırma her sayfada tutarlı değil. Bu sefer her adım ayrı yapılacak, bittiğinde sana ekran görüntüsüyle gösterilecek ve onayından sonra diğerine geçilecek.

Verdiğin kararlar:
- Küçük resimler karışık olacak: yerler için gerçek lisanslı fotoğraf, kavramlar (uçuş, araç, çadır, ekipman) için tek stilde üretilmiş görsel.
- Yıldız ve yorum yalnızca Viator turlarında, Viator'un kendi puanı varsa gösterilecek.
- Tüm başlıklar serif (Fraunces) olacak.
- Sıra: önce ana sayfa, sonra diğer sayfalar.

Değişmeyecekler: Gear Shop tasarımı, onaylı partnerler (Airport Rentals, Motorhome Republic, Viator, ROCKBROS/Awin), paketleme ve "ekstra bilgi" panellerinin yasağı, "tipik fiyat" etiketleri. Turuncu buton kullanılmayacak.

---

## 0. Ortak tasarım sistemi (her şeyin temeli)

### Renkler (mevcut paleti REI tonlarına yaklaştırıyoruz)
| Rol | Değer | Kullanım |
|---|---|---|
| Sayfa zemini | sıcak taş #F7F6F2 | tüm sayfa arka planı |
| Kart | beyaz #FFFFFF | tüm kartlar |
| Kart çerçevesi | #E6E4DF, 1px | gölge yerine |
| Küçük resim zemini | açık bej #EFEDE6 | kategori karelerinin içi |
| Ana yeşil | orman yeşili #1B4431 | butonlar, editoryal kartlar |
| Yeşil üstü metin | beyaz | |
| Vurgu (rozet) | hardal #F3D053 zemin, koyu metin | "Rezervasyon gerekmez", "Popüler" |
| Uyarı rozeti | kiremit #BA361A metin, açık zemin | "Yüksek rezervasyon talebi" (buton değil) |
| İkincil metin | koyu gri-kahve | açıklamalar |

Hepsi tasarım değişkeni olarak tanımlanacak; bileşenlerde sabit renk yazılmayacak.

### Yazı
- Başlıklar: Fraunces (serif), tüm h1–h3.
  - h1: telefonda 34px, masaüstünde 56px, satır aralığı 1.05.
  - Bölüm başlığı (h2): 26px / 36px.
  - Kart başlığı (h3): 18px / 20px.
- Gövde: sade sans-serif, 15–16px, satır aralığı 1.6.
- Üst etiket (kicker): 11px, BÜYÜK HARF, harf aralığı geniş, adaçayı yeşili.
- Fiyat: 18px kalın; yanında 11px gri "tipik fiyat".

### Boşluk ve ölçü
- İçerik genişliği en fazla 1280px; kenar boşluğu telefonda 16px, masaüstünde 32px.
- Bölümler arası 56px (telefon) / 88px (masaüstü).
- Köşe yuvarlaklığı: kart 12px, küçük resim kutusu 10px, rozet tam yuvarlak.
- Dokunma alanı: tüm buton ve sekmeler en az 48px yükseklik.

### Altı ortak kart şablonu (tüm sitede yalnızca bunlar)
1. **Kategori karesi** (REI "Shop top categories"): bej zeminli 1:1 kutu, içinde küçük resim, altında 14px ortalı ad. Masaüstü 5 sütun, tablet 4, telefon 3 sütun.
2. **Yer / rota kartı**: 4:3 fotoğraf, sol üstte en fazla 3 küçük rozet (ör. "7 gün · SFO · 4 durak"), serif başlık, 2 satır özet, altta solda bilgi/fiyat, sağda net eylem ("Rotayı incele").
3. **Rezervasyon kartı** (araç, karavan, konaklama, uçuş): 16:10 fotoğraf, marka etiketi, başlık, 2 güven rozeti (ör. "Ücretsiz iptal çoğu fiyatta"), "Tipik $45/gün" fiyat, tam genişlik yeşil buton.
4. **Ürün kartı** (ekipman): beyaz zeminde 1:1 ürün görseli, marka 13px kalın, ad 14px, fiyat, buton. Gear Shop'a dokunulmaz; bu şablon seyahat sayfalarındaki 4 ürünlük bölüm için.
5. **Editoryal yeşil kart** (REI "Expert advice"): koyu yeşil zemin, üstte 16:9 fotoğraf, beyaz serif başlık, 2 satır özet, beyaz zeminli yeşil yazılı buton. Rehber ve rota önerilerinde.
6. **İkiye bölünmüş tanıtım bandı** (REI "Ways to save"): masaüstünde %50 metin + buton, %50 görsel; telefonda görsel üstte, metin altta.

### Mobil kuralları
- 3+ kartlık sıralar telefonda yatay kaydırılır: ilk kart ekranın %85'i, sağdan ikinci kartın ucu görünür, kaydırınca kart tam oturur, altında ince ilerleme çizgisi.
- Filtreler telefonda tek "Filtrele" düğmesiyle açılan pencerede.
- Alt bilgi (footer) telefonda açılır-kapanır başlıklar.

### Küçük resim kütüphanesi (ikonların yerine)
- Yer kavramları (milli park, kıyı, çöl, dağ, rota): mevcut lisanslı destinasyon fotoğraflarından kırpılmış kareler.
- Kavramlar (uçuş, araç, karavan, konaklama, tur, ekipman, harita, rezervasyon, havalimanı): yaklaşık 12 adet, aynı ışık ve renk tonunda üretilmiş kare görsel (doğal ışık, bej-yeşil tonlar, yazısız).
- Lucide ikonlar yalnızca çok küçük yerlerde kalır (ok, kapat, menü, filtre).

---

## Adım 1: Ana sayfa (bitince göstereceğim)

Sıra yukarıdan aşağıya. Her bölümde kart sayısı belirtildi.

1. **Üst menü**: logo solda, arama ortada, Destinations / Road Trips / Trip Guides / Gear / About. Telefonda menü düğmesi + tam genişlik arama.
2. **Kapak (hero)**: tam genişlik manzara fotoğrafı, yükseklik masaüstü 620px / telefon 520px. Serif başlık "Your U.S. road trip, planned in one place.", tek cümle açıklama, büyük arama, altında tek yeşil buton "Start planning".
3. **Biz kimiz / Nasıl çalışır** (kapağın hemen altı, beyaz bant): sol tarafta 2 cümle "MiniaLife nedir"; sağda 3 adım. Her adım ikon yerine 72px küçük resim + numara + başlık + tek cümle:
   1. Parkını veya rotanı seç (500+ yer, 30 çoklu park rotası, 24 havalimanı çıkışlı rota)
   2. Planını tek sayfada topla (uçuş, araç/karavan, rezervasyon notları, konaklama)
   3. Partnerle rezervasyon yap (son fiyatı partner sitesinde gör)
   Altında küçük güven satırı: "Ücretsiz · Bağımsız rehber · Partner linklerinden komisyon alabiliriz".
   Telefonda 3 adım alt alta, küçük resim solda.
4. **Nereden başlamak istersin?** 5 kategori karesi (şablon 1): Milli parklar, Hazır rotalar, Havalimanından rotalar, Karavan & kamp, Seyahat ekipmanı. Masaüstü 5 sütun, telefon 3+2.
5. **Öne çıkan yerler**: 1 büyük + 4 küçük yer kartı (şablon 2), rozetler: en iyi sezon, havalimanı, rezervasyon durumu. Telefonda yatay kaydırma. (Şu anki 7 karttan 5'e indiriyoruz.)
6. **Hazır rotalar**: 4 rota kartı, fotoğraflı, "X gün · havalimanı · durak sayısı" rozetleri. "Tüm rotalar" bağlantısı.
7. **Araç ve karavan bandı** (şablon 6): solda Motorhome Republic + Airport Rentals arama alanı, sağda 3 rezervasyon kartı (standart araç, SUV, karavan) tipik fiyatlarla.
8. **Konaklama türleri**: 3 kart (park içi/yakını, kasaba kabini, RV & kamp), tipik başlangıç fiyatı.
9. **Rehberler** (editoryal yeşil, şablon 5): 3 kart — Fly & Drive, Rezervasyonsuz parklar, RV & kamp.
10. **Seyahat ekipmanı**: 4 ürün kartı + "Gear Shop'a git".
11. **Neden MiniaLife** (REI "Why shop at REI" karşılığı): 4 küçük resimli değer satırı — Ücretsiz planlar, Gerçek rota haritaları, Onaylı partnerler, Bağımsız rehber. Uydurma sayı veya tarih yok.
12. **Alt bilgi**: masaüstü 4 sütun, telefonda açılır başlıklar.

Mevcut koyu "A complete trip plan, free" bölümü 9 ve 11 ile birleştiği için kaldırılacak.

---

## Adım 2: Destinasyon listesi ve rota/rehber merkezleri

Sayfalar: Tüm destinasyonlar, Road Trips, Gateway Road Trips, Trip Guides, Fly & Drive, RV & Camping, No Reservation merkezleri.

- Ortak fotoğraflı kapak (yükseklik 360px / telefon 300px), serif başlık, kısa açıklama.
- Kapağın altında kategori kareleri: destinasyonlarda 4 kare (Milli parklar, Kıyılar, Çöller, Dağ & orman) + bölge seçimi; rota sayfalarında süre (3–5 / 6–9 / 10+ gün) ve bölge.
- "Öne çıkanlar" sırası: destinasyonlarda en popüler 6 park, rotalarda 1 büyük öne çıkan rota.
- Liste: şablon 2 kartlar, masaüstü 3 sütun, tablet 2, telefon 1 (liste sayfalarında kaydırma değil alt alta). 24'erli "Daha fazla göster".
- Trip Guides: 6 editoryal yeşil kart + "En çok okunan rehberler" 6 kart.
- Telefonda filtreler tek düğmeyle açılan pencerede.

## Adım 3: Destinasyon sayfaları (500 sayfa, tek şablon)

Sıra:
1. Kapak: fotoğraf, serif başlık, rozetler (sezon, havalimanı, rezervasyon talebi), kısa © kredi.
2. Trip Snapshot: 5 bilgi, ikon yerine 40px küçük resim (havalimanı, sürüş, gün, rezervasyon, araç/sezon). Telefonda 2 sütun.
3. Yapışkan hızlı menü: Plan & rota · Uçuş, araç & konaklama · Turlar · Ekipman. 48px düğmeler.
4. Plan & rota: harita + 3–4 günlük plan (mevcut içerik, yeni başlık stili).
5. Rezervasyon akışı, numaralı ve sırası sabit:
   - Adım 1 Uçuş: 1 kart (havalimanı fotoğrafı, son ücret rozeti 40$ altıysa gizli).
   - Adım 2 Araç/karavan: 3 kart (standart araç, SUV, karavan).
   - Adım 3 Konaklama: seçim rehberi (3 kare) + 3 konaklama kartı.
   - Adım 4 Turlar: Viator canlı listesi, yalnız Viator puanı varsa yıldız + yorum sayısı, "Ücretsiz iptal"/"Mobil bilet" rozetleri.
   - Adım 5 Ekipman: 4 ürün kartı.
   Telefonda her adımın kartları yatay kaydırma.
6. Hazırlık servisleri (eSIM, bavul emanet) numarasız, kompakt satır.
7. İlgili yerler: 4 yer kartı.
Paketleme ve "ekstra bilgi" panelleri yok.

## Adım 4: Rehber sayfaları (Fly & Drive, RV & Camping, No Reservation, rotalar, Gateway rotaları, arama sayfaları)

- Aynı kapak + Trip Snapshot + hızlı menü + numaralı 5 adımlı rezervasyon akışı.
- Rota sayfalarında durak listesi fotoğraflı yatay kartlar (küçük kare fotoğraf + gün + sürüş süresi).
- Gateway rotalarında "Uluslararası ziyaretçi notları" küçük resimli 4 kutu (ESTA, ehliyet, park kartı, otoyol ücretleri).
- SSS akordeon.
- Havalimanı verisi olmayan rotada rezervasyon kartları gösterilmez (uydurma yok).

## Adım 5: İçerik ve statik sayfalar (About, iletişim, gizlilik vb.)

- Ortak kapak bandı, serif başlıklar, okunabilir 680px metin genişliği.
- About: ikiye bölünmüş tanıtım bandı + "Nasıl çalışır" 3 adım tekrar.

## Adım 6: Son kontrol

- Her sayfa türünden en az 2 örnek; masaüstü (1280px) ve telefon (390px) ekran görüntüsü.
- Kontrol listesi: serif başlıklar, kart oranları, rozet sayısı ≤3, 48px dokunma, kaydırma ve ilerleme çizgisi, her kartta farklı görsel, fiyat etiketlerinin "tipik" olması, partner linklerinin takipli olması, sayfa hatası olmaması.
- Mevcut testler + yeni kurallar için testler (ör. telefonda kaydırma sırası bileşeni 4 ürün döndürür, Viator yıldızı veri yoksa çıkmaz).
- Yayınlama yalnızca sen istersen.

---

## Teknik detaylar

- Tokenlar `src/styles.css` içinde (`--stone`, `--card-border`, `--thumb-bg`, `--forest` #1B4431'e çekilir, `--mustard`, `--terracotta`); `--font-display` Fraunces'a geçer, Fraunces zaten yüklü. `@utility` ile `card-frame`, `swipe-row` (scroll-snap, `basis-[85%]`), `swipe-progress`.
- Yeni ortak bileşenler `src/components/ui-kit/`: `CategoryTile`, `PlaceCard`, `BookingCard`, `ProductCard`, `EditorialCard`, `SplitBand`, `SwipeRow` (ilerleme çizgisi dahil), `Thumb` (küçük resim), `Badge` varyantları. Mevcut `PartnerPhotoCard`, `DestinationCard`, `LandingOfferCard`, `TripEssentials` bu bileşenlere yönlendirilir; Gear Shop bileşenleri değişmez.
- Kavram görselleri `imagegen` ile 12 adet 768×768, `src/assets/thumbs/`; yer kareleri mevcut destinasyon kapaklarından (kredi korunur).
- Footer akordeonu shadcn `Accordion` ile yalnız `md` altında.
- Viator yıldızı: `viatorPlace.functions.ts` içinden `rating`/`reviewCount` yalnızca API döndürürse.
- AGENTS.md'ye "kart şablonları ui-kit'te, yeni kart türü eklenmez" kuralı; memory'ye renk/yazı kararları.
- roadmap.md her adımda güncellenir.

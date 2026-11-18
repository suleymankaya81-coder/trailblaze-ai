# Hollanda, Belçika, Danimarka ve İrlanda — katalog paketi

18 Kasım 2026. **588 araştırma/üretim adayı; sayfa yayını yapılmadı.**

| Ülke | Kayıt |
|---|---:|
| Hollanda (`nl`) | 305 |
| Belçika (`be`) | 60 |
| Danimarka (`dk`) | 64 |
| İrlanda (`ie`) | 159 |

Her ülkenin ayrı JSON kataloğu ve toplam 26 adet en fazla 25 kayıtlık gönderim dosyası vardır. `batch-manifest.json` hiçbir girdinin kaybolmadığını gösterir. Danimarka'nın mevcut 64 kaydı aynen korunur. Faroe/Grönland Danimarka'ya, Kuzey İrlanda İrlanda Cumhuriyeti'ne eklenmez.

## Kapsam denetimi

- Hollanda: Nationale Parken dizinindeki 22 başlık ve Natuurmonumenten ana alan sayfaları. Dizinin 22 başlığı, yasal olarak 22 millî park olduğu anlamına gelmez: resmî açıklamalar 21 der; Hollandse Duinen statüsü ve De Groote Peel → De Peel geçişi ayrıca işaretlendi. Alt haber/etkinlik/rota sayfaları, kaleler ve genel konular ayıklandı. Küçük alanlar kaybolmamak için araştırma havuzunda tutuldu; **305 ayrı kapsamlı gezi sayfası otomatik yayımlanacak demek değildir**. Bazı alanlar ana parkın alt bölgesidir; üretimde ana/alt yer ilişkisi incelenmelidir.
- Belçika: Flandre'nin 4 millî + 5 peyzaj parkı, Valonya'nın 2 millî + 13 doğa parkı eşlendi. Ek doğal durakların bir bölümü araştırma adayıdır; kaynak dizini tam yer kanıtı sayılmaz. Terhills/Connecterra aynı kayıt kabul edildi.
- Danimarka: önceki 64 aday korunur; 5 millî park ve 17 doğa/pilot park listesiyle eşleşir. Güncel doğa/pilot başlıkları tekrar indirildi. Eski koordinatlar keşif bilgisidir, ziyaretçi giriş noktası değildir.
- İrlanda: hükümetin 8 parkı ve NPWS'nin 17 il sayfasındaki 75 farklı koruma alanı; ayrıca 76 ikonik doğal yer/rota adayı. Slieve Bloom iki ilde geçse de bir kayıt. Resmî turizm park dizini 7 park gösterirken hükümet Brú na Bóinne'yi de sayar; arkeolojik ağırlığı ayrıca belirtilmiştir. Özel ve kapalı rezervler sırf listede bulunduğu için gezilebilir kabul edilmez.

`coverage.json` isim bazında eşlemeleri; `exclusions.json` ayıklanan/erişilemeyen alanları; `evidence/` tekrar indirmeden kullanılabilecek belgeleri içerir. Resmî envanter kapsamı kontrol edildi; dünyadaki her küçük koruma alanının veya turistik yerin eksiksiz listelendiği iddia edilmez.

## Otorite domain kontrolü

Eldeki tarihî Avrupa sayfasında Hollanda `/eu/ne/ne.htm`, İrlanda `/eu/ir/ir.htm` olarak doğrulandı. İki ülkenin arşiv sayfalarını tekrar açma denemesi 404 verdi; **eski park adlarının tamamı kurtarıldı denemez**. Belçika ve Danimarka eldeki menüde yok; bu durum tarihî sayfalarının hiç var olmadığını kanıtlamaz. Detaylar `authority-audit.json` ve `evidence/authority-europe.txt` içindedir.

## Üretimden önce kalan doğrulamalar

Kimlik, bölge, doğru ülke, ana/alt alan tekrarı, gerçek ziyaretçi uygunluğu, resmî erişim, kaynaklı 1–3 günlük plan, doğrulanmış koordinat ve lisanslı aynı-yer fotoğrafı. Bilinmeyen yeni koordinatlar null bırakıldı; fotoğraf ve Almanca çeviri bu katalog işi kapsamında üretilmedi.

`research_candidate` kayıtları ve `scope_review` alanları bu ayrımı gösterir. Sayıları artırmak için eksik bilgi uydurulmadı. Ücretli AI çağrısı yapılmadı; katalog hazırlığı mevcut kaynaklar ve ücretsiz belge indirmeleriyle tamamlandı.

Yeni Hollanda/Belçika/İrlanda kayıtlarında toplam 524 konum henüz doğrulanmadığından null; Danimarka'da 46 konum null. Hollanda'nın 305 bölgesi ve Danimarka'nın 3 bölgesi henüz eşlenmedi. Bunlar kaynak toplama aşamasının açık işleri, tamamlanmış gezi sayfaları değildir.

## Dosyalar ve kullanım

`PROMPT.md` ve `schema.json` kaynaklı içerik çıktısı içindir. `build_catalogs.py` yalnız saklanan belgelerden yeniden derler; `validate_catalogs.py` ve `test_catalogs.py` çevrimdışı kontrollerdir. Sayfa üretimi/yayın için mevcut kaynak ve yayımlama denetimleri ayrıca çalıştırılmalıdır.
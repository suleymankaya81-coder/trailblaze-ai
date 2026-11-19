# Avustralya ve Yeni Zelanda — Nordik biçiminde katalog

Bu paket **sayfa üretim girdisidir**; destinasyonlar yayımlanmadı ve kataloğun varlığı ziyaretçi erişiminin doğrulandığı anlamına gelmez.

## Dosyalar

- `au-catalog.json`, `nz-catalog.json`: Nordik temel alanlarını koruyan ülke dizileri.
- `coverage.json`: CAPAD kimlikleri, Yeni Zelanda’nın 13 güncel parkı ve 11 Great Walk karşılaştırması.
- `inventory-discrepancies.json`: Wikipedia ile 2024 resmî arazi envanteri arasındaki ad/kapsam farkları; üretimden önce incelenir.
- `territories-supplement.json`: Avustralya dış toprakları; ana kara araç rotası gibi işlenmez.
- `authority-audit.json`: eski otorite sitesinden kurtarılan ülke adresleri ve Avustralya park adları; belirsiz eşlemeler açık bırakılır.
- `exclusions.json`: önerilen parklar ve yalnız National Parks Act adı geçen, seçili güncel park türüne girmeyen arazi kayıtları.
- `sources.json`, `evidence/`: indirilen kaynaklar ve tekrar araştırmayı önleyen saklanmış kimlik sorguları; park fotoğrafları değildir.
- `batches/`, `batch-manifest.json`: 25 kayıtlık kayıpsız, ülke sıralı dosyalar.
- `PROMPT.md`, `schema.json`: kanıta dayalı İngilizce içerik üretimi; Almanca çeviri doğrulanmış içerikten sonra.
- `build_catalogs.py`, `collect_identities.py`, `validate_catalogs.py`, `test_catalogs.py`: yeniden kullanılabilir hazırlama ve kontrol araçları.

## Kapsam ve üretim sırası

Avustralya: sekiz eyalet/bölge + Jervis Bay; milli parklar, belgeli doğal yerler ve manzaralı rotalar. CAPAD **30 Haziran 2024** arazi envanteridir: 2026 açılış, kamp, yol ve rezervasyon kuralları değildir. Aynı parkın arazi parçaları birleştirilir; marine/scientific kayıtlar kamu erişimi kanıtlanmadan yayımlanmaz. Bütün küçük koruma rezervleri dahil değildir.

Yeni Zelanda: güncel 13 milli park, Te Urewera ayrı korunan alan olarak, orman/koruma parkları, 11 Great Walk ve ikonik doğal yerler. Egmont adı `Te Papa-Kura-o-Taranaki` altında korunur. Rota gün sayısı ile destinasyon sayfasının 1–3 günlük ziyaret önerisi aynı şey değildir; uzun yürüyüşler araç turu gibi kısaltılmaz.

Önce `wave=1` kayıtlarında güncel kimlik/erişim incelemesi, ardından `wave=2`, sonra `wave=3`. Bilinen makale/QID keşif kanıtıdır; ülke, doğru fotoğraf, ziyaretçi girişi ve güncel izinler üretim sırasında ayrıca denetlenir. Koordinatlar arazi parçası merkezi veya genel yer noktasıdır, **otopark/rota durağı değildir**. Belirsiz koordinatlar, bölgeler ve kimlikler null bırakılır.

Webjet ülke/yer hizmetleri bu katalogda doğrulanmadı; üretimde mevcut onaylı ortak eşlemesi kullanılmalıdır. Yeni ülke sayfaları, haritalar, uçuş/araç bağlantıları ve Almanca yayın bu katalog hazırlığına dahil değildir. Hiçbir veritabanı kaydı veya yönlendirme değiştirilmedi.

## Kontrol

```text
python3 scripts/content-pipeline/claude-handoff/oceania/build_catalogs.py
python3 scripts/content-pipeline/claude-handoff/oceania/validate_catalogs.py
python3 -m unittest discover -s scripts/content-pipeline/claude-handoff/oceania -p 'test_*.py'
```

Kaynaklar saklandığı için çevrimdışı yeniden oluşturma YZ çağrısı yapmaz. `collect_identities.py` sadece eksik makale kimliklerini ücretsiz Wikipedia API üzerinden toplar; sayfa üretmez veya yayımlamaz.
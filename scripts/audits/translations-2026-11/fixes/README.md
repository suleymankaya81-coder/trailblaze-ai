# Çeviri düzeltmeleri (2026-11) — SQL dosyaları ve çalıştırma kılavuzu

Bu klasördeki dosyalar benim tarafımdan **hiçbir yerde çalıştırılmadı**. Canlı veritabanına bağlanılmadı.
SQL'i siz gözden geçirip başka bir araçla çalıştıracaksınız.

> **Durum (2026-11-21, 2. tur):**
> - `00-backup.sql` ve `01-helper.sql` canlıda kurulu: `drizzle/migrations/0018_…`, `0019_…`.
> - `02-preview.sql` canlıda çalıştırıldı; sonuçları `../preview-2026-11-21/` altında.
> - B1–B5, C ve D1–D3 kuralları örneklerde doğru çıktı → **`03a-apply-bcd.sql` çalıştırılmaya hazır.**
> - Kural A'nın v1 sürümü 368 fallback çıktısının yaklaşık 100–150'sinde kırık parça üretiyordu ("…, der am 26. Juni.", "… parc national qui."). Bu yüzden A, **`01b-helper-rule-a-v2.sql`** ile yeniden yazıldı ve **`03b-apply-rule-a.sql`** olarak ayrıldı.
> - **3. tur (2026-11-22):** Kural A'ya kalite filtresi eklendi: **`01c-helper-rule-a-quality.sql`**, önizlemesi **`02b-preview-rule-a-quality.sql`**.
>   - Bir çıktı ancak şu durumda yazılır: en az 6 kelime, zamirle başlamıyor, yalnızca sayı bilgisi değil, yerin ya da durağın adını anıyor, başka park adı geçmiyor ve slug sabit listede değil.
>   - Filtreden geçmeyenler değişmeden kalır ve `../preview-2026-11-22-quality/needs-human.md` listesine girer.
>   - Sample veritabanında: 43 alan yazılır, 24 alan needs-human.
> - **03b henüz onaylı değil.** Önce 01b kurulmalı, 02 yeniden çalıştırılmalı ve A3/A4 listeleri okunmalı (bkz. bölüm 2 ve `../preview-2026-11-21b/summary.md`).

Test için yalnızca bu oturumun içinde geçici, yerel bir PostgreSQL 16 kuruldu. İçine sadece
`sample.json`'daki 100 satır yüklendi (99 yer, 50 de + 50 fr çeviri). Tablo ve sütun adları
`src/integrations/supabase/types.ts` ile aynıydı. Aşağıdaki "örnek sonuçlar" bu testten gelir.
Canlıdaki gerçek sayıları `02-preview.sql` size verecek.

Kaynaklar:

- İngilizce metin: `public.destinations` tablosu.
  - Sütunlar: `tagline`, `seo_title`, `seo_description`, `best_season`, `permit_headline`, `permit_note`, `notes`
  - Gezi planı: `travel_plan` (jsonb)
- Almanca/Fransızca metin: `public.content_translations` tablosu.
  - Satır: `entity_type='destination'`, `entity_id = destinations.slug`, `locale` 'de'/'fr'
  - Metin: `fields` (jsonb)

---

## 1. Dosyalar

| Dosya | Ne yapar | Veri değiştirir mi? |
|---|---|---|
| `00-backup.sql` | Yedek alır: tüm de/fr çeviri satırları, tüm `destinations` satırlarının değişebilecek sütunları ve `regions.status`. Hepsi özel `audit_backup` şemasına gider. | Sadece yedek tablo oluşturur |
| `01-helper.sql` | Özel `translation_fix` şemasında yardımcı fonksiyonları kurar. Asıl parça, JSONB'yi özyinelemeli gezip her metin değerine kural uygulayan `jsonb_walk` fonksiyonu. | Hayır (sadece fonksiyon) |
| `02-preview.sql` | Sadece SELECT içerir. Her kural için dil başına etkilenen satır sayısını ve 10 önce/sonra örneğini (slug, alan, eski, yeni) verir. Ayrıca bir kişinin bakması gereken listeleri çıkarır. | Hayır |
| `01b-helper-rule-a-v2.sql` | Kural A'nın 2. sürümü. A fonksiyonlarını yeniden yazar ve "sarkan parça" kontrolünü ekler (bkz. bölüm 3-A). `02-preview.sql` değişmeden v2 ile çalışır. | Hayır (sadece fonksiyon) |
| `01c-helper-rule-a-quality.sql` | Kural A için kalite filtresi ve sabit needs-human slug listesi (`translation_fix.needs_human_slugs()`). Yalnızca fonksiyon kurar. | Hayır (sadece fonksiyon) |
| `02b-preview-rule-a-quality.sql` | Yalnızca SELECT. Kural A + filtre için dil ve karar başına sayılar, gerekçeler, yazılacakların tam listesi ve needs-human listesi. | Hayır |
| `03a-apply-bcd.sql` | **Hazır.** Yalnızca B1–B5, C, D1–D3. Tek transaction, yapı/kimlik kontrolleri ve `fix_log` var. Tek başına çalışır, idempotent. | Evet |
| `03b-apply-rule-a.sql` | **Henüz onaylı değil.** Yalnızca kural A (v2 + 01c kalite filtresi). Tek transaction ve aynı kontroller. 01b veya 01c kurulu değilse çalışmayı reddeder. Sonda değiştirilmeyen alanların sayısını verir ("unresolved" ve "needs-human"). | Evet |
| `04-rollback.sql` | `audit_backup` yedeğinden geri yükler: 03a, 03b ve 05'in yaptığı her şeyi. | Evet (geri alma) |
| `05-optional-unpublish-overseas.sql` | **Sahip kararı.** 6 denizaşırı Fransız yeri taslağa (draft) çeker. | Evet (isteğe bağlı) |
| `fix_repo_caches.py` | Repodaki çeviri önbelleklerine aynı kuralları uygular. Çalıştırıldı ve sonucu commit'lendi. 2. turda v1 ile temizlenmiş 8 Almanca yer önbelleği v2 ile yeniden üretildi. Veritabanına dokunmaz. | Sadece repo dosyaları |

**Güvenlik:**

- `audit_backup` ve `translation_fix` şemaları Supabase API'sinde açık değildir. Varsayılan olarak yalnızca `public` ve `graphql_public` açıktır.
- Ayrıca `anon`, `authenticated` ve `public` rollerinden tüm yetkiler geri alınır.
- Yedek tablolarda RLS açık ve hiç policy yok.
- `public` şemasına hiçbir kopya yazılmaz. 00'ın sonundaki son sorgu bunu kontrol eder ve 0 satır dönmelidir.
- Yerel testte `anon` ve `authenticated` rolleri iki şemaya da erişemedi: `permission denied for schema audit_backup` / `translation_fix`.

---

## 2. Çalıştırma sırası

Her dosyayı **tek parça** çalıştırın: `psql -v ON_ERROR_STOP=1 -f <dosya>` ya da Supabase SQL Editor'a dosyanın tamamını yapıştırarak.

1. **`00-backup.sql`**
   - Sondaki sayılar beklenen: `translations = 6318` (de 3.087 + fr 3.231) ve `destinations` = toplam satır sayısı.
   - `public` kontrolü 0 satır dönmeli.
   - İkinci kez çalıştırılırsa ilk yedeğin üzerine yazmaz (`create table if not exists`).
2. **`01-helper.sql`**: yalnızca fonksiyonları kurar. Tekrar çalıştırılabilir. *(Canlıda kurulu.)*
3. **`01b-helper-rule-a-v2.sql`**: kural A v2'yi kurar. Tekrar çalıştırılabilir. *(Canlıda kurulu: migration 0022.)*
3b. **`01c-helper-rule-a-quality.sql`**: kalite filtresini kurar. Tekrar çalıştırılabilir. *(Yeni; canlıda henüz yok.)*
4. **`02-preview.sql`**: 01b kurulduktan sonra **yeniden** çalıştırın ve okuyun (bkz. bölüm 3). Özellikle:
   - A3 fallback listesi (modlar artık: `fallback`, `fallback_cut`, `fallback_intro`, `fallback_next`)
   - A4 unresolved listesi
   - A4b zamirle başlayan metinler
   - D2 uyuşmazlık listesi
5. **`03a-apply-bcd.sql`** (hazır): tek transaction. Sonunda kural başına `rows_changed` ve kalan sorunlar çıkar. Yapı veya kimlik kontrolü başarısız olursa hiçbir şey kaydedilmez. İkinci çalıştırmada tüm `rows_changed` 0 olmalı.
6. **`03b-apply-rule-a.sql`**: yalnızca **`02b-preview-rule-a-quality.sql`** sonuçları (Q3 yazılacaklar, Q4 needs-human) onaylandıktan sonra çalıştırın.
   - Tek transaction; aynı kontroller.
   - Sonda "rule A unresolved fields" tablosu çıkar: değiştirilmeden kalan alanlar. Bunları bir kişi yazmalı.
   - 03a ile sırası önemli değildir; ikisi birbirinden bağımsızdır.
7. **Sonucu kontrol edin** (bölüm 4).
8. *(İsteğe bağlı, sahip kararı)* **`05-optional-unpublish-overseas.sql`**
9. Bir sorun çıkarsa **`04-rollback.sql`**: 03a, 03b ve 05'i birlikte geri alır. Önce baştaki listeye bakın: yedekten sonra başka bir nedenle değişen satırlar da geri döner.

Her şey kesinleştikten sonra yardımcı fonksiyonlar silinebilir: `drop schema translation_fix cascade;`. Yedek şeması `audit_backup` kalsın; ne zaman silineceğine siz karar verin.

---

## 3. Kurallar

Her kural yalnızca **gerçekten değişen** satırı günceller (`WHERE yeni IS DISTINCT FROM eski`). Her kural fonksiyonu idempotenttir; ikinci çalıştırma 0 satır değiştirir. Bu, yerelde test edildi.

Hiçbir kural şunları değiştirmez:

- satırın `name` alanı
- durak adları (`stops[].name`)
- `stop_id`
- bağlantılar ve etiketler

JSON yapısı korunur: anahtarlar, dizi uzunlukları ve metin olmayan değerler aynı kalır. 03a ve 03b bunu yedekle karşılaştırarak kanıtlar.

### A — Yer tutucu cümleleri (İngilizce kaynak + de + fr) — **v2, `01b` + `03b`**

- `[dated source]`, `[source datée]`, `[datierter Quelle]` ya da `[datiert Quelle]` içeren **cümlenin tamamı** silinir.
  - Kapsam: `fields` içindeki tüm metin alanları (tagline, metaDescription, stops[].detail, intel, notlar…) ve `destinations` sütunları ile `travel_plan`.
- Sonda kesilmiş belirteç de yakalanır, örn. "… en juillet [da".
- **Kesin düzeltme (A0):** "Natura [dated source]" → "Natura 2000". Belirteç, AB koruma ağının adındaki "2000" sayısını yemişti. v2'de de korunuyor.
- **v1'in sorunu:** alan boşalacağı zaman belirteçten önceki yan cümleyi tutuyordu. Ama bu yan cümle çoğu zaman yarım kalıyordu:
  - „Dieser regionale Naturpark wurde am 26. Januar."
  - „Breheimen National Park est un parc national qui."
  - „…, der am 26. Juni."
  - „With about 2,468 km2, it includes 138 communes since 1 January."
  - „Salpausselkä Geopark a été accepté le 13 avril."
- **v2'nin sarkan parça kontrolü** (`translation_fix.clause_problems`; en/de/fr). Yazılacak her metin kontrol edilir. Metin şu durumlarda **geçersiz** sayılır:
  - Sonu şunlardan biriyle bitiyor:
    - ilgi zamiri, bağlaç ya da yardımcı fiil: qui, que, dont, der, die, das, which, that, wurde, est, a été, ist…
    - edat ya da artikel
    - yıl kalmamış bir giriş fiili: established, gegründet, créé… (metinde 15xx–19xx yılı kalmışsa geçerli)
  - Yılı olmayan gün + ay içeriyor („am 26. Juni", „le 13 avril", „1 January"), ayla bitiyor ya da „in/im/en/début + ay" içeriyor.
  - Ana fiil kalmamış (en/de/fr fiil listesi).
  - Parça gibi başlıyor:
    - küçük harfle
    - edat ya da bağlaçla: Mit, With, Avec, Since, Seit, Depuis…
    - fiille: „Ist es …"
  - „/", „n°" ya da „by Decree" ile bitiyor.
  - Son yan cümlede fiil yok: „…, das im Markermeer".
  - 5 kelimeden kısa. Baştaki „Ad :" öneki sayılmaz.
  - Almanca fiil sonda yan cümle geçerlidir: „…, obwohl De Wieden später hinzugefügt wurde."
- **Geçersizse sırayla:**
  - **(a)** Son tam yan cümleye kadar geri keser. Sınırlar: virgül, ilgi zamiri, tarih ya da giriş fiili. Sonuç aynı kontrolden geçmeli: özne + fiil var, en az 5 kelime. Örnek: „Lomsdal-Visten Nationalpark ist ein norwegischer Nationalpark." Mod: `fallback_cut`.
  - **(a2)** Belirteç kısa bir girişin içindeyse („Created in [t], it encompasses …", „En [t], son périmètre …"), virgülden sonraki ana cümle tutulur. Mod: `fallback_intro`.
  - **(b)** tagline, seo_description ve metaDescription için: aynı alandaki bir sonraki belirteçli cümleden geçerli bir yan cümle. Mod: `fallback_next`.
  - **(c)** Hiçbiri olmazsa alan **değiştirilmez**: mod `unresolved`. Bir kişi yazmalı.
- Cümle silindikten sonra kalan son parça da kontrol edilir. Kesik bir slogan sonu („… Dieses") yazılmaz.
- **Hiçbir zaman parça yazılmaz.** Aynı kurallar `scripts/content-pipeline/dated_text.py` içinde yeni içerik için de var. Python ve SQL 463 kayıtta birebir aynı sonucu verdi.
- **Canlı önizlemedeki 463 kayıtta test** (ayrıntı: `../preview-2026-11-21b/summary.md`):
  - geçerli sonuç: 336 (en 144, de 60, fr 132)
  - unresolved: 127 (en 45, de 41, fr 41)
  - sarkan sonuç: önce 148 (basit kalıp kontrolüyle 108) → sonra **0**

### B — Almanca şablon düzeltmeleri

| Kural | Eski | Yeni |
|---|---|---|
| B1 | „Eintritt, aktivitätsberechtigungen und Übernachtung sind separate Überprüfungen; die quellenauszüge unten stellen die verfügbarkeit für ihre daten nicht fest." | „Eintritt, Aktivitätsgenehmigungen und Übernachtung müssen separat geprüft werden; die Quellenauszüge unten belegen keine Verfügbarkeit für Ihre Reisedaten." (report.md bölüm 4) |
| B2 | „Die überprüften Quellen legen/stellen … fest" (8 kalıp cümle: Parken, Mobilfunk, Kraftstoff, Saison, Zugang, Ankunft, Fahrzeug, Goldene Stunde) | „Die geprüften Quellen belegen …" |
| B4 | „Wählen Sie einen lokalen Besuch; Reisezeit und Weiterleitungen werden nicht überprüft." | „Wählen Sie einen Besuch vor Ort; Reisezeit und Anschlussverbindungen werden nicht geprüft." |
| B5 | `days[].start` „Vorgeschlagen: …" / „Empfohlen: …" | „Vorschlag: …". Yalnızca aynı günün İngilizce başlangıcı „Suggested:" ise. |

**B3 — anlamı yanlış bilgi kutusu başlıkları.** Yalnızca başlığın tamamı birebir eşleşiyorsa değişir. İngilizce kaynak başlıklar `sample.json`'dan alındı:

| İngilizce kaynak başlık | Şimdiki Almanca | Önerilen Almanca | Neden |
|---|---|---|---|
| Parking check | Parkkontrolle | **Parken** | „Parkkontrolle" park cezası denetimi demek |
| Access check | Zugangskontrolle | **Zugang** | „Zugangskontrolle" güvenlik/giriş kontrolü demek |
| Timing check | Zeitplanungsprüfung | **Beste Reisezeit** | uydurma kelime; metin en iyi sezondan bahsediyor |
| Fuel check | Kraftstoffprüfung | **Tanken** | uydurma, resmî dil |
| Signal check | Signalprüfung | **Mobilfunkempfang** | teknik terim, anlam „telefon çekiyor mu" |

### C — Almanca 3. gün başlangıç hatası: otomatik düzeltilir, deterministik

Örnekteki 25 çok günlü şablon satırının **25'inde de** hata aynı:

- Almanca, önceki durağın yerine satırın kendi adını yazmış: „Vorschlag: Abfahrt am Morgen ab {name}" / „Etwa N km Luftlinie ab {name}; …".
- km sayısı İngilizceyle **her satırda aynı**.
- 2. gün doğru, çünkü orada İngilizce başlangıç zaten yerin adı.

Düzeltme yerini aynı günün İngilizce planından alır: „Suggested: morning departure from X", „About N km from X…". Güncelleme yalnızca şu koşulların hepsi tutunca yapılır:

- Almanca metin şablonla birebir aynı
- yer olarak satır adı yazılmış
- km aynı
- gün sayısı İngilizceyle aynı

Şablona uymayan şüpheli satırlar 02'de ayrıca listelenir ve düzeltilmez. Örnekte bu liste boş çıktı.

### D — Fransızca şablon düzeltmeleri

- **D1:** bilgi kutusu başlığı „Timing" → „Horaires" (istediğiniz kelime).
  - Not: kutu metni en iyi sezonu anlatıyor („…ne recommandent pas de saison idéale…").
  - Anlam olarak „Meilleure période" daha uygun olurdu.
  - Değiştirmek isterseniz `01-helper.sql` içinde `rule_d1` içindeki tek kelimeyi değiştirmek yeterli.
- **D2:** `days[].driving` içindeki çift birim → „N km". Biçimler: „37 km [37 km]", „12 km [7,5 miles]", „33 km (20,5 miles)", „11 miles [18 km]".
  - **Yalnızca** kalan km sayısı aynı günün İngilizce „About N km" değerine eşitse uygulanır.
  - Sayı farklıysa (örn. folgefonna: „Environ 10 miles [16 km]", İngilizcede 10 km) **dokunulmaz**, 02'de listelenir.
  - Diğer alanlardaki mil ifadelerine dokunulmaz (ABD satırlarında kaynak zaten mil).
- **D3:** „pour le {ad}" → „pour {ad}", „au {ad}" → „à {ad}", „du {ad}" → „de {ad}" / „d'{ad}" (ünlüyle başlıyorsa).
  - `{ad}` satırın kendi `fields.name` değeri.
  - Ad Fransızca genel bir isimle başlıyorsa **atlanır**: Parc, Lac, Mont, Massif, Cap, Golfe, Détroit, Pic, Col, Cirque, Gorges, Forêt, Val, Vallée, Plateau, Marais, Étang, Pointe, Baie, Réserve, Pont, Grotte, Île, Grand/Petit… (tam liste `fr_name_takes_article` içinde).
  - Atlanan satır sayısı 02'de verilir.
- **Bölünmez boşluk (U+202F):** hiçbir kurala eklenmedi. Mevcut metnin tamamı normal boşluk kullanıyor. Yalnızca bazı satırlara eklemek tutarsızlık yaratır. Sitenin tamamı için ayrı bir karar olmalı.

### E — Kelime ortasında biten başlık/açıklamalar: liste, otomatik düzeltme yok

02'nin son sorgusu canlıdaki adayları listeler. Örnekte bulunanlar (report.md bölüm 3):

| Dil | Slug | Alan | Bitiş |
|---|---|---|---|
| de | brecon-beacons-national-park | metaTitle | „…National Pa – Reiseplan" |
| de | brecon-beacons-national-park | metaDescription | „…bei offiziellen Stelle" |
| fr | loire-anjou-touraine-regional-nature-park | metaTitle | „…itinéraire et co" |
| fr | salzburger-lungau-and-karntner-nockberge-biosphere | metaTitle | „…itinéra" |
| fr | parco-naturale-regionale-del-complesso-lacuale-bracciano-martignano | metaTitle | „…Bracciano - M" |
| fr | la-gomera | metaDescription | „…l'île de La Go" |
| fr | liechtensteinklamm | metaDescription | „…(dernière" |
| fr | parco-naturale-regionale-del-complesso-lacuale-bracciano-martignano | metaDescription | „…du Lati" |
| fr | salzburger-lungau-and-karntner-nockberge-biosphere | metaDescription | „…l'UNESCO e" |
| fr | ses-salines-natural-park | metaDescription | „…est un p" |
| fr | sparbach-nature-park | metaDescription | „…Dieses" (ayrıca Almanca metin) |

Ek olarak 19 slogan noktalama işaretiyle bitmiyor. Bunların çoğu, İngilizce kaynağın ~110 karakterde kesilmesinden geliyor.

---

## 4. Sonuç nasıl kontrol edilir

- **03a ve 03b'nin sonunda:**
  - `fix_log` tablosu kural başına değişen satır sayısını verir.
  - "kalan" tablosu şunları gösterir:
    - kalan belirteçler (yalnızca A4 unresolved kadar olmalı)
    - `aktivitätsberechtigungen` sayısı: **0 olmalı**
    - „Timing" sayısı: **0 olmalı**
- **İkinci çalıştırma:** 03a/03b tekrar çalıştırılınca tüm `rows_changed` 0 olmalı.
- **03b'den sonra:** "rule A unresolved fields" tablosu, bir kişinin yazması gereken alanları sayar. Canlı önizlemedeki 463 kayıt üzerinden beklenen: yaklaşık 127 alan (en 45, de 41, fr 41). Tam liste: `../preview-2026-11-21b/unresolved-v2.md`.
- **Canlı sayımlarınızla karşılaştırma:**
  - B1, 2.457 de satırına yakın olmalı.
  - D1, 2.044 fr satırına yakın olmalı.
  - A için 02'nin ilk tablosu sizin token sayımlarınızı tekrar üretmeli: de 10/84/123, fr 229/76, en 307.
  - Büyük bir fark varsa 03a/03b'yi çalıştırmadan önce durun.
- **Elle kontrol örneği:**
  ```sql
  select fields->'days'->2->>'start', fields->'days'->2->>'driving'
  from content_translations where entity_id='aare-gorge' and locale='de';
  -- beklenen: "… ab Giessbach Falls" / "Etwa 18 km Luftlinie ab Giessbach Falls; …"
  ```
- **Sayfada:** `/de/destinations/ch/<bölge>/aare-gorge` ve `/fr/destinations/hu/<bölge>/orseg-national-park` açılıp metne bakılabilir. Kod çeviriyi her istekte veritabanından okur; bir CDN/sayfa önbelleği varsa yenilenmesini bekleyin.

---

## 5. Riskli kurallar (yüksekten düşüğe)

1. **A — cümle silme (v2, 03b).**
   - Bilgi kaybı var; bu bilinçli bir tercih.
   - v2 parça yazmaz. Bunun bedeli, daha çok alanın unresolved kalması: 463 önizleme kaydında 127.
   - İlk cümle silinince metin zamirle başlayabilir. Örnek, are: „It is, however, not the seat of the municipality…". Bunlar 02'de **A4b** listesinde.
   - Fallback yan cümleleri (A3) mutlaka okunmalı.
   - Cümle bölme kuralı kısaltma listesine dayanıyor; listede olmayan bir kısaltma iki cümleyi birleştirebilir.
2. **D3 — artikel.** Kural gramer olarak güvenli, ama ton değişir: „Roadtrip au Chaco Culture National Historical Park" → „Roadtrip à Chaco Culture National Historical Park". Erkek park adlarında eski hali de doğruydu. Örnekte 41 fr satırı etkileniyor.
3. **B5 — „Vorschlag:" birleştirme.** El yazısı ABD satırlarını da etkiler (örn. „Empfohlen: 08:00 Uhr ab Old Town" → „Vorschlag: …"). Anlam değişmez.
4. **C, D2, B1–B4, D1:** birebir şablon eşleşmesi, düşük risk.

---

## 6. Otomatikleştirilmeyenler (bilerek)

- A4 „unresolved" alanlar: canlı önizlemenin 463 kaydında v2 ile 127 alan (en 45, de 41, fr 41). Liste: `../preview-2026-11-21b/unresolved-v2.md`. Yazılması ya da alanın kaldırılması bir kişi işi.
- Durak adı içinde belirteç varsa (A5) dokunulmaz: durak adları rota kimliği.
- `seo_landing_pages` içindeki belirteçler (A6) yalnızca sayılır.
- D2'de sayısı İngilizceden farklı mesafeler (örnek: folgefonna).
- D3'te genel isimle başlayan adlar.
- E: kesik başlık ve açıklamalar.
- `best_season` = „Check official seasonal information" ve çevirileri. Kurallarınızda yoktu; yeni yayınları artık yayın kapısı engelliyor.
- Almanca `bestSeason` kalıbı („Keine verifizierte Empfehlung … ist für … verfügbar") ve Almanca genel meta açıklama şablonu. Kurallarda yoktu.
- Satıra özgü dil hataları (Zugkopf, Brötchen, Devetashka, km/m…). Bunlar `translation-audit` dalındaki `proposed-row-fixes.json`'da. Ayrıca gözden geçirilip uygulanmalı.
- Fransızca bölünmez boşluk (bkz. D).

---

## 7. `05` — taslağa çekilen bir yerin davranışı (koddan kontrol edildi)

- **Sayfa:** `getDestinationPageData()` (`src/lib/data/destinations.functions.ts`) yalnızca `status='published'` okur. İngilizce, `/de` ve `/fr` yer sayfaları **404** döner (`notFound`).
- **İngilizce sitemap ve ülke/bölge listeleri:** `destinations.status='published'` filtreli. Yer **kaybolur**.
- **`/de` ve `/fr` sitemap'leri** (`…-de-destinations.xml`, `…-fr-destinations.xml`, `src/lib/seo/sitemap.server.ts`):
  - `content_translations.status='published'` olan ve `src/data/destination-geo.json` içinde bulunan her satırı listeler.
  - `destinations.status`'a **bakmaz**.
  - Bu yüzden 05, de/fr çeviri satırlarını da `draft` yapar. Yapmasaydı sitemap 6 adet 404 URL listelerdi.
- **`destination-geo.json` statik bir dosya.** fr/reunion, fr/guadeloupe, fr/french-guiana, fr/mayotte, fr/martinique bölge sayfaları, bu dosya yenilenene kadar İngilizce sitemap'te kalır ve boş görünür. Seçenekler:
  - altı slug'ı repodaki `destination-geo.json`'dan çıkarmak
  - 05'teki isteğe bağlı 3. adımı açmak (bölgeyi taslağa çeker)
  - boş bölge sayfasını kabul etmek
- 05'in 0. adımı bu yerlere bağlı yayınlanmış arama sayfası (`seo_landing_pages`) sayısını da gösterir. Bu sayfalar 05 ile değişmez.

---

## 8. Yerel test sonuçları (sadece sample.json, PostgreSQL 16)

**2. tur (v2):** 03 ikiye bölündü.

- **03a**, sample üzerinde aynı sayıları verdi: B1 36, B2 36, B3 36, B4 25, B5 48, C 25, D1 38, D2 30, D3 41. İkinci çalıştırma 0.
- **03b (v2)**, sample üzerinde: A en 25, de 3, fr 20. İkinci çalıştırma 0. Unresolved: en 3 satır/6 alan, fr 3 satır/6 alan.
- 04 ile tam geri dönüş: 0 fark.
- Aşağıdaki tablo 1. turdan (v1).

| Kontrol | Sonuç |
|---|---|
| Belirteçli satır (örnek) | de 3 (datierter 2, datiert 1) · fr 24 kayıt (dated 21, source datée 3) · en 27 yer |
| A sonucu | en: 16 satır cümle silme, 3 Natura 2000, 8 satır/13 alan fallback, 2 satır unresolved · fr: 11 / 3 / 8 satır·12 alan / 2 · de: 3 cümle silme |
| 03 ilk çalıştırma, `rows_changed` | A en 26, de 3, fr 21 · B1 36 · B2 36 · B3 36 · B4 25 · B5 48 · C 25 · D1 38 · D2 30 · D3 41 |
| 03 ikinci çalıştırma | tüm kurallar 0 |
| Kalan | `aktivitätsberechtigungen` 0, „Timing" 0, belirteç: yalnızca sjusjoen ve sparbach (unresolved) |
| D2 uyuşmazlık | 1 (folgefonna, değiştirilmedi) · D3 atlanan: 0 · C şüpheli: 0 |
| Yapı/kimlik kontrolleri | geçti |
| `04-rollback.sql` | orijinalle 0 fark (updated_at dahil) |
| `05` | 2 yer + 1 çeviri taslağa çekildi, rollback ile geri geldi |

---

## 9. Repo (pipeline) değişiklikleri

Amaç, yeni içeriğin aynı hataları tekrarlamaması.

- **`scripts/content-pipeline/dated_text.py`** (2. turda v2 kurallarına güncellendi: sarkan parça kontrolü, a/a2/b/c adımları; SQL ile aynı sonuç):
  - Yıl içeren cümleyi tamamen siler, artık `[dated source]` yazmaz.
  - Tek cümleyse belirteçten önceki ilk yan cümleyi tutar.
  - „Natura 2000" bir isim olarak korunur.
  - Kurallar 01-helper.sql ile aynı.
- **`quoted_visit.py`:**
  - `clean()` artık `drop_dated` kullanıyor; durak adlarına cümle silme uygulanmıyor.
  - `best_season` artık „Check official seasonal information" değil, mevcut adlı yedek cümle.
- **`complete-fr-pt-gr-drafts.py`:** `[dated source]` yerine `drop_dated`.
- **Yayın kapısı.** Şu metinler yayını durdurur: `[dated source]`, `[source datée]`, `[datierter Quelle]`, `[datiert Quelle]`, „Check official seasonal information".
  - `scripts/content-pipeline/placeholder_gate.py` (yeni) bu kontrolü yapar.
  - `publish-wave.py` hem İngilizce sütunları ve planı hem de o yerin kayıtlı de/fr çevirilerini kontrol eder.
  - Ayrıca Almanca/Fransızca 3. gün başlangıcı İngilizcedeki yeri içermiyorsa yayın durur.
  - `scripts/audits/fr-pt-gr-2026-11/verify.py`: yeni BLOCKING kontrolü (8. madde).
  - `generate-travel-content.py` doğrulaması:
    - belirteçleri reddeder
    - „Natura 2000"ü yıl saymaz
- **Almanca:**
  - `audit-dach.py`:
    - kalıp cümleler için incelenmiş Almanca metin (`REVIEWED_DE`, B1–B5)
    - çok günlü başlangıç ve mesafe kalıbı İngilizcedeki yeri korur (C)
    - doğrulama, yanlış başlangıç yerini ve belirteçleri reddeder
    - metaTitle artık kelime ortasında kesilmez
  - Argos önbellekleri (`dach/german-page-cache`, `dach/translations`) düzeltildi:
    - 219 ifade dosyası
    - 678 yer bazlı Almanca çıktı (B1–B5 ve A)
- **Fransızca:**
  - `data/translations/fr/phrases.json`:
    - 267 ifade düzeltildi: „Timing check" → „Horaires" ve km'si İngilizceyle aynı olan çift birimler.
    - Sayısı farklı 10 ifade değiştirilmedi.
  - `reviewed-phrases.json`: „Timing check" → „Horaires".
  - `french-translation.mjs` artık kaydetmeden önce şunları yapar (`french-fixes.mjs` kullanarak):
    - D1–D3 düzeltmeleri
    - belirteç veya İngilizceden farklı mesafe varsa sayfayı tutar (held)
    - başlık ve açıklamayı kelime sınırında keser
- **`translate-content.py`:**
  - de/fr sözlüğü ve kurallar istemde („km varsa mil ekleme", „Almanca isimleri büyük harf")
  - belirteçli çıktıyı reddeder
  - meta alanlarını kelime sınırında kısaltır
- **`phrases.de.ts`, `phrases.fr.ts`, `phrases.*.generated.json`:** tarandı. Bu şablon cümlelerin hiçbiri yok; değişiklik gerekmedi.

**Testler:**

- Python: `python3 -m unittest discover -s scripts/content-pipeline -p 'test_*.py'` → 109 test geçti (96 mevcut + 13 yeni). Alt klasör testleri de geçti.
  - Tek istisna önceden de vardı: `claude-handoff/oceania/test_catalogs.py` → `nz: batches not lossless`. Değişiklik olmadan da aynı şekilde başarısız.
- Node: `node --test scripts/content-pipeline/test_french_fixes.mjs` → 5/5 geçti.
- **vitest ve typecheck çalıştırılamadı.** `bun install` sırasında proxy, `registry.npmjs.org`'dan 138 paket indirmesini reddetti: `error: ProxyConnectFailed (403) downloading tarball @mapbox/tiny-sdf@2.2.0` vb. Bu oturumda `node_modules` eksik kaldı. TypeScript dosyalarında değişiklik yok.

---

## 10. `europe-fr-pt-gr` dalı (düzeltilmedi, sadece sayıldı)

- `scripts/content-pipeline/combined-content/` altındaki 125 fr/pt/gr taslak paketinden:
  - **25 pakette 31 kez** `[dated source]` var: 29'u `stops[].detail`, 2'si `summary.tagline` içinde.
  - **125 paketin hepsinde** „Check official seasonal information" var.
  - `[source datée]` / `[datierter Quelle]` / `[datiert Quelle]` yok.
- Aynı 125 paket `main`'de de aynı.
- `france/apply-ready.sql`, `south-europe/apply-gr-ready.sql` ve `apply-pt-ready.sql` dosyalarında belirteç **yok**. Bunlar da `main` ile aynı.
- Yeni yayın kapısı bu 125 yeri olduğu gibi yayınlamaz. Önce paketlerin yeni `quoted_visit` / `drop_dated` ile yeniden üretilmesi gerekir (onayınızla).

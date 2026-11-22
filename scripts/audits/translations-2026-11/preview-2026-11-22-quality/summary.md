# Kural A — kalite filtresi (2026-11-22)

**Yeni dosyalar:**

- `fixes/01c-helper-rule-a-quality.sql`
- `fixes/02b-preview-rule-a-quality.sql`
- `fixes/03b-apply-rule-a.sql`: artık filtreyi kullanıyor.

Kural A bir çıktıyı **yalnızca aşağıdakilerin hepsi doğruysa** yazar:

1. En az 6 kelime. Meta açıklamadaki „Ad :" öneki sayılmaz.
2. Zamir, iyelik ya da zamirle başlayan sıra bilgisiyle başlamıyor: Es, Er, Sie, It, Il, Elle, This, Dies…, Its, Son…, „Das ist der 4.", „C'est le 3e", „It is the 2nd".
3. Yalnızca nüfus, alan ya da sayı bilgisi değil. Bu, sayı + nüfus/alan kelimesi varken „is a / ist ein / est un" tanımı da „is situated / liegt / se trouve" gibi bir konum fiili de yok demektir.
4. Yerin adını anıyor. Durak açıklamasıysa (`stops[].detail`) o durağın adını anması da yeterli.
   - Adın ayırt edici kelimeleri aranır.
   - Büyük/küçük harf ve aksan farkı yok sayılır.
   - Genel kelimeler (National, Park, Lake, Parc, Naturpark, milliyet ve ülke adları) sayılmaz.
   - Bir harf ek farkı kabul edilir: „Kristianstad" ≈ „Kristianstads".
5. Başka bir park adı geçmiyor. Çıktıda bulunan her park adı, yerin adıyla (durak açıklamasında durağın adıyla) en az bir ayırt edici kelimeyi paylaşmalı.
6. Slug sabit listede değil: haagse-bos, midden-delfland, parco-naturale-regionale-bosco-incoronata, parco-naturale-regionale-del-vulture, valaste-waterfall, leka, mors-and-hanklit, naturpark-nissum-fjord, breheimen-national-park, bulbjerg.

Filtreden geçmeyen her alan **değişmeden kalır** ve `needs-human.md` listesine girer. „Natura [belirteç]" → „Natura 2000" bir yer değiştirmedir; her zaman yazılır.

## 1. Sample veritabanı (kesin sonuç)

Ortam: bu oturumda kurulan geçici, yerel bir PostgreSQL 16. İçine `sample.json`'daki 99 yer ve 100 çeviri yüklendi. `02b-preview-rule-a-quality.sql` çalıştırıldı. Canlı veritabanına dokunulmadı.

| Dil | Yazılır (write) | Natura 2000 | needs-human (filtre) | unresolved | needs-human.md toplamı |
|---|---|---|---|---|---|
| en | 20 alan (17 satır) | 3 | 6 | 6 | 12 |
| de | 2 | 0 | 1 | 0 | 1 |
| fr | 15 alan (13 satır) | 3 | 5 | 6 | 11 |
| **Toplam** | **37 (+6 Natura = 43 alan yazılır)** | 6 | **12** | **12** | **24** |

**Ayrıca test edildi:**

- `03b-apply-rule-a.sql` sample üzerinde: en 20, de 2, fr 16 satır değişti.
- İkinci çalıştırma: 0.
- `04-rollback.sql` ile orijinale tam dönüş: 0 fark.
- 03a, 03b'den bağımsız; aynı sayılar.

**Sample'daki filtre gerekçeleri:**

- adı anmıyor: en 3, fr 3, de 1
- zamirle başlıyor: en 3, fr 2
- yalnızca sayı bilgisi: en 2, fr 2, de 1
- başka park: en 1, fr 1 (Drina → „Tara National Park")

## 2. Canlı önizlemenin 463 kaydı (tahmin)

`preview-2026-11-21/A3-A4-fallback-unresolved.txt` içindeki eski metinler filtreden geçirildi. **Bu bir tahmin**, çünkü dosyada yerin ve durağın adı yok. Adlar repodan arandı:

| Ad kaynağı | Kayıt |
|---|---|
| sample.json | 36 |
| Almanca önbellek (`german-page-cache`) | 130 |
| `combined-content` paketi | 42 |
| Bulunamadı → slug'dan türetildi (`slug-guess`), durak adı yok | 255 |

**Sonuçlar:**

| Dil | Yazılır | needs-human (filtre) | unresolved |
|---|---|---|---|
| en | 56 | 88 | 45 |
| de | 20 | 40 | 41 |
| fr | 50 | 82 | 41 |
| **Toplam (463)** | **126** | **210** | **127** |

**Filtre gerekçeleri** (bir alanda birden fazla olabilir):

| Gerekçe | Alan |
|---|---|
| adı anmıyor | 189 |
| sabit liste | 62 |
| zamirle başlıyor | 47 |
| başka park | 45 |
| yalnızca sayı bilgisi | 43 |
| 6 kelimeden kısa | 1 |

- „Adı anmıyor" en çok durak açıklamalarında ve `slug-guess` kayıtlarında çıkıyor: slug-guess'te 135 needs-human'a karşı 45 write.
- Gerçek veritabanında durak adı bilindiği için bu kayıtların bir kısmı geçecektir. Örnek: „Der Alcantara-Flusspark ist ein Feuchtgebiet Siziliens", durağın adı Alcantara ise geçer.
- **Kesin canlı sayılar:** 01c kurulduktan sonra `02b-preview-rule-a-quality.sql` (Q1–Q4).

## 3. Dosyalar

- `pairs-en.md`, `pairs-fr.md`: 30 rastgele, filtreden geçen önce/sonra çifti (tohum 20261122).
- `pairs-de.md`: filtreden geçen farklı Almanca çıktı yalnızca **20**. 30'dan az olduğu için hepsi gösteriliyor.
- Toplam farklı geçen çıktı: en 45, de 20, fr 53. Kaynaklar: sample veritabanı ve 463 kaydın birleşimi.
- `needs-human.md`:
  - (1) sabit slug listesi
  - (2) sample veritabanındaki 24 alan (kesin)
  - (3) 463 kayıttan 337 alan (210 filtre + 127 unresolved; tahmin)
- `results.json`: tüm kararlar ve gerekçeler.

# Rule A v2 — yerel test sonucu (2026-11-21b)

**Girdi:** `preview-2026-11-21/A3-A4-fallback-unresolved.txt`

- Canlı önizlemeden gelen 463 kayıt:
  - 368 v1 "fallback"
  - 95 v1 "unresolved"
- Her kaydın **eski (belirteçli) metni** yeni fonksiyondan geçirildi: `translation_fix.rule_a_text`, kaynak `fixes/01b-helper-rule-a-v2.sql`.

**Ortam:** bu oturumda kurulan geçici, yerel bir PostgreSQL 16. İçine `sample.json`'daki 100 satır ve bu 463 kayıt yüklendi. Canlı veritabanına bağlanılmadı.

**Kontroller:**

- Aynı kurallar `scripts/content-pipeline/dated_text.py` içinde Python olarak da yazıldı. Python ve SQL 463 kayıtta **birebir aynı** sonucu verdi (0 fark).
- Sayıları üreten sorgular: `test-rule-a-v2.sql`.

## Sayılar

| | en | de | fr | Toplam |
|---|---|---|---|---|
| Geçerli sonuç (yazılacak) | 144 | 60 | 132 | **336** |
| Unresolved (değiştirilmeyecek) | 45 | 41 | 41 | **127** |

**Moda göre:**

| Mod | en | de | fr |
|---|---|---|---|
| fallback (belirteçten önceki yan cümle zaten geçerli) | 39 | 40 | 39 |
| fallback_cut (a: son tam yan cümleye kadar geri kesildi) | 90 | 20 | 81 |
| fallback_intro (a2: kısa tarihli giriş atıldı, ana cümle tutuldu) | 15 | 0 | 12 |
| unresolved | 45 | 41 | 41 |

**v1 → v2 geçişi:**

- v1 fallback → v2 geçerli: 309
- v1 fallback → v2 unresolved: 59. Bunlar v1'in kırık parçalarıydı; artık yazılmıyor.
- v1 unresolved → v2 geçerli: 27. Kısa tarihli giriş adımı (a2) sayesinde.
- v1 unresolved → v2 unresolved: 68

## Sarkan (dangling) sonuç sayısı

| | Kontrol edilen | Tam kontrol (`clause_problems`) | Basit kontrol (yalnızca görevde sayılan kalıplar) | Hâlâ belirteç içeren |
|---|---|---|---|---|
| **Önce** (canlıdaki v1 fallback çıktıları) | 368 | **148** | **108** | — |
| **Sonra** (v2'nin yazacağı sonuçlar) | 336 | **0** | **0** | **0** |

- **Basit kontrolün baktığı kalıplar** (sonda): qui, que, dont, der, die, das, which, that, wurde, est, a été, ist…, bir edat, "gün + ay", "in/en/im/seit/depuis + ay"; ya da başta "Mit/With/Avec".
- Basit kontrolde tek istisna, Almanca fiil sonda yan cümle: „…, obwohl De Wieden später hinzugefügt wurde." geçerli sayılır.
- **Tam kontrol ayrıca şunlara bakar:**
  - yılı olmayan gün-ay veya ay
  - ana fiil yok
  - fiilsiz yan cümle („…, das im Markermeer")
  - „by Decree", „n° 15/" ile biten
  - 5 kelimeden kısa
  - fiille başlayan

## Dosyalar

- `pairs-en.md`, `pairs-de.md`, `pairs-fr.md`: dil başına 30 rastgele önce / v1 / v2 örneği (tohum 20261121).
- `unresolved-v2.md`: hâlâ çözülmeyen 127 alanın tam listesi. Bunları bir kişi yazmalı.
- `results-v2.json`: 463 kaydın tamamı: eski metin, v1 sonucu, v2 sonucu, v2 modu, v1 çıktısının hangi kontrollere takıldığı.
- `test-rule-a-v2.sql`: sayıları üreten sorgular.

## Not

Bu 463 kayıt yalnızca canlı önizlemenin **fallback** ve **unresolved** listesidir. Cümle silmenin sorunsuz çalıştığı "removed" kayıtları bu dosyada yok. v2 o kayıtlarda da son parçayı kontrol eder: kesik bir slogan sonu gibi bir parça kalırsa atılır. Canlıdaki toplam etkiyi `02-preview.sql` (01b kurulduktan sonra) gösterir.

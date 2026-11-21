# Almanca (DE) ve Fransızca (FR) çeviri kalitesi denetimi

- **Tarih:** 2026-11-21
- **Kaynak:** `scripts/audits/translations-2026-11/sample.json` (`main`, commit `4ee61a02`)
- **Örnek:** 100 yayınlanmış yer sayfası çevirisi:
  - 30 temsili + 20 en çok hata veren DE satırı
  - 30 temsili + 20 en çok hata veren FR satırı
- **Yöntem:** Salt okuma. Veritabanına ve ağa erişilmedi, hiçbir yere bir şey uygulanmadı.

Her satırdaki her çevrilmiş alan, aynı satırdaki İngilizce kaynakla alan alan karşılaştırıldı. Toplam metin yaklaşık 390.000 karakter. Tekrar eden şablon cümleler bir kez, satıra özgü metinlerin hepsi tek tek okundu. Buna ek olarak otomatik kontroller yapıldı:

- uzunluk
- yer tutucu
- küçük harfle yazılmış Almanca isim
- yanlış dilde kalmış metin
- Fransız tipografisi
- gün başlangıcı ve mesafe cümlelerindeki yer adının İngilizce ile eşleşmesi

Burada yalnızca metne ve İngilizce kaynağına bakılarak karar verildi, yeni bilgi uydurulmadı.

Bu dosyanın önceki sürümü sabit arayüz metinlerini (`phrases.*.generated.json`) inceliyordu. O bulgular git geçmişinde duruyor (commit `510bea8b`). `glossary.md` olduğu gibi bırakıldı.

> **Önemli sınır:** Örnek rastgele değil. Her dilin 20 satırı bilerek "en kötü" satırlardan seçilmiş. Aşağıdaki oranları tüm veritabanına çevirirken bu akılda tutulmalı. Kesin sayılar "bu örnekte" diye verilmiştir.

---

## 1. Kısa sonuç

| | Almanca (DE) | Fransızca (FR) |
|---|---|---|
| **Genel puan** | **5 / 10** | **6,5 / 10** |
| Dil kalitesi (akıcılık, dilbilgisi) | 5 | 6,5 |
| Terminoloji (lojistik terimler, yer adları) | 5 | 6 |
| Ton (samimi rehber; resmî ya da abartılı değil) | 6 | 7 |

**Karar:** Sayfaların büyük çoğunluğu **indekste kalabilir**, ama bir şartla: aşağıdaki şablon hataları kısa sürede, yapay zekâ kullanmadan, düz metin değiştirmeyle düzeltilmeli. Ayrıca bölüm 9'da listelenen **içerik olarak bozuk** satırlar düzeltilene kadar taslağa (draft/noindex) çekilmeli.

En büyük üç sorun:

1. **DE: 3. günün başlangıç yeri ve mesafesi yanlış.** Birden fazla gün içeren 25 şablon satırının **25'inde de** var. İngilizce "Morgens ab Giessbach Falls, 18 km" derken Almanca "ab Aare Gorge" yazıyor. Bu, yol tarifini yanlış gösteren bir lojistik hata, sadece üslup sorunu değil.
2. **DE: Görünen nottaki şablon cümlede küçük harfli isimler.** Cümle şu: "Eintritt, aktivitätsberechtigungen und Übernachtung sind separate Überprüfungen; die quellenauszüge unten stellen die verfügbarkeit für ihre daten nicht fest." 50 DE satırının 36'sında, hem gün notunda hem izin notunda geçiyor (85 kez). "feststellen" fiili de yanlış anlamda kullanılmış.
3. **FR: Çevrilmemiş `[dated source]` yer tutucusu ve yanlış dilde metin.** 50 FR satırının 21'inde var. Kopuk ve yanlış metin örnekleri:
   - "Natura [dated source]" (doğrusu Natura 2000)
   - sparbach sayfasında Almanca slogan ve meta açıklama
   - orseg sayfasında alakasız bir yer ("grotte Devetashka", Bulgaristan)
   - blue-ridge sayfasında "1 845 km" yükseklik

---

## 2. Puanların kanıtı

### Almanca

İyi olan kısımlar:

- Elle üretilmiş ABD satırları (13 satır: mystic, port-aransas, mccall, seward, hocking-hills, new-river-gorge vb.) doğal ve akıcı. Dil yaklaşık **8/10**. Örnek: "Beobachten Sie vom Kanu aus das Ufer nach Eistauchern und Weißkopfseeadlern."
- Terimler çoğunlukla doğru:
  - Campingplatz
  - Wanderparkplatz
  - hohe Bodenfreiheit
  - Fähre
  - Shuttle
  - „Wer zuerst kommt, mahlt zuerst“

Puanı düşüren kısımlar:

- **Şablon satırları (37/50):**
  - küçük harfli isimler
  - yanlış 3. gün başlangıcı
  - anlamı yanlış kutu başlıkları:
    - "Parkkontrolle" park denetimi/ceza anlamına gelir
    - "Zugangskontrolle" güvenlik kontrolü anlamına gelir
    - "Zeitplanungsprüfung" ve "Kraftstoffprüfung" uydurma kelimeler
  - Bilgi kutularında "Die überprüften Quellen **legen** keine … **fest**" kalıbı. Bu "belirlemiyor/şart koşmuyor" demek; doğrusu "belegen".
- **En kötü 20 satırın bir kısmı ham makine çevirisi.** Örnekler:
  - "Zugkopfkapazität": trailhead → "tren başı"
  - "Zugzugänglichkeit": trail → "tren"
  - "fegenden roten Sandsteingipfeln" (sweeping = süpürmek)
  - "mit einem Brötchen": kesik "abun(dance)" kelimesi → "çörek"
  - "Die Temperatur in der Atta-Höhle ist ein Nachteil": kesik "cons(tant)" → "dezavantaj"
  - "Balance-Wette": kesik "bet(ween)" → "bahis"
  - "fast tot": "dead centre" → "neredeyse ölü"
  - "2.185 Meter **langen** Kreuzspitze": yükseklik uzunluk olmuş
  - "104.000 Hektar": İngilizcede acre; birim yanlış
- **Ton:** "Empfohlen" (önerilir), İngilizcedeki "Suggested"dan daha güçlü bir ifade. Aynı kavram için üç farklı kalıp kullanılmış: Vorschlag / Vorgeschlagen / Empfohlen. "Erlauben Sie 1 Stunde" (Allow) ve "Frühes Erscheinen" resmî ve tuhaf duruyor. Abartı sorunu yok.
- **Uydurma ekler:** 6 yerde İngilizcede olmayan mesafe ya da hız eklenmiş:
  - "(ca. 32–48 km)" (20–30 dakika için)
  - "[ca. 72 km/h]"
  - "[ca. 1,6 km pro Minute Durchschnitt]"
  - mystic, iowa ve boundary-waters satırlarında "(ca. … km)"

### Fransızca

İyi olan kısımlar:

- Elle üretilmiş ABD satırları (chaco-culture, bryce-canyon-region, salmon-river, pictured-rocks, blue-ridge-parkway, organ-pipe…) doğal. Dil yaklaşık **8/10**.
- Terimler çoğunlukla doğru:
  - garde au sol élevée
  - départ de sentier
  - rampe de mise à l'eau
  - tôle ondulée
  - navette
  - permis
  - arrière-pays
  - camping-car
- Tipografi büyük ölçüde doğru: `:` ve `;` öncesinde boşluk %100, « » doğru.

Puanı düşüren kısımlar:

- **Şablonda isim öncesi artikel.** "pour le / au / du {ad}" her yer adının önüne otomatik konuyor. Adası artikelsiz olan yerlerde yanlış:
  - "pour le La Gomera"
  - "pour le Ærø"
  - "au Lovund"
  - "pour le Sørøya"
- **"Timing" başlığı** 38 satırda İngilizce kalmış.
- **İstenmeden mil eklenmiş.** 28 FR satırında, Fransız okuyucu için gereksiz "[19 miles]". Tutarsız örnekler:
  - "37 km [37 km]" (4 kez)
  - "Environ 10 miles [16 km]": İngilizcede 10 km, yani mesafe yanlış
  - "38 miles [61 km]": önce mil yazılmış
- **ABD satırlarında İngilizce kalıntılar:**
  - "7 AM", "8:30 AM", "avant 9 AM"
  - İngiliz usulü Başlık Büyük Harfi: "Frais d'Accès à la Plage", "Fiabilité Côtière"
  - Ay adları büyük harfle: "Juin – Septembre". Fransızcada küçük harf olmalı (7 satır).
- **Yer adlarında karışık dil:**
  - "les Carinthian Nockberge"
  - "High Tatras" ile "Hautes Tatras" aynı satırda
  - "Giant Mountains"
  - "Jamtland County"
  - "The Flemens Ven est…"
  - Sayı biçimleri: "63,786.5 ha .", "55.7 km"

---

## 3. Meta description (arama sonucu açıklaması) sayımı

Sayım Unicode karakteri cinsinden yapıldı.

| Dil | Satır | **> 160** (aramada kesilir) | **< 140** (zararsız) | 140–160 (ideal) |
|---|---|---|---|---|
| DE | 50 | **0** | **32** (125–139) | 18 |
| FR | 50 | **0** | **37** (65–139; 11 tanesi 110'un altında) | 13 |

- "metaDescription_outside_140_160" uyarısı alan 69 satırın **hepsi kısa taraf**. Hiçbiri aramada kesilmeyecek.
- **Ama 7 meta description zaten kesik.** 160'ın altında kalmalarına rağmen kelime ya da cümle ortasında bitiyorlar ve aramada bozuk görünür:
  - brecon-beacons (DE) "…bei offiziellen Stelle"
  - la-gomera "…l'île de La Go"
  - liechtensteinklamm "…(dernière"
  - bracciano "…du Lati"
  - salzburger-lungau "…l'UNESCO e"
  - ses-salines "…est un p"
  - sparbach (Almanca metin) "…Dieses"
- **4 meta title kelime ortasında kesik.** Kontrolünüzdeki "60'ı hiç aşmıyor" doğru, ama kısaltma kelime ortasından yapılmış:
  - DE: "…National Pa – Reiseplan"
  - FR: "…itinéraire et co"
  - FR: "…itinéra"
  - FR: "…Bracciano - M"
- **İçerik sorunu:**
  - DE'de 50 açıklamanın 38'i aynı genel şablon: "{Ad}: Besuchsplan, Karte und Hinweise zur Anreise. Zugang und saisonale Regeln …". Bu İngilizce açıklamanın çevirisi değil; arama sonuçlarında birbirinin kopyası gibi görünür.
  - FR'de 43/50 açıklama "{Ad} : {sloganın çevirisi}" biçiminde. 22'sinde ad iki kez geçiyor ("Lovund : Lovund est une île…"). 3'ünde birebir tekrar var: "Lake Cerknica : Lake Cerknica :".

---

## 4. Fransızcadaki 233 "İngilizce yer tutucu" vakası

**Örnekte bulunan:** FR çevirilerine sızan İngilizce yer tutucu **"Check official seasonal information" değil, `[dated source]`**.

- Bu örnekte "Check official seasonal information" **hiçbir çevrilmiş FR alanında geçmiyor**. 26 kez geçiyor, hepsi İngilizce kaynağın `best_season` alanında (18 DE, 8 FR satırı). Hepsi de çevrilmiş:
  - FR: "Consulter / Consultez les informations saisonnières officielles"
  - DE: "Überprüfen Sie die offiziellen Saisoninformationen"
- Örnekteki `placeholder_leak` uyarılı **21 FR satırının 21'i** tam olarak `[dated source]` içeren satırlar.
- DE'de bu uyarıyı alan tek satır boundary-waters. Orada köşeli işaret yok. Uyarıyı büyük olasılıkla jenerik başlangıç yerleri tetikliyor: "ab Entry Point", "ab Basislager", "ab Zeltplatz" (İngilizcede de öyle).

**233 sayısını bu örnekle doğrulayamıyorum.** Örnekteki 30 temsili FR satırının sadece 1'inde (varangerhalvoya) yer tutucu var. 233 satır "Check official seasonal information"ın FR metninde İngilizce kaldığı satırlarsa, o satırlar bu örnekte yok. Doğrulamak için veritabanında `content_translations` FR metninde `[dated source]` ve `Check official seasonal information` ayrı ayrı sayılmalı. Bu denetim salt okuma ve veritabanısız olduğu için sorguyu ben çalıştırmadım.

### Örnekte görülen farklı yer tutucu dizgeleri

| Yer tutucu | Dil | Nerede (alan) | Örnekte | Doğru yaklaşım |
|---|---|---|---|---|
| `[dated source]` (İngilizce) | FR | `days[].stops[].detail` (20 satır), `tagline` (2), `metaDescription` (2): orseg, sparbach, liechtensteinklamm | 21 satır | **Çevrilmemeli, kaldırılmalı.** İşaret bir tarih ya da yılın yerine geçmiş. Cümle tarihsiz yazılmalı. |
| `[source datée]` | FR | detail, tagline, metaDescription (salzburger-lungau, sparbach, liechtensteinklamm) | 3 satır | Çevrilmiş ama hâlâ yer tutucu, kaldırılmalı. Mevcut kontrol bunu yakalamıyor. |
| `[datierter Quelle]` / `[datiert Quelle]` | DE | detail (kristianstads-vattenrike, latrabjarg, aeolian-islands) | 3 satır | Aynı durum. İkincisi dilbilgisi olarak da yanlış. Kontrol yakalamıyor. |
| "Check official seasonal information" | EN kaynak → DE/FR | `bestSeason` | 18 DE + 8 FR satırı (çevrilmiş) | Gerçek bilgi değil, bir talimat. Aşağıdaki kısa metinle değiştirilmeli. |
| "No verified visitor-season recommendation is available for {N}; consult the park authority…" | EN → DE/FR | `bestSeason` | 18 DE + 31 FR | Çevrilmiş ama DE İngilizce söz dizimini kopyalıyor ("Keine verifizierte Empfehlung … ist für {N} verfügbar"). FR'de "pour le {N}" artikel hatası var. |

Kaynak metinde `[dated source]` işareti yılın yerine geçmiş. Bazı yerlerde bu anlamı bozuyor:

- "Natura [dated source]": AB koruma ağının adı **Natura 2000**. İşaret "2000" sayısını yemiş.
- "1991-[dated source] normals"
- "the [dated source]/22 season"

Bu bir **İngilizce kaynak (içerik hattı) hatası**. Çeviri adımında değil, üretim adımında düzeltilmeli.

### Önerilen doğru metinler (her farklı yer tutucu için)

| İngilizce (yer tutucu) | Önerilen Almanca | Önerilen Fransızca |
|---|---|---|
| `bestSeason`: Check official seasonal information | Saisonabhängig – bitte offizielle Angaben prüfen | Selon la saison – vérifiez les sources officielles |
| `bestSeason`: No verified visitor-season recommendation is available for {N}; consult the park authority for your travel dates. | Für {N} liegt keine geprüfte Empfehlung zur besten Reisezeit vor; fragen Sie für Ihre Reisedaten bei der Parkverwaltung nach. | Pas de recommandation de saison vérifiée pour {N} ; renseignez-vous auprès du gestionnaire du site pour vos dates. |
| `[dated source]` (tarih/yıl yerine) | Çevrilmez. Tarihli yan cümle silinir, örn. „Der Nationalpark wurde von Königin Sonja eröffnet.“ | Çevrilmez. Örn. « Le parc national a été inauguré par la reine Sonja. » |
| "Natura [dated source]" | Natura-2000-Gebiet | site Natura 2000 |
| "1991-[dated source] normals" | nach den aktuellen Klimanormalwerten | selon les normales climatiques les plus récentes |
| "the [dated source]/22 season" | in einer der letzten Saisons | au cours d'une saison récente |
| Bilgi kutusu: The reviewed sources do not establish {X} for {N}. Check the official visitor information before departure. | Die geprüften Quellen belegen keine Angaben zu {X} für {N}. Prüfen Sie vor der Abreise die offiziellen Besucherinformationen. | Nos sources ne précisent pas {X} pour {N}. Vérifiez les informations officielles avant de partir. |
| İzin notu: …Entry, activity permissions and overnight accommodation are separate checks; the source excerpts below do not establish availability for your dates. | …Eintritt, Aktivitätsgenehmigungen und Übernachtung müssen separat geprüft werden; die Quellenauszüge unten belegen keine Verfügbarkeit für Ihre Reisedaten. | …L'entrée, les autorisations d'activité et l'hébergement se vérifient séparément ; les extraits ci-dessous ne garantissent aucune disponibilité pour vos dates. |
| Choose one local visit; travel time and onward transfers are not verified. | Wählen Sie einen Besuch vor Ort; Fahrzeiten und Anschlussverbindungen sind nicht geprüft. (bugün: „Weiterleitungen“ = e-posta/URL yönlendirmesi) | Choisissez une visite sur place ; temps de trajet et correspondances non vérifiés. |

### Gerçek çeviri olmayan yer tutucu ya da dolgu metinler (örnekte)

- Köşeli işaretler: `[dated source]`, `[source datée]`, `[datierter Quelle]`, `[datiert Quelle]`.
- `bestSeason` alanındaki "Check official seasonal information" ve çevirileri: bilgi değil talimat.
- **DE meta açıklama şablonu:** 38/50 satır. İngilizce açıklamanın çevirisi değil, her yerde aynı cümle.
- **"Bilinmiyor" kutuları:**
  - DE'de 36 satır, FR'de 38 satır.
  - Etkilenen alanlar: bilgi kutularının hepsi, arrival, vehicle, goldenHour.
  - Bir sayfadaki yaklaşık 10 bilgi alanının 8'i "kaynaklar bunu belirtmiyor" diyor.
  - Dürüst bir yaklaşım, ama sayfa içeriği zayıf kalıyor.
- **Taslak (stub) cümleler:**
  - "Magura Cave: natürliche Attraktion in Bulgarien."
  - "Landscape Park Flemish Ardennes: Naturpark in **BE**." (ülke kodu metne girmiş)
  - "Pont d'Arc: Wasserfall Höhlenbildung in Frankreich." (İngilizce kaynak da anlamsız)
  - "Lake Cerknica : attraction naturelle en Slovénie."
- **Jenerik başlangıç yerleri:** "ab Entry Point / Basislager / Zeltplatz" (boundary-waters). Bunlar gerçek yer adı değil.

---

## 5. Kritik hatalar tablosu

| Slug | Dil | Alan | Örnek (şimdiki metin) | Sorun |
|---|---|---|---|---|
| aare-gorge (+24 satır) | DE | `days[2].start`, `days[2].driving` | "Vorschlag: Abfahrt am Morgen ab Aare Gorge" / "Etwa 18 km Luftlinie ab Aare Gorge" | İngilizcede "from Giessbach Falls". Başlangıç yeri ve mesafe referansı yanlış. |
| kristianstads-vattenrike (+35 satır) | DE | `days[0].note`, `permitNote` | "…aktivitätsberechtigungen … quellenauszüge … verfügbarkeit für ihre daten…" | Küçük harfli isimler ve "Ihre" (resmî hitap) küçük harfle. |
| aare-gorge (+35 satır) | DE | `intel[].title` | "Parkkontrolle", "Zugangskontrolle" | Anlam yanlış: park cezası denetimi, güvenlik kontrolü. |
| brecon-beacons-national-park | DE | `intel[0].title`, `tagline`, `metaTitle` | "Zugkopfkapazität", "fegenden roten Sandsteingipfeln", "…National Pa – Reiseplan" | Ham makine çevirisi, kesik başlık. |
| aber-falls | DE | `intel[4].title`, `goldenHour`, `days[0].title` | "Zugzugänglichkeit", "Sonnenuntergang Timing … Jahreszeiten", "Coastal Flats und Meadow Trails" | Trail → tren; İngilizce ve Almanca karışık. |
| atta-cave | DE | `tagline`, `days[1].stops[0].detail` | "Die Temperatur in der Atta-Höhle ist ein Nachteil", "mit einem Brötchen" | Kesik İngilizce kelimeler yanlış anlamla çevrilmiş. |
| allgau-alps | DE | `tagline` | "Marktoberdorf bietet eine attraktive Balance-Wette" | "balance bet(ween)" → "bahis". |
| ammergau-alps | DE | `days[2].stops[0].detail` | "das fast tot in Bad Bayersoien liegt" | "dead centre" → "neredeyse ölü". |
| bardenas-reales | DE | `days[0].stops[0].detail` | "(420 km2; 104.000 Hektar)" | Kaynakta 104,000 acres. Birim ve büyüklük yanlış. |
| hocking-hills | DE | `days[0].driving`, `days[1].driving` | "[ca. 72 km/h]", "[ca. 1,6 km pro Minute Durchschnitt]" | Uydurma rakamlar. |
| new-river-gorge-national-park | DE | `days[0].driving` | "Planen Sie 20–30 Minuten (ca. 32–48 km)…" | Uydurma ve çelişkili mesafe. |
| orseg-national-park | FR | `days[1].driving` | "Environ 54 km de la grotte Devetashka" | Alakasız bir yer (Bulgaristan'daki bir mağara). |
| sparbach-nature-park | FR | `tagline`, `metaDescription` | "Während des Lockdown im April [dated source] wurde im Naturpark Sparbach…" | FR sayfada Almanca metin ve yer tutucu. |
| blue-ridge-parkway | FR | `days[3].stops[1].detail` | "à 6 053 pieds (1 845 km) d'altitude" | Metre yerine kilometre. |
| folgefonna-national-park | FR | `days[1].driving` | "Environ 10 miles [16 km]" | Kaynakta 10 km. |
| orseg, liechtensteinklamm, salzburger-lungau | FR | `tagline`, `metaDescription` | "…créé en [dated source]…", "…[source datée]…(dernière" | Arama sonucunda yer tutucu ve kesik metin görünür. |
| la-gomera, ro (Ærø), lovund, soroya | FR | bilgi kutuları, `vehicle`, `goldenHour`, `bestSeason` | "pour le La Gomera", "au Ærø" | Artikel hatası, dilbilgisi olarak yanlış. |
| lake-cerknica, helgustadir-mine, loire-anjou… | FR | `metaDescription` | "Lake Cerknica : Lake Cerknica : attraction naturelle en Slovénie." | Ad iki kez tekrar ediyor, içerik yok. |
| loire-anjou…, salzburger-lungau, bracciano | FR | `metaTitle` | "…itinéraire et co", "…itinéra", "…Bracciano - M" | Kelime ortasında kesik başlık. |
| snow-canyon | FR | `days[2].title`, `days[].start` | "White Rocks and High Overlooks", "Suggéré : 7 AM depuis St. George" | Başlık İngilizce, saat biçimi İngilizce. |

---

## 6. Sistematik (şablon/sözlük) ve tekil hatalar

**Sistematik.** Şablon ya da sözlük düzeyinde, tek bir düzeltmeyle çok satırı düzeltir:

| Sorun | Dil | Örnekte etki | Düzeltme yeri |
|---|---|---|---|
| 3. gün başlangıç ve mesafe referansı ana yere bağlanmış | DE | 25/25 çok günlü şablon satırı | Gün başlangıcı ve sürüş şablonu. Yer adı değişkeni yanlış. |
| Küçük harfli isimler ve "feststellen" | DE | 36 satır, 85 alan | İzin notu ve gün notu şablonu |
| "Parkkontrolle / Zugangskontrolle / Signalprüfung / Kraftstoffprüfung / Zeitplanungsprüfung" | DE | 36 satır | Bilgi kutusu başlık sözlüğü |
| "legen … fest / stellen … fest / erstellen keine Best-Saison-Empfehlung" | DE | 36 satır × 8 alan | Bilgi kutusu metin şablonu |
| "Weiterleitungen" (onward transfers) | DE | 25 satır | Gün sürüş şablonu |
| Genel meta açıklama, İngilizcenin çevirisi değil | DE | 38/50 | Meta açıklama üretimi |
| Vorschlag / Vorgeschlagen / Empfohlen karışık | DE | tüm satırlar | Tek terim seçilmeli: "Vorschlag:" |
| "pour le / au / du {ad}" artikeli | FR | 38 satır (4'ünde açıkça yanlış) | Şablonda artikelsiz yazım: "pour {N}", "à {N}" |
| "Timing" başlığı | FR | 38 satır | Bilgi kutusu başlık sözlüğü |
| Mil eklemesi, "km [km]" | FR | 28 satır | Sürüş şablonu ve çeviri talimatı: birim çevirme |
| "Suggestion / Suggéré / Conseillé" ve "Environ / À environ" karışık | FR | tüm satırlar | Tek kalıp |
| "{Ad} : {slogan}" meta açıklama (ad iki kez) | FR | 43/50 | Meta açıklama üretimi |
| `[dated source]` işareti | EN kaynak → FR (çevrilmeden), DE ve FR (çevrilmiş) | FR 21, DE 3 | İçerik hattı (İngilizce), ayrıca `placeholder_leak` kontrolü çevrilmiş biçimleri de aramalı |
| Kesik İngilizce kaynak (slogan ve detay ~110 karakterde kesilmiş) | EN kaynak → DE/FR | 19 slogan noktalama işaretiyle bitmiyor | İçerik hattı. Çevirmen kesik kelimeyi yanlış tamamlıyor ("Nachteil", "Brötchen", "Balance-Wette", "Foren"). |
| ABD satırlarında "AM", ay adları büyük harf, İngiliz usulü başlık büyük harfi | FR | ABD satırlarının çoğu | Elle üretilen planların FR çeviri talimatı |
| Yer adlarına İngilizce cins ismi eklenmiş ("Märjelensee lake", "Ammertal valley", "Atta cave", "Starina reservoir") | EN kaynak → DE | 5 satır | İngilizce durak adlarında gereksiz ek. Ad kuralı gereği çevrilmemiş ama Almanca sayfada karışık dil gibi görünüyor. |

**Tekil.** Satıra özgü, şablon değil. En kötü 20 DE satırında yoğunlaşıyor (aber-falls, brecon-beacons, atta-cave, allgau-alps, aletsch-forest, ammergau-alps, bardenas-reales, chamonix, oland, amalfi-coast):

- Ham makine çevirisi
- Uydurma sayılar (hocking-hills, new-river, iowa, mystic, boundary-waters)
- Birim hatası (bardenas: acre → Hektar; blue-ridge: m → km)
- Yanlış yer (orseg → Devetashka)
- Yanlış dil (sparbach)

---

## 7. Almancada küçük harfli isimler ve karışık dil

**Küçük harfli isimler.** Örnekteki tüm DE metni iki yöntemle tarandı:

1. İsim eki taşıyan küçük harfli kelimeler (-ung, -keit, -tät, -schaft…)
2. Aynı metinde büyük harfle de geçen ama küçük yazılmış kelimeler

Gerçek hata **yalnızca tek bir şablon cümlesinde** var:

- aktivitätsberechtigungen
- quellenauszüge
- verfügbarkeit
- ihre daten → "Ihre Daten"

Bu cümle 36 satırda, 85 alanda geçiyor. Satıra özgü metinlerde küçük harfle yazılmış isim bulunmadı. Bulunan diğer adaylar (derzeit, jederzeit, falls, aber…) zarf ya da bağlaç, yani hata değil.

Ayrıca iki yerde noktalı virgülden sonra büyük harf var, Almancada bu yanlış:

- aber-falls: "; Die", "; Überprüfen"
- aeolian-islands: "; Die"

**Karışık dil (DE sayfasında İngilizce).**

Başlıklar:

- "Northern Nature und Royal Sights"
- "Coastal Flats und Meadow Trails"
- "Central Peaks und Canal Heritage"
- "Spring und Caves Exploration"
- "Forstforschung und High Peaks"
- "Seen und Ridges…"
- "Geyser Site Spektakel"

Kutu başlıkları:

- "Cellular Coverage Gap"
- "Gateway Supplies"
- "Dark Sky Stargazing"

Metin içinde:

- "unglaublich narro"
- "Pacing ist ein Vorschlag"
- "Scenic Drive"
- "Birding"
- "Guillemots"
- "Balderschwang Yew"
- "Lakeside Ansichten und Dampf Erbe"

İtalyanca kalıntı: "die incorpora" (frasassi-caves, kesik kaynak). Almanca sayfada Fransızca, Portekizce ya da Yunanca metin **bulunmadı**. Fransızca özel adlar (Parc naturel régional…, Lac du Bourget) ad kuralı gereği aynen kalmış, bu doğru.

**Karışık dil (FR sayfasında).**

- Almanca: sparbach'ın slogan ve meta açıklaması.
- İngilizce:
  - "White Rocks and High Overlooks"
  - "Timing" (38 satır)
  - "The Flemens Ven est"
  - "Natural Park of the Salines of Ibiza and Formentera"
  - "Carinthian Nockberge"
  - "High Tatras"
  - "Giant Mountains"
  - "Jamtland County"
  - "South Island / West Coast"
  - "Pančavská louka Meadow"
  - "Labský důl Valley"

Ad kuralı "Lake Hévíz", "Cross Cave" gibi kayıtlı adların değişmemesini istiyor; bunlar hata sayılmadı. Ama aynı satırda hem "Lake Balaton" hem "lac Balaton" kullanılması tutarsız.

**Çevrilmemesi gereken adlar çevrilmiş mi?** `name` alanında yalnızca 1 değişiklik var: "Bryce Canyon region" → "Région de Bryce Canyon". Bu kabul edilebilir. Metin içinde DE "Kristianstads Wasserreich", FR "Parc National Suisse" gibi yerleşik karşılıklar kullanılmış. Hata sayılmadı, ama aynı paragrafta iki farklı ad kullanılması (DE: "Kristianstad Water Kingdom" ve "Kristianstads Wasserreich") tutarsız.

---

## 8. Fransız tipografisi

- `:` öncesinde boşluk: 374/374. `;` öncesinde boşluk: 339/339. `!` 1/1. Eksik yok.
- **Ancak boşlukların hepsi normal boşluk (U+0020).** Bölünmez ince boşluk (U+202F) ya da bölünmez boşluk (U+00A0) değil. Satır sonunda ":" ya da ";" tek başına alt satıra düşebilir. Şablon ve işleme düzeyinde düzeltilmeli.
- « » tırnak işareti 9 yerde doğru, iç boşluklarla kullanılmış. İngilizce tırnak FR metinde yok. Tek istisna sparbach'taki Almanca „…“.
- Sayı biçimi hataları:
  - "63,786.5 ha ."
  - "55.7 km"
  - "4.8 miles"
  - "[25.5 miles]"
  - Noktadan önce boşluk: "440 km2 .", "430 km2 ."
- Saat biçimi: "7 AM", "8:30 AM", "09:00 à 18:00" yerine "7 h", "8 h 30", "9 h – 18 h" olmalı. "9h00" biçimi tutarsız.
- Ay adları `bestSeason`'da büyük harfle yazılmış (7 satır). Fransızcada küçük harf olmalı. blue-ridge doğru yazmış ("mai – juin").

---

## 9. Karar: indekste kalsın mı, taslağa mı dönsün?

**Genel olarak: indekste kalabilir.** Gerekçe:

- Sorunların çoğu şablon düzeyinde ve deterministik. Düz metin değiştirmeyle, yapay zekâ maliyeti olmadan tüm satırlarda düzeltilebilir.
- Elle üretilmiş satırlar iyi.
- Durak ve gün sayıları ile `metaTitle` uzunluğu sizin kontrolünüze göre her yerde doğru.

**Şartlar ve öncelik sırası:**

1. **Hemen (şablon düzeltmesi, tüm DE satırları):**
   - 3. gün başlangıç ve mesafe referansı
   - küçük harfli isim cümlesi
   - bilgi kutusu başlıkları ve "legen … fest" kalıbı

   Örnekteki oranlar tüm DE'ye benzer şekilde yansırsa, 3.087 satırın çoğunluğu etkileniyor. Kesin sayı veritabanında sayılmalı.
2. **Hemen (FR):**
   - `[dated source]` / `[source datée]` temizliği
   - artikel şablonu
   - "Timing"
   - mil ve "km [km]" ekleri
3. **Düzeltilene kadar taslağa (noindex) çekilmesi önerilen satırlar.** İçerik olarak yanıltıcı ya da bozuk; arama sonucunda kötü görünür:
   - DE: aber-falls, brecon-beacons-national-park, atta-cave, allgau-alps, aletsch-forest, ammergau-alps, bardenas-reales
   - FR: sparbach-nature-park, orseg-national-park, liechtensteinklamm, salzburger-lungau-and-karntner-nockberge-biosphere, ses-salines-natural-park

   Veritabanının geri kalanında aynı profili taşıyan satırlar (ham makine çevirisi, yanlış dil, slogan veya meta açıklamada yer tutucu) da aynı şekilde ele alınmalı. Bunlar en kötü 20'lik gruptan; temsili grupta bu ağırlıkta hata yok.
4. **Kaynak tarafı (İngilizce içerik hattı):**
   - `[dated source]` işaretinin yılları silmesi ("Natura 2000" dahil)
   - ~110 karakterde kesilen slogan ve detaylar
   - anlamsız taslaklar ("Wasserfall Höhlenbildung", "Naturpark in BE")
   - kurum dilinde kopyalanmış metinler ("notre boutique", "Quel honneur et quelle joie…")

   Bunlar çeviri hatası değil, ama çeviri kalitesini doğrudan bozuyor.
5. **Kontrol iyileştirmesi:** `placeholder_leak` kontrolü çevrilmiş biçimleri de aramalı: `[source datée]`, `[datierter Quelle]`, `[datiert Quelle]`. Ayrıca kesik başlık ve açıklamalar için "kelime ortasında bitiyor" kontrolü eklenmeli.

---

## 10. Sözlük: EN → DE → FR (bu denetimde bulunanlardan)

`glossary.md` korunmuştur. Bu tablo örnekte görülen hatalara göre doğru terimleri listeler.

| EN | DE (doğru) | FR (doğru) | Örnekte görülen hata |
|---|---|---|---|
| campground | Campingplatz | camping | — (ikisi de doğru) |
| campsite | Stellplatz / Zeltplatz | emplacement (de camping) | — |
| timed entry (permit) | Zeitfenster-Ticket / zeitgebundene Eintrittsgenehmigung | entrée sur créneau horaire | FR "entrée minutée" (anlaşılır ama doğal değil) |
| permit | Genehmigung | permis | DE "Einreiseerlaubnis" (vize anlamı), "Permits" (İngilizce) |
| backcountry | Hinterland | arrière-pays | — |
| 4WD | Allradantrieb (4x4) | 4x4 / quatre roues motrices | — |
| high-clearance vehicle | Fahrzeug mit hoher Bodenfreiheit | véhicule à garde au sol élevée | — |
| ferry | Fähre | ferry / bac | — |
| crossing (boat) | Überfahrt | traversée | DE "Kreuzungen" (kavşak) |
| scheduled boat | Linienschiff / Fährverbindung | bateau de ligne | DE "geplantes Boot" |
| shuttle | Shuttle | navette | — |
| trail | Wanderweg / Pfad | sentier | DE "Zug" (tren) |
| trailhead | Wanderparkplatz / Ausgangspunkt | départ de sentier | DE "Zugkopf" |
| ranger station | Rangerstation | poste des rangers | (örnekte geçmiyor) |
| visitor center | Besucherzentrum (özel ad ise Visitor Center) | centre d'accueil (özel ad ise Visitor Center) | — |
| overlook / viewpoint | Aussichtspunkt | belvédère / point de vue | DE "Standpunkt" (görüş, fikir) |
| gateway town | Ausgangsort | ville-porte / ville étape | DE "an den Toren", "Gateway Supplies" |
| parking check (kutu başlığı) | Parken | Stationnement | DE "Parkkontrolle" |
| access check | Zugang | Accès | DE "Zugangskontrolle" |
| signal check | Mobilfunkempfang | Réseau mobile | DE "Signalprüfung" |
| fuel check | Tanken | Carburant | DE "Kraftstoffprüfung" |
| timing / best season | Beste Reisezeit | Meilleure période | DE "Zeitplanungsprüfung", FR "Timing" |
| suggested (start) | Vorschlag: | Suggestion : | DE üç kalıp, "Empfohlen" (fazla güçlü) |
| allow (time) | Planen Sie … ein | Prévoyez … | DE "Erlauben Sie", "Lassen Sie" |
| onward transfers | Anschlussverbindungen / Weiterreise | correspondances | DE "Weiterleitungen" |
| RV / motorhome | Wohnmobil | camping-car | DE "RV-Zugang" |
| gravel / dirt road | Schotterstraße | route en gravier / en terre | — |
| washboard (road) | Wellblechpiste | tôle ondulée | — |
| boat ramp / launch | Bootsrampe / Einsetzstelle | rampe de mise à l'eau | — |
| first-come, first-served | nach dem Prinzip „Wer zuerst kommt, mahlt zuerst“ | premier arrivé, premier servi | — |
| tide tables | Gezeitentabellen | horaires des marées | — |
| bunkhouse | Gruppenunterkunft | gîte d'étape | DE "Etagenhaus" |
| skerry / shoal | Schäre / Untiefe | écueil / haut-fond | DE "Schwarm" |
| (topographic) prominence | Schartenhöhe (Prominenz) | proéminence | DE "wichtigste" |
| tarn | Bergsee | lac de montagne | DE "Tarnen" |
| Natura 2000 site | Natura-2000-Gebiet | site Natura 2000 | EN/FR "Natura [dated source]" |
| High Tatras | Hohe Tatra | Hautes Tatras | FR "High Tatras" |
| Giant Mountains | Riesengebirge | monts des Géants | FR "Giant Mountains" |
| ice season | Glatteis-Saison / Winter | saison du verglas | DE "Eiszeit" (buzul çağı) |
| Units | ft → m dönüştür (zaten kısmen yapılıyor) | km kullan; mil **ekleme** | FR 28 satır mil, 1 yanlış |

---

## 11. Önerilen düzeltmeler dosyası

`proposed-row-fixes.json`: **552 kayıt, 94 satır** (DE 394, FR 158). Hiçbir yere **uygulanmadı**.

- Her kayıtta şu alanlar var: `slug`, `locale`, `field`, `old` (tam şimdiki değer), `new` (tam önerilen değer), `reason`.
- Ek olarak `scope` alanı var:
  - `template`: aynı şablon hatasının bu satırdaki örneği (400 kayıt)
  - `row`: satıra özgü (152 kayıt)
- Her `old` değeri örnek dosyayla birebir karşılaştırılarak doğrulandı.
- Değiştirilen `metaTitle` değerleri ≤ 60, `metaDescription` değerleri ≤ 160 karakter.
- Uydurma bilgi eklenmedi. Yer tutucular tarihsiz cümleye çevrildi. Tek istisna "Natura 2000": bu bir tarih değil, AB ağının adı. Meta açıklamalarda gereken içerik aynı satırın detay metninden alındı.
- Kapsam dışı bırakılanlar raporda anlatılıyor ama dosyada yok:
  - bilgi kutusu metinlerindeki "legen … fest" kalıbı: şablon düzeyinde tek bir değişiklik olarak daha uygun (yukarıdaki tablo)
  - DE genel meta açıklama şablonu
  - FR mil eklemeleri (sadece hatalı olanlar dosyada)
  - kaynakta zaten kesik olan sloganlar

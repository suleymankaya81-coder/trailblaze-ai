# Olgu kontrolü — rewrites/proposals.json (2026-11-22)

Kontrol edilen: 303 REWRITE önerisi (CLEAR ve WRONG_PLACE metin yazmadığı için kapsam dışı). Betik: `fact_check.py`.

**Yöntem.** Yeni metindeki her sayı (rakam ve sayı kelimeleri: nine/neun/neuf, fifth/fünfte…), birim (km2, ha, km, m, %) ve büyük harfle başlayan özel ad aşağıdakilerden en az birinde aranır. Aksan, büyük/küçük harf ve sayı ayırıcıları yok sayılır (1,278 = 1.278 = 1 278).

- a) aynı alanın eski metni,
- b) aynı yerin İngilizce metni: canlı önizleme dışa aktarımları (`preview-2026-11-22-live/needs-human.json`, `write-list-with-old.json`) ve `sample.json`,
- c) `scripts/content-pipeline/**/<slug>.json`: source-packets, combined-content, multiday, german-page-cache ve diğer önbellekler (124 slug için 363 dosya).

de/fr için çevrilmiş yer adları `ALIAS` listesiyle İngilizce adla eşlenir (örn. Norvège → Norway, Pouilles → Apulia, Bois-le-Duc → 's-Hertogenbosch, CFF → SBB, Jura souabe → Schwäbische Alb). Almanca cins isimler (Gemeinde, Provinz, Nationalpark…) ad sayılmaz. Listelerin tamamı betikte.

**Sınır.** Kontrol, bir olgunun kaynakta *bulunduğunu* doğrular; olguların doğru eşleştiğini (hangi sayının hangi şeye ait olduğunu) doğrulamaz. Bu bir okuma kontrolüdür, tam doğrulama değildir.

## Sayılar

| Dil | Kontrol edilen | İlk çalıştırma: geçti | İlk çalıştırma: kaldı | Düzeltmeden sonra kaldı |
|---|---|---|---|---|
| en | 124 | 110 | 14 | 0 |
| de | 67 | 64 | 3 | 0 |
| fr | 112 | 107 | 5 | 0 |
| **Toplam** | **303** | **281** | **22** | **0** |

Değişen öneri: **22** (en 14, de 3, fr 5). Hiçbiri CLEAR'a dönmedi; karar sayıları aynı kaldı (REWRITE 303, CLEAR 17, WRONG_PLACE 147).

## İlk çalıştırmada kalan öneriler

| Dil | slug | Alan | Bulunamayan olgu | Metnin alındığı yer | Düzeltme |
|---|---|---|---|---|---|
| de | `parco-naturale-regionale-del-vulture` | `tagline` | number: 9 | aynı yerin İngilizce `days[0].stops[0].detail` metni; de/fr: bunun çevirisi | „dokuz/nine/neun/neuf" kaynakta yok (belediyeler sayılarak türetilmişti) → sayı çıkarıldı |
| de | `sheskinmore-nature-reserve` | `days[0].stops[0].detail` | name: County, name: Grönland | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş; de/fr: bunun çevirisi | „Co. Donegal" (kaynaktaki yazım); „Grönland" çıkarıldı (kaynakta yazım hatası „Greensland") |
| de | `sila-national-park` | `days[0].stops[0].detail` | name: Monte | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş; de/fr: bunun çevirisi | kaynaktaki „Mt." / yalnız dağ adı |
| en | `harz-national-park` | `seo_description` | name: Lower | aynı yerin İngilizce `days[0].stops[0].detail` metni | „Lower Saxony" → kaynaktaki „Niedersachsen"; SEO: „two federal states" |
| en | `harz-national-park` | `travel_plan.days[0].stops[0].detail` | name: Lower | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | „Lower Saxony" → kaynaktaki „Niedersachsen"; SEO: „two federal states" |
| en | `jizerskohorske-buciny` | `travel_plan.days[0].stops[0].detail` | name: Mountains | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | „Jizera mountain beech forests" (kaynaktaki ifade) |
| en | `morskie-oko` | `travel_plan.days[0].stops[0].detail` | name: Mięguszowieckie | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | kaynaktaki „Mięguszowiecki Summits" / „sommets Mięguszowiecki" |
| en | `national-park-of-eastern-macedonia-and-thrace` | `travel_plan.days[0].stops[0].detail` | name: Delta | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | küçük harf „Nestos delta" (kaynakta „D. Nestos") |
| en | `parc-naturel-regional-aubrac` | `travel_plan.days[0].stops[0].detail` | name: France | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | „53rd/52nd French regional natural park" (kaynaktaki ifade) |
| en | `parco-naturale-regionale-del-vulture` | `seo_description` | number: 9 | aynı yerin İngilizce `days[0].stops[0].detail` metni | „dokuz/nine/neun/neuf" kaynakta yok (belediyeler sayılarak türetilmişti) → sayı çıkarıldı |
| en | `parco-naturale-regionale-del-vulture` | `tagline` | number: 9 | aynı yerin İngilizce `days[0].stops[0].detail` metni | „dokuz/nine/neun/neuf" kaynakta yok (belediyeler sayılarak türetilmişti) → sayı çıkarıldı |
| en | `ponga-nature-park` | `travel_plan.days[0].stops[0].detail` | name: Cantabrian | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | kaynaktaki „Cantábrica range" |
| en | `sainte-baume-regional-nature-park` | `travel_plan.days[0].stops[0].detail` | name: France | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | „53rd/52nd French regional natural park" (kaynaktaki ifade) |
| en | `serra-de-tramuntana` | `travel_plan.days[0].stops[0].detail` | name: Site | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | „has UNESCO World Heritage status" (kaynaktaki ifade) |
| en | `sheskinmore-nature-reserve` | `travel_plan.days[0].stops[0].detail` | name: Greenland | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | „Greenland" çıkarıldı (kaynakta „Greensland") |
| en | `sila-national-park` | `travel_plan.days[0].stops[0].detail` | name: Monte | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | kaynaktaki „Mt." / yalnız dağ adı |
| en | `waterloopbos` | `travel_plan.days[0].stops[0].detail` | name: Hydraulics | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş | kaynaktaki „Waterloopkundige Laboratorium in Delft" |
| fr | `morskie-oko` | `days[0].stops[0].detail` | name: Mięguszowieckie | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş; de/fr: bunun çevirisi | kaynaktaki „Mięguszowiecki Summits" / „sommets Mięguszowiecki" |
| fr | `parc-naturel-regional-aubrac` | `days[0].stops[0].detail` | name: France | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş; de/fr: bunun çevirisi | „53rd/52nd French regional natural park" (kaynaktaki ifade) |
| fr | `parco-naturale-regionale-del-vulture` | `metaDescription` | number: 9 | aynı yerin İngilizce `days[0].stops[0].detail` metni; de/fr: bunun çevirisi | „dokuz/nine/neun/neuf" kaynakta yok (belediyeler sayılarak türetilmişti) → sayı çıkarıldı |
| fr | `parco-naturale-regionale-del-vulture` | `tagline` | number: 9 | aynı yerin İngilizce `days[0].stops[0].detail` metni; de/fr: bunun çevirisi | „dokuz/nine/neun/neuf" kaynakta yok (belediyeler sayılarak türetilmişti) → sayı çıkarıldı |
| fr | `sainte-baume-regional-nature-park` | `days[0].stops[0].detail` | name: France | aynı alanın İngilizce metni (`travel_plan.days[0].stops[0].detail`), temizlenmiş; de/fr: bunun çevirisi | „53rd/52nd French regional natural park" (kaynaktaki ifade) |

## Değişen metinler (önce → sonra)

- **de · `parco-naturale-regionale-del-vulture` · `tagline`**
  - önce: Ein Naturschutzgebiet rund um den Vulture und neun Gemeinden der Provinz Potenza, darunter Melfi.
  - sonra: Ein Naturschutzgebiet rund um den Vulture, mit einem Teil von Melfi, in der Provinz Potenza.
- **de · `sheskinmore-nature-reserve` · `days[0].stops[0].detail`**
  - önce: Sheskinmore ist ein großes Gebiet aus Sanddünen, See und Marsch zwischen Kiltooris und dem Strand von Ballinreavy, nordwestlich von Ardara im County Donegal. Es ist besonderes Schutzgebiet, Vogelschutzgebiet und Wasservogelreservat und leicht über das Tor in Mullyvea gegenüber dem Kiltooris Lough erreichbar. Das Gelände besteht vor allem aus festliegenden Dünen mit Machair-Grasland, Dünentälern, dem Sheskinmore Lough und den umliegenden Marschen, Niedermooren und Schilfflächen. Im Winter äst hier ein kleiner Trupp Grönland-Blässgänse, dazu Alpenkrähen und Berghänflinge; zu den Orchideen zählen Sumpf-Stendelwurz, Bienen-Ragwurz und die seltene Irische Orchidee. Das Reservat wird vom NPWS betreut und im Winter beweidet, um die Pflanzenvielfalt zu fördern. Zwischen Oktober und Mai ist auf Weidetiere zu achten; Hunde sind an der Leine zu führen und Tore zu schließen, da ein Teil des Geländes in Privatbesitz ist.
  - sonra: Sheskinmore ist ein großes Gebiet aus Sanddünen, See und Marsch zwischen Kiltooris und dem Strand von Ballinreavy, nordwestlich von Ardara in Co. Donegal. Es ist besonderes Schutzgebiet, Vogelschutzgebiet und Wasservogelreservat und leicht über das Tor in Mullyvea gegenüber dem Kiltooris Lough erreichbar. Das Gelände besteht vor allem aus festliegenden Dünen mit Machair-Grasland, Dünentälern, dem Sheskinmore Lough und den umliegenden Marschen, Niedermooren und Schilfflächen. Im Winter äst hier ein kleiner Trupp Blässgänse, dazu Alpenkrähen und Berghänflinge; zu den Orchideen zählen Sumpf-Stendelwurz, Bienen-Ragwurz und die seltene Irische Orchidee. Das Reservat wird vom NPWS betreut und im Winter beweidet, um die Pflanzenvielfalt zu fördern. Zwischen Oktober und Mai ist auf Weidetiere zu achten; Hunde sind an der Leine zu führen und Tore zu schließen, da ein Teil des Geländes in Privatbesitz ist.
- **de · `sila-national-park` · `days[0].stops[0].detail`**
  - önce: Der Nationalpark Sila (italienisch: Parco nazionale della Sila) liegt in Kalabrien auf der Hochebene der Sila. Er wurde 1997 gegründet und umfasst rund 74.000 Hektar. Die höchsten Berge sind der Monte Botte Donato (1.928 m) in der Sila Grande und der Monte Gariglione (1.764 m) in der Sila Piccola. Der Park schließt Gebiete des früheren Nationalparks Kalabrien (1968) ein und schützt ökologisch wertvolle Landschaften in Sila Piccola, Sila Grande und Sila Greca in 21 Gemeinden der Provinzen Catanzaro, Cosenza und Crotone.
  - sonra: Der Nationalpark Sila (italienisch: Parco nazionale della Sila) liegt in Kalabrien auf der Hochebene der Sila. Er wurde 1997 gegründet und umfasst rund 74.000 Hektar. Die höchsten Berge sind der Botte Donato (1.928 m) in der Sila Grande und der Gariglione (1.764 m) in der Sila Piccola. Der Park schließt Gebiete des früheren Nationalparks Kalabrien (1968) ein und schützt ökologisch wertvolle Landschaften in Sila Piccola, Sila Grande und Sila Greca in 21 Gemeinden der Provinzen Catanzaro, Cosenza und Crotone.
- **en · `harz-national-park` · `seo_description`**
  - önce: Harz National Park spans Saxony-Anhalt and Lower Saxony, from Herzberg to Bad Harzburg and Ilsenburg, rising to 1,141 m on the Brocken.
  - sonra: Harz National Park spans two federal states, from Herzberg to Bad Harzburg and Ilsenburg, rising to 1,141 m on the Brocken.
- **en · `harz-national-park` · `travel_plan.days[0].stops[0].detail`**
  - önce: Harz National Park covers two federal states: the eastern part in Saxony-Anhalt, set up in 1990, has 8,900 ha of land, and the western part, established by Lower Saxony in 1994, covers 15,800 ha. Together the park covers about 24,700 ha and is part of Natura 2000, the European nature conservation network.

The park stretches from the low hills near Herzberg in the south, across the Harz massif, to its northern slopes near Bad Harzburg and Ilsenburg. It spans the full range of characteristic ecosystems, altitudes, slopes and rocks, from about 240 m in the north and 270 m on the southern edge up to 1,141 m on the Brocken, with several vegetation zones.

The park is virtually uninhabited, though it contains a few settlements. Almost all of its land is forested and owned by the federal states.

Research has identified many habitats that are close to a natural state by Central European standards, such as the high and middle zones of the Harz, rocky biotopes, many streams and a large area of beech, spruce and mixed forest. In some sections, however, forest management is still needed to bring the forest closer to its original natural condition.
  - sonra: Harz National Park covers two federal states: the eastern part in Saxony-Anhalt, set up in 1990, has 8,900 ha of land, and the western part, established by Niedersachsen in 1994, covers 15,800 ha. Together the park covers about 24,700 ha and is part of Natura 2000, the European nature conservation network.

The park stretches from the low hills near Herzberg in the south, across the Harz massif, to its northern slopes near Bad Harzburg and Ilsenburg. It spans the full range of characteristic ecosystems, altitudes, slopes and rocks, from about 240 m in the north and 270 m on the southern edge up to 1,141 m on the Brocken, with several vegetation zones.

The park is virtually uninhabited, though it contains a few settlements. Almost all of its land is forested and owned by the federal states.

Research has identified many habitats that are close to a natural state by Central European standards, such as the high and middle zones of the Harz, rocky biotopes, many streams and a large area of beech, spruce and mixed forest. In some sections, however, forest management is still needed to bring the forest closer to its original natural condition.
- **en · `jizerskohorske-buciny` · `travel_plan.days[0].stops[0].detail`**
  - önce: The Jizera Mountains beech forests (Jizerskohorské bučiny) form a national nature reserve created on 16 August 1999 by merging seven earlier reserves: Špičák, Slouvá vrch, Míledník, Štolpichy, Tistina, Frýdlantské cimbuří and Paličník. They became the first Czech natural site included on the UNESCO World Heritage List.
  - sonra: The Jizera mountain beech forests (Jizerskohorské bučiny) form a national nature reserve created on 16 August 1999 by merging seven earlier reserves: Špičák, Slouvá vrch, Míledník, Štolpichy, Tistina, Frýdlantské cimbuří and Paličník. They became the first Czech natural site included on the UNESCO World Heritage List.
- **en · `morskie-oko` · `travel_plan.days[0].stops[0].detail`**
  - önce: Morskie Oko ('Eye of the Sea') is the largest and fourth-deepest lake in the Tatra Mountains, in southern Poland. It lies deep within Tatra National Park in the Rybi Potok Valley of the High Tatras, at the foot of the Mięguszowieckie Peaks, in Lesser Poland Voivodeship.
  - sonra: Morskie Oko ('Eye of the Sea') is the largest and fourth-deepest lake in the Tatra Mountains, in southern Poland. It lies deep within Tatra National Park in the Rybi Potok Valley of the High Tatras, at the foot of the Mięguszowiecki Summits, in Lesser Poland Voivodeship.
- **en · `national-park-of-eastern-macedonia-and-thrace` · `travel_plan.days[0].stops[0].detail`**
  - önce: The National Park of Eastern Macedonia and Thrace takes in the previously protected Nestos Delta, Lake Vistonida, Lake Ismarida and their wider area. Its wetland complex is one of the most important in Greece because of its size and its great biological, aesthetic, scientific, geomorphological and educational value. The park aims to protect habitats and rare plant and animal species that are endemic to or breed in the region.
  - sonra: The National Park of Eastern Macedonia and Thrace takes in the previously protected Nestos delta, Lake Vistonida, Lake Ismarida and their wider area. Its wetland complex is one of the most important in Greece because of its size and its great biological, aesthetic, scientific, geomorphological and educational value. The park aims to protect habitats and rare plant and animal species that are endemic to or breed in the region.
- **en · `parc-naturel-regional-aubrac` · `travel_plan.days[0].stops[0].detail`**
  - önce: The Aubrac Regional Natural Park is a French regional natural park covering about 2,282 km2 across 64 communes in the Aveyron, Lozère and Cantal departments, around the Aubrac plateau. It is France's 53rd regional natural park.
  - sonra: The Aubrac Regional Natural Park is a French regional natural park covering about 2,282 km2 across 64 communes in the Aveyron, Lozère and Cantal departments, around the Aubrac plateau. It is the 53rd French regional natural park.
- **en · `parco-naturale-regionale-del-vulture` · `seo_description`**
  - önce: A protected area around the Vulture and nine municipalities of the Province of Potenza, including Melfi.
  - sonra: A protected natural area around the Vulture, including part of Melfi, in the Province of Potenza.
- **en · `parco-naturale-regionale-del-vulture` · `tagline`**
  - önce: A protected area around the Vulture and nine municipalities of the Province of Potenza, including Melfi.
  - sonra: A protected natural area around the Vulture, including part of Melfi, in the Province of Potenza.
- **en · `ponga-nature-park` · `travel_plan.days[0].stops[0].detail`**
  - önce: Ponga Natural Park is a Spanish protected natural space in the central Cantabrian Mountains, with a protected area of 20,533 ha, most of it in the municipality of Ponga.
  - sonra: Ponga Natural Park is a Spanish protected natural space in the central area of the Cantábrica range, with a protected area of 20,533 ha, most of it in the municipality of Ponga.
- **en · `sainte-baume-regional-nature-park` · `travel_plan.days[0].stops[0].detail`**
  - önce: The Sainte-Baume Regional Nature Park covers about 84,367 ha across the Bouches-du-Rhône and Var departments, around the massif of the same name. It is France's 52nd regional natural park.
  - sonra: The Sainte-Baume Regional Nature Park covers about 84,367 ha across the Bouches-du-Rhône and Var departments, around the massif of the same name. It is the 52nd French regional natural park.
- **en · `serra-de-tramuntana` · `travel_plan.days[0].stops[0].detail`**
  - önce: The Serra de Tramuntana is a mountain range running southwest–northeast that forms the northern backbone of the Spanish island of Mallorca; it is also the name of the comarca covering the same area. The Tramuntana Range is a UNESCO World Heritage Site, recognised as an area of great physical and cultural significance.
  - sonra: The Serra de Tramuntana is a mountain range running southwest–northeast that forms the northern backbone of the Spanish island of Mallorca; it is also the name of the comarca covering the same area. The Tramuntana Range has UNESCO World Heritage status, recognised as an area of great physical and cultural significance.
- **en · `sheskinmore-nature-reserve` · `travel_plan.days[0].stops[0].detail`**
  - önce: Sheskinmore is a large area of sand dunes, lake and marsh between Kiltooris and Ballinreavy Strand, north-west of Ardara, Co. Donegal. It is a Special Area of Conservation, a Special Protection Area and a Wildfowl Sanctuary, and is easily reached from the gate at Mullyvea opposite Kiltooris Lough. The site is mostly a fixed dune system with machair grassland, dune slacks, Sheskinmore Lough and its surrounding marsh, fen and reedbed. In winter a small flock of Greenland white-fronted geese feeds here, along with chough and twite; orchids include the marsh helleborine, bee orchid and the rare Irish orchid. The reserve is managed by NPWS and grazed in winter to encourage floral diversity. Walkers should take care around grazing animals between October and May, keep dogs on a lead and close gates, as some of the land is privately owned.
  - sonra: Sheskinmore is a large area of sand dunes, lake and marsh between Kiltooris and Ballinreavy Strand, north-west of Ardara, Co. Donegal. It is a Special Area of Conservation, a Special Protection Area and a Wildfowl Sanctuary, and is easily reached from the gate at Mullyvea opposite Kiltooris Lough. The site is mostly a fixed dune system with machair grassland, dune slacks, Sheskinmore Lough and its surrounding marsh, fen and reedbed. In winter a small flock of white-fronted geese feeds here, along with chough and twite; orchids include the marsh helleborine, bee orchid and the rare Irish orchid. The reserve is managed by NPWS and grazed in winter to encourage floral diversity. Walkers should take care around grazing animals between October and May, keep dogs on a lead and close gates, as some of the land is privately owned.
- **en · `sila-national-park` · `travel_plan.days[0].stops[0].detail`**
  - önce: Sila National Park (Italian: Parco nazionale della Sila) is an Italian national park in Calabria, on the Sila Plateau. It was established in 1997 and covers about 74,000 hectares. Its highest mountains are Monte Botte Donato (1,928 m) in Sila Grande and Monte Gariglione (1,764 m) in Sila Piccola. The park takes in land formerly part of the Calabria National Park (1968) and protects areas of great environmental interest in Sila Piccola, Sila Grande and Sila Greca, in 21 municipalities across the provinces of Catanzaro, Cosenza and Crotone.
  - sonra: Sila National Park (Italian: Parco nazionale della Sila) is an Italian national park in Calabria, on the Sila Plateau. It was established in 1997 and covers about 74,000 hectares. Its highest mountains are Mt. Botte Donato (1,928 m) in Sila Grande and Mt. Gariglione (1,764 m) in Sila Piccola. The park takes in land formerly part of the Calabria National Park (1968) and protects areas of great environmental interest in Sila Piccola, Sila Grande and Sila Greca, in 21 municipalities across the provinces of Catanzaro, Cosenza and Crotone.
- **en · `waterloopbos` · `travel_plan.days[0].stops[0].detail`**
  - önce: The Waterloopbos is a former hydraulic test site at Marknesse in the Noordoostpolder, Flevoland. It was used by the Waterloopkundig Laboratorium De Voorst, part of the Delft Hydraulics Laboratory, and is marked by the remains and ruins of laboratory structures. After it lost its role as a site for large-scale models of quays and dams, a swamp forest developed. Part of the roughly 1,000-hectare Voorsterbos, it is owned by Natuurmonumenten and is listed in the register of national monuments.
  - sonra: The Waterloopbos is a former hydraulic test site at Marknesse in the Noordoostpolder, Flevoland. It was a test site of the Waterloopkundige Laboratorium De Voorst, a subsidiary of the Waterloopkundige Laboratorium in Delft, and is marked by the remains and ruins of laboratory structures. After it lost its role as a site for large-scale models of quays and dams, a swamp forest developed. Part of the roughly 1,000-hectare Voorsterbos, it is owned by Natuurmonumenten and is listed in the register of national monuments.
- **fr · `morskie-oko` · `days[0].stops[0].detail`**
  - önce: Le Morskie Oko (« l'Œil de la mer ») est le plus grand et le quatrième plus profond lac des Tatras, dans le sud de la Pologne. Il se trouve au cœur du parc national des Tatras, dans la vallée de Rybi Potok, dans les Hautes Tatras, au pied des sommets Mięguszowieckie, en Petite-Pologne.
  - sonra: Le Morskie Oko (« l'Œil de la mer ») est le plus grand et le quatrième plus profond lac des Tatras, dans le sud de la Pologne. Il se trouve au cœur du parc national des Tatras, dans la vallée de Rybi Potok, dans les Hautes Tatras, au pied des sommets Mięguszowiecki, en Petite-Pologne.
- **fr · `parc-naturel-regional-aubrac` · `days[0].stops[0].detail`**
  - önce: Le parc naturel régional de l'Aubrac couvre environ 2 282 km2 répartis sur 64 communes de l'Aveyron, de la Lozère et du Cantal, autour du plateau de l'Aubrac. C'est le 53e parc naturel régional de France.
  - sonra: Le parc naturel régional de l'Aubrac couvre environ 2 282 km2 répartis sur 64 communes de l'Aveyron, de la Lozère et du Cantal, autour du plateau de l'Aubrac. C'est le 53e parc naturel régional français.
- **fr · `parco-naturale-regionale-del-vulture` · `metaDescription`**
  - önce: Parco naturale regionale del Vulture : Une zone naturelle protégée autour du Vulture et de neuf communes de la province de Potenza, dont Melfi.
  - sonra: Parco naturale regionale del Vulture : Une zone naturelle protégée autour du Vulture, dont une partie de Melfi, dans la province de Potenza.
- **fr · `parco-naturale-regionale-del-vulture` · `tagline`**
  - önce: Une zone naturelle protégée autour du Vulture et de neuf communes de la province de Potenza, dont Melfi.
  - sonra: Une zone naturelle protégée autour du Vulture, dont une partie de Melfi, dans la province de Potenza.
- **fr · `sainte-baume-regional-nature-park` · `days[0].stops[0].detail`**
  - önce: Le parc naturel régional de la Sainte-Baume couvre environ 84 367 ha répartis entre les Bouches-du-Rhône et le Var, autour du massif du même nom. C'est le 52e parc naturel régional de France.
  - sonra: Le parc naturel régional de la Sainte-Baume couvre environ 84 367 ha répartis entre les Bouches-du-Rhône et le Var, autour du massif du même nom. C'est le 52e parc naturel régional français.

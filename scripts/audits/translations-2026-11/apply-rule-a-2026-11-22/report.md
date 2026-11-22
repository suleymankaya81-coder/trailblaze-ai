# Rule A application — 2026-11-22 UTC

## Scope and execution
- No other sessions spawned. 04 and 05 were not run.
- 01c changed only inside needs_human_slugs(): preserved ten original exclusions and added all nine approved slugs.
- Applied function-only migration 0031; verified the stored function body.
- Original backups verified before applying: content_translations_20261121 6,336; destinations_20261121 3,259; regions_20261121 579; snapshot_info_20261121 1.
- An initial submission had an assistant transcription error in the prerequisite signature and aborted before updates. A subsequent instrumented attempt timed out; readback showed no committed changes and no active operation. The successful first run omitted expensive final read-only scans, preserving both update statements and all original safety checks. No backup was recreated or overwritten.
- The first successful run committed at 2026-11-22T13:19:52.567466Z; all changed rows have this timestamp.
- The second successful run repeated the same updates and safety checks and changed zero rows.
- Temporary copies and logs were transaction-local; no persistent audit data was inserted.

## Changes
| Table | Locale | First-run rows | First-run text fields/leaves | Second-run rows |
|---|---|---:|---:|---:|
| destinations | en | 219 | 252 | 0 |
| content_translations | de | 132 | 137 | 0 |
| content_translations | fr | 208 | 235 | 0 |
| Total | | 559 | 624 | 0 |

Field totals count individual text leaves, not updated_at or a whole travel_plan JSON value.

## Remaining placeholder rows
| Table | Locale | Requested three markers | Including [datierter Quelle] |
|---|---|---:|---:|
| destinations | en | 118 | 118 |
| content_translations | de | 65 | 92 |
| content_translations | fr | 111 | 111 |

Requested markers: [dated source], [datiert Quelle], [source datée]. Scanned all destination columns and all translation fields, not only selected snippets.

Remaining editable leaves are exclusively held/unresolved; second-run writable/natura candidates: 0.
| Locale | needs-human fields/rows | unresolved fields/rows |
|---|---:|---:|
| en | 136 / 98 | 45 / 30 |
| de | 70 / 61 | 42 / 37 |
| fr | 127 / 93 | 41 / 28 |

Rows overlap between hold categories and must not be added to obtain unique rows.

## Outside-table and status verification
Before/after deterministic hashes of every row, ordered by stable primary key, match for all ten other public tables. Both destination and translation status hashes also match: 0 status changes.
| Table | Rows | Before hash = after hash |
|---|---:|---|
| click_events | 55 | c8eed9d770565340419cc44273ea7a22 |
| content_pipeline_jobs | 2 | bc48e1cc6085d3fbbc8cd730c5d9fba3 |
| email_leads | 0 | d41d8cd98f00b204e9800998ecf8427e |
| flight_price_cache | 653 | bfe1fba2e4b5b27e5cb10499b85ae5bb |
| offers | 35,529 | bb73132d62f0afd95eed8729b1d02c44 |
| pin_assets | 3,385 | 1e326f2a991ee4fd188fe00ce69ef11e |
| regions | 579 | 76f48522bde8762eebb4d49bb916f58c |
| saved_plans | 1 | 03894d1bb3c08b56e2018e3911fe317a |
| seo_landing_pages | 1,864 | 0ce1c012cedc7e2bf5694c5f869d7667 |
| viator_place_cache | 3,231 | 02c8fb937be3ed3b044297937778238e |

Destination status hash: 0cc5bba50d9ea002c8cced68a103215c.
Translation status hash: affb628d58d06ff455e8fd156652241e.

All original structure, routing identity, destination status and non-empty-field safety checks passed in both successful transactions. No rollback was needed.

## Private-schema privileges — limitation
Migration 0032 removed all direct schema grants from supabase_read_only_user, anon, authenticated and PUBLIC, plus the reader's direct function/table grants.
Both schemas now have only {postgres=UC/postgres}; all four backup tables have only owner grants.
- anon/authenticated: USAGE false; CREATE false; executable functions 0; readable backup tables 0.
- PUBLIC: schema grants 0; function grants 0; table grants 0, in both schemas.
- supabase_read_only_user: direct grants 0; executable functions 0 (all 51 translation helpers); CREATE false; effective USAGE remains true on both schemas; effective readable backup tables remain 4.

The managed reader inherits pg_read_all_data (and pg_monitor) and has BYPASSRLS. PostgreSQL's pg_read_all_data gives access independently of schema/table ACLs; REVOKE cannot negate it on one schema. No public RLS policy references translation_fix or audit_backup (0). No role memberships or managed-role attributes were changed, because doing so would remove database-reading access project-wide and exceed this request. Therefore an effective "no access" claim for the reader is NOT verified and would be false; public API roles remain denied.

## Five exact before/after examples per language

### en

**aeolian-islands | travel_plan.days[0].stops[0].detail**

Before: The Aeolian Islands ( ee-OH-lee-ən; Italian: Isole Eolie [ˈiːzole eˈɔːlje]; Sicilian: Ìsuli Eoli), sometimes referred to as the Lipari Islands or Lipari group ( LIP-ər-ee, Italian: [ˈliːpari]) after their largest island, are a volcanic archipelago in the Tyrrhenian Sea north of Sicily, said to be named after Aeolus, the mythical ruler of the winds. The islands' inhabitants are known as Aeolians (Italian: Eoliani). The islands had a permanent population of 14,224 at the [dated source] census; the latest official estimate is 15,419 as of 1 January [dated source]. The Aeolian Islands are a popular tourist destination in the summer and attract up to 600,000 visitors annually.

After: The Aeolian Islands ( ee-OH-lee-ən; Italian: Isole Eolie [ˈiːzole eˈɔːlje]; Sicilian: Ìsuli Eoli), sometimes referred to as the Lipari Islands or Lipari group ( LIP-ər-ee, Italian: [ˈliːpari]) after their largest island, are a volcanic archipelago in the Tyrrhenian Sea north of Sicily, said to be named after Aeolus, the mythical ruler of the winds. The islands' inhabitants are known as Aeolians (Italian: Eoliani). The Aeolian Islands are a popular tourist destination in the summer and attract up to 600,000 visitors annually.

**aizkorri-aratz-natural-park | travel_plan.days[0].stops[0].detail**

Before: The Aizkorri-Aratz Natural Park is the second-largest natural park in the Basque Country. Straddling the Cantabrian-Mediterranean watershed, it is named Aizkorri and Aratz, the two most notable mountains in the park. Declared a natural park in [dated source], the area contains limestone mountains and as well as dense beech forests.

After: The Aizkorri-Aratz Natural Park is the second-largest natural park in the Basque Country. Straddling the Cantabrian-Mediterranean watershed, it is named Aizkorri and Aratz, the two most notable mountains in the park.

**albanian-alps-national-park | travel_plan.days[0].stops[0].detail**

Before: Alps of Albania National Park is the largest national park in Albania. Established in [dated source], the national park is located in northern Albania and covers an area of 8,844.65 ha . The most prominent mountain range are the Albanian Alps, which are also the namesake of the national park. Most of Albania's peaks above 2,000 m are located here, including the highest peak of the Dinarides, Maja e Jezercës. The geological formation is dominated by high terrain, while having a variety of natural features including glaciers, valleys, rivers, mountains, waterfalls, dense forests and several rock formations. It is characterized by its very remote areas which have a large preserved ecosystem all of which is primarily untouched with pristine quality. The park was established to protect various ecosystems and biodiversity and the cultural and historical heritage of the region. The region has been also identified as an important Bird and Plant Area.

After: Alps of Albania National Park is the largest national park in Albania. The most prominent mountain range are the Albanian Alps, which are also the namesake of the national park. Most of Albania's peaks above 2,000 m are located here, including the highest peak of the Dinarides, Maja e Jezercës. The geological formation is dominated by high terrain, while having a variety of natural features including glaciers, valleys, rivers, mountains, waterfalls, dense forests and several rock formations. It is characterized by its very remote areas which have a large preserved ecosystem all of which is primarily untouched with pristine quality. The park was established to protect various ecosystems and biodiversity and the cultural and historical heritage of the region. The region has been also identified as an important Bird and Plant Area.

**alutaguse-national-park | seo_description**

Before: Alutaguse National Park is a national park in eastern Estonia, established in [dated source].

After: Alutaguse National Park is a national park in eastern Estonia.

**alutaguse-national-park | tagline**

Before: Alutaguse National Park is a national park in eastern Estonia, established in [dated source].

After: Alutaguse National Park is a national park in eastern Estonia.

### de

**aizkorri-aratz-natural-park | days[0].stops[0].detail**

Before: Der Aizkorri-Aratz Natural Park ist der zweitgrößte Naturpark im Baskenland. Er erstreckt sich über die Wasserscheide von Cantabrian-Mediterranean und heißt Aizkorri und Aratz, die beiden bemerkenswertesten Berge des Parks. Erklärt einen Naturpark in [datiert Quelle], enthält das Gebiet Kalksteinberge und als auch dichte Buchenwälder.

After: Der Aizkorri-Aratz Natural Park ist der zweitgrößte Naturpark im Baskenland.

**alutaguse-national-park | days[0].stops[0].detail**

Before: Alutaguse National Park ist ein Nationalpark im Osten Estlands, gegründet in [datiert Quelle].

After: Alutaguse National Park ist ein Nationalpark im Osten Estlands.

**alutaguse-national-park | tagline**

Before: Alutaguse National Park ist ein Nationalpark im Osten Estlands, gegründet in [datiert Quelle].

After: Alutaguse National Park ist ein Nationalpark im Osten Estlands.

**anderdalen-national-park | days[0].stops[0].detail**

Before: Ånderdalen National Park liegt auf der großen Insel Senja im Kreis Troms, Norwegen. Der 134 Quadratkilometer große Park liegt in der Gemeinde Senja. Der Park wurde am 6. Februar 1970 durch königliches Dekret gegründet und in [datierter Quelle] erweitert. Der Nationalpark bewahrt diese nordnorwegische Küstenlandschaft. Der Grundstein besteht aus hartem Granitfelsen und das Landschaftsbild vermittelt spannende Eindrücke von den Gletscherkräften, die auf Senja gewirkt haben. Der Küstenkieferwald in Ånderdalen hat in einigen Gebieten Urwald mit über 600 Jahre alten Bäumen und unzähligen Marmorkiefern und darunter. Entlang des Flusses gibt es viele üppige Falkenbirkenwälder und Auenwälder.

After: Ånderdalen National Park liegt auf der großen Insel Senja im Kreis Troms, Norwegen. Der 134 Quadratkilometer große Park liegt in der Gemeinde Senja. Der Nationalpark bewahrt diese nordnorwegische Küstenlandschaft. Der Grundstein besteht aus hartem Granitfelsen und das Landschaftsbild vermittelt spannende Eindrücke von den Gletscherkräften, die auf Senja gewirkt haben. Der Küstenkieferwald in Ånderdalen hat in einigen Gebieten Urwald mit über 600 Jahre alten Bäumen und unzähligen Marmorkiefern und darunter. Entlang des Flusses gibt es viele üppige Falkenbirkenwälder und Auenwälder.

**archipelago-national-park | days[0].stops[0].detail**

Before: Archipelago National Park ist ein Nationalpark im Südwesten Finnlands. Es wurde 1983 gegründet und umfasst 500 km2 Landfläche. Der größte Teil des Landes befindet sich auf Inseln, die kleiner als 1 km2 sind. Der Park umfasst etwa 2.000 der 8.400 Inseln und Schären im Genossenschaftsbereich. Die größeren Inseln sind hauptsächlich im Besitz ihrer Bewohner. Archipelago National Park ist Teil der UNESCO-Biosphärenreservate und erhielt ein PAN Parks Zertifikat in [datiert Quelle].

After: Archipelago National Park ist ein Nationalpark im Südwesten Finnlands. Es wurde 1983 gegründet und umfasst 500 km2 Landfläche. Der größte Teil des Landes befindet sich auf Inseln, die kleiner als 1 km2 sind. Der Park umfasst etwa 2.000 der 8.400 Inseln und Schären im Genossenschaftsbereich. Die größeren Inseln sind hauptsächlich im Besitz ihrer Bewohner.

### fr

**aizkorri-aratz-natural-park | days[0].stops[0].detail**

Before: L'Aizkorri-Aratz Natural Park est le deuxième plus grand parc naturel du Pays Basque. À cheval sur la ligne de partage des eaux Cantabrique-Méditerranée, il tire son nom de l'Aizkorri et de l'Aratz, les deux montagnes les plus remarquables du parc. Déclarée parc naturel en [source datée], la zone comprend des montagnes calcaires ainsi que d'épaisses forêts de hêtres.

After: L'Aizkorri-Aratz Natural Park est le deuxième plus grand parc naturel du Pays Basque. À cheval sur la ligne de partage des eaux Cantabrique-Méditerranée, il tire son nom de l'Aizkorri et de l'Aratz, les deux montagnes les plus remarquables du parc.

**alutaguse-national-park | days[0].stops[0].detail**

Before: Alutaguse National Park est un parc national situé dans l'est de l'Estonie, établi en [dated source].

After: Alutaguse National Park est un parc national situé dans l'est de l'Estonie.

**alutaguse-national-park | tagline**

Before: Alutaguse National Park est un parc national situé dans l'est de l'Estonie, établi en [dated source].

After: Alutaguse National Park est un parc national situé dans l'est de l'Estonie.

**archipelago-national-park | days[0].stops[0].detail**

Before: Le Archipelago National Park est un parc national situé dans le sud-ouest de la Finlande. Créé en 1983, il s'étend sur une superficie terrestre de 500 km2 [500 km]. La majeure partie des terres se trouve sur des îles de moins de 1 km2. Le parc englobe environ 2 000 des 8 400 îlots et récifs de la zone de coopération. Les îles les plus vastes appartiennent principalement à leurs habitants. Le Archipelago National Park fait partie des réserves de biosphère de l'UNESCO et a reçu le certificat PAN Parks en [source datée].

After: Le Archipelago National Park est un parc national situé dans le sud-ouest de la Finlande. Créé en 1983, il s'étend sur une superficie terrestre de 500 km2 [500 km]. La majeure partie des terres se trouve sur des îles de moins de 1 km2. Le parc englobe environ 2 000 des 8 400 îlots et récifs de la zone de coopération. Les îles les plus vastes appartiennent principalement à leurs habitants.

**ardmore-cliff-walk | days[0].stops[0].detail**

Before: Ardmore est une station balnéaire et un village de pêcheurs du comté de Waterford, en Irlande, non loin de Youghal sur la côte sud. Le village se trouve dans une paroisse civile du même nom. Selon le recensement [source datée], le village comptait 468 habitants. Ardmore est considéré comme le plus ancien établissement chrétien d'Irlande. Selon la tradition, Saint Declan vivait dans la région au début du Ve siècle et l'aurait christianisée avant l'arrivée de Saint Patrick.

After: Ardmore est une station balnéaire et un village de pêcheurs du comté de Waterford, en Irlande, non loin de Youghal sur la côte sud. Le village se trouve dans une paroisse civile du même nom. Ardmore est considéré comme le plus ancien établissement chrétien d'Irlande. Selon la tradition, Saint Declan vivait dans la région au début du Ve siècle et l'aurait christianisée avant l'arrivée de Saint Patrick.

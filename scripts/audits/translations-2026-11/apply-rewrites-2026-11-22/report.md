# 06 reviewed rewrites — apply report (2026-11-22)

Files run in order, each as its own call, from `fixes/` (merge of translation-fixes-5):
06-0-prepare, 06-1-load-001…007, 06-2-backup, 06-3-apply (twice). Not run: 06-4-rollback, 04, 05.

Method: the shell database role cannot write, so each file went through the database data tool.
Only `begin;`/`commit;` were removed (the tool runs each call as one transaction). In 06-3 the
final "skipped fields" list query was also removed (the tool returns only one result); it would
have been empty — the summary shows 0 skipped. All checks, inserts and updates ran as written.

## Before apply
- Earlier backups intact: content_translations_20261121 6,336 · destinations_20261121 3,259 · regions_20261121 579.
- audit_backup.rewrites_20261122_proposals: 320 rows, checksum 4b98b4cfb2908f2c3d02ebbd8419fa20 (matches the reviewed value; also verified per row after batches 1–2).
- audit_backup.rewrites_20261122_destinations: 83 rows · rewrites_20261122_translations: 135 rows (RLS on, no grants).

## Run 1 (committed 2026-11-22 15:43:30 UTC, single timestamp on all 218 changed rows)
| locale | table | fields (REWRITE + CLEAR) | rows |
|---|---|---|---|
| en | destinations | 131 (124 + 7) | 83 |
| de | content_translations | 70 (67 + 3) | 58 |
| fr | content_translations | 119 (112 + 7) | 77 |
| total | | 320 | 218 |

Skipped: row-missing 0 · already-applied 0 · changed-since-review 0.

## Run 2
All 320 fields `already-applied`, 0 rows changed.

## Examples (before → after)
- de lorship-bertiz tagline: "…Parke Naturala) [datiert Quelle] ha, befindet sich" → "Señorío de Bertiz ist ein Naturpark im Nordwesten Navarras in Spanien, ausgewiesen 1984."
- de ariege tagline: "…138 Gemeinden seit dem 1. Januar [datiert Quelle] und 46.000 Einwohner." → "Ein regionaler Naturpark von rund 2.468 km2, der etwa 40 % des Departements Ariège in den Pyrenäen einnimmt."
- de midden-delfland tagline: "Es hatte eine Bevölkerung von 19.355 in [datierter Quelle]…" → "Midden-Delfland ist eine 49,38 km2 große Gemeinde in der Region Westland in Südholland."
- de mont-ventoux detail: "…per Dekret am 28. Juli [datiert Quelle] geschaffen wurde…" → "Der Regionale Naturpark Mont-Ventoux (provenzalisch: pargue dóu Ventours) ist der 55. Regionale Naturpark Frankreichs…"
- de liechtensteinklamm detail (CLEAR): "…bis 30. September [datiert Quelle] von 09:00 bis 18:00 Uhr…" → "" (removed)
- en lorship-bertiz tagline: "…Parke Naturala) [dated source] ha, is locate" → "Señorío de Bertiz is a natural park in the north-west of Navarre, Spain, declared in 1984."
- en ariege tagline: "…138 communes since 1 January [dated source] and 46,000 inhabitants." → "A regional natural park of about 2,468 km2, covering some 40% of the Ariège department in the Pyrenees."
- en midden-delfland tagline: "It had a population of 19,355 in [dated source]…" → "Midden-Delfland is a municipality of 49.38 km2 in the Westland region of South Holland."
- en national-park-drina detail: "…It was founded in [dated source]. The nearest town…" → "Drina National Park is the fourth national park in Bosnia and Herzegovina and the third in Republika Srpska. The nearest town is Srebrenica…"
- en sparbach-nature-park tagline (CLEAR): German text with "[dated source]" → "" (removed)
- fr lorship-bertiz tagline: "…Parke Naturala) [dated source] ha, se situ" → "Le Señorío de Bertiz est un parc naturel du nord-ouest de la Navarre, en Espagne, déclaré en 1984."
- fr ariege tagline: "…138 communes depuis le 1er janvier [dated source] et compte 46 000 habitants." → "Un parc naturel régional d'environ 2 468 km2, qui couvre près de 40 % du département de l'Ariège."
- fr mont-ventoux detail: "…créé par décret le 28 juillet [dated source]…" → "Le parc naturel régional du Mont-Ventoux (en provençal : pargue dóu Ventours) est le 55e parc naturel régional créé en France…"
- fr aubrac detail: "…créé par décret le 23 mai [dated source]…" → "Le parc naturel régional de l'Aubrac couvre environ 2 282 km2 répartis sur 64 communes…"
- fr liechtensteinklamm tagline (CLEAR): "…30 septembre [source datée] de 09h00 à 18h00 (dernière" → "" (removed)

## Remaining placeholder rows
- destinations (en): 46 (was 118)
- content_translations de: 31 with [datiert Quelle]/[dated source]; 55 incl. [datierter Quelle]/[datierte Quelle] (was 65 / 92)
- content_translations fr: 45 (was 111)

## Safety
- 0 rows changed outside destinations and content_translations: full-row hashes of all 10 other public tables identical before/after.
- 0 status changes: status hashes of destinations and content_translations identical before/after.
- anon / authenticated: no USAGE on translation_fix or audit_backup; 0 of 7 audit_backup tables readable; 0 of 51 translation_fix functions executable. Schema ACLs: only owner (postgres). PUBLIC has no grant.

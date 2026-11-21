# EN → DE → FR logistics-term glossary (built from real usage found in this audit)

Source: direct examples pulled from `phrases.de.generated.json` / `phrases.fr.generated.json` and
`dict/de.ts` / `dict/fr.ts` during this audit (2026-11), with the corrupted French entries already
excluded (see report.md). Reuse this as the starting point for Spanish, Italian and Dutch; keep
adding rows as new terms come up instead of starting over.

| EN term | DE (as actually used) | FR (as actually used) | Consistency note |
|---|---|---|---|
| campground | Campingplatz / Campingplätze | camping / campings | Consistent in both. |
| RV park(s) | **inconsistent**: "RV-Parks" (loanword) in one sentence, "Wohnmobilstellplätze" (fully German) in another | **inconsistent**: "parcs à RV", and left as literal untranslated "RV parks" in another sentence | Pick one rendering per language and reuse it; currently both DE and FR vary sentence to sentence. |
| campervan / motorhome / RV | Wohnmobil / Camper (loanword for the rental brand context) | camping-car (dict), "RV" left untranslated in running text | FR dict uses "camping-car" for the nav/button text but generated phrases often leave "RV" as-is — decide one term and apply it to the generated phrases too. |
| timed entry | "Zeitfenster-Reservierung" in one place, "terminierter Einlass" in another | "entrée horodatée" (consistent in every example seen) | DE has two different renderings for the same concept; FR is consistent. |
| permit (backcountry) | "District Entry" and "Backcountry Permits" left **entirely untranslated** (English terms embedded in an otherwise German sentence) | "permis d'entrée de district", "permis pour l'arrière-pays" (fully translated) | Real asymmetry: German code-switches to English for this pair, French translates it properly. |
| entry/entrance reservation | varies: "Reservierung für die Einfahrt", "Fahrzeugreservierung", "Einlass" | consistently "réservation d'entrée" / "réservation de véhicule" | DE uses several near-synonyms across sentences; worth standardizing one term for "entry reservation" vs "vehicle reservation" if they are meant to be distinct concepts. |
| shuttle | "Shuttle" (loanword, consistent) | "navette" (consistent) | Both languages are internally consistent, just different strategies (loanword vs. native word) — fine as-is. |
| ferry | "Fähre" | "ferry" (loanword) | Both internally consistent. |
| trailhead | "Wanderparkplatz" (lit. "hiking parking lot") | "départ du sentier" (lit. "trail start") | Both reasonable, both consistent in the examples seen. |
| visitor center | "Visitor Center" (left untranslated, treated like a proper noun) | "Visitor Center" (same) | Consistent across both languages — looks like a deliberate choice, not an oversight. |
| 4WD / high-clearance / ranger station | not found in the current generated-phrase set at all | not found | No example to audit yet; flag for the next content wave rather than guessing a translation now. |

## Recommendation for future languages (ES, IT, NL)

- Before generating phrases for a new language, extract this same table's EN terms and decide the
  target term up front (one row here = one decision, not "whatever the batch translator picks").
- The DE/FR inconsistencies above (RV park, timed entry, entry-reservation wording) are a sign the
  phrase-generation process translates sentence-by-sentence with no shared glossary enforced across
  batches. The same risk applies to any new language unless a glossary like this one is fed into the
  prompt, or a second pass checks generated output against it.

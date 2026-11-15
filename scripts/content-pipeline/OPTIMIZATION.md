# Source-first production optimization — 15 November 2026

## Implemented
- New waves use `run-content-wave.py --wave 2`: one bounded sequential command, explicit publication option, and a per-place report.
- `prepare-wave.py --combined` creates summary, reservation note and itinerary in one Gemini request. Existing permit generation is not called on this path; travel writer consumes the saved result.
- Official excerpts and stop identities must be reviewed and exact-source matched before paid generation. Automatic NLP guesses are not approval. Missing evidence holds the place.
- Compact evidence has a 14,000-character budget. Overflow holds instead of dropping safety or operational evidence. Full fetched documents remain in source packets for later review.
- Paid attempts are exclusively created and retained, including failures. No automatic regeneration of failed or unknown outcomes. Valid output can be reused without another request.
- Gateway streams record actual usage and terminal failure diagnostics. Existing model and publishing checks are unchanged; no extra search guides are generated.

## Measurements and limits
- New Forest source text: 145,941 characters before selection, 11,863 characters in reviewed excerpts. This is a source-text reduction, not measured credit savings.
- One real combined request returned 10,585 input and 1,440 output tokens. Its output was retained and normalized without another paid request, but withheld because statements about entry, connectivity and fuel were not established by supplied evidence. It is not a quality-pass benchmark.
- The prompt initially duplicated evidence; the final prompt supplies it once. Final prompt token counts and like-for-like successful-output savings remain unmeasured.
- November 9–15 recorded requested credits: Build 195.236, Gateway 13.034. Production optimizations do not remove unrelated Build usage. No 70–80% whole-project savings claim is supported.
- All 45 England wave-2 places were preflighted and held before AI: their approved official packets, reviewed compact excerpts and sourced stop IDs are absent. None was published or generated from model recollection.

## Next production requirement
Collect each place's official visitor/access sources, review relevant exact excerpts and at least six stop identities, then create its draft and collect reusable licensed-photo/airport/route facts. Only then run the combined wave. Some small places may not support six distinct stops: those need an explicitly approved shorter template rather than invented nearby sights.

## Tests
288 existing JavaScript tests and 33 Python tests pass. No app UI changes. Build log reports OK. Source matching, compact-budget overflow, unknown-attempt protection and validated-cache reuse are tested. Full editorial correctness and realized savings remain unverified.
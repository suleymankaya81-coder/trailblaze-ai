# Canadian bulk source audit — 15 November 2026

## Scope and result
- All remaining 105 published destinations passed through one bulk source-comparison run, without research subagents. Sources and model outputs were reused during correction retries.
- 37 evidence-matched textual changes across 28 destinations were saved and read back through the database response. Changes persist in the Canadian review ledger. No numeric coordinates or routing geometry were changed.
- Broken Grands-Jardins (`gja` → `grj`) and Great Sand Hills (`296` → `735`) source addresses were replaced after retrieving exact-place official pages. Both previously blocked audits completed.
- All 285 JavaScript and 22 Python tests passed. Three corrected pages were visited in the browser and returned 200 with no page errors.

## Important evidence limits
This is NOT completion of independent verification of every fact. The model returned only a subset of requested leaf checks, and some “supported” labels relied on inference or non-verbatim quotes. Those labels were downgraded, and every omitted leaf was explicitly registered as unverified rather than silently certified.

- 6,583 field classifications, including 6,167 unverified leaves. These counts include headings, names, suggested times, list entries and technical identity fields; they are not counts of factual errors.
- 29 proposed changes were withheld because quotes were not exact, paths were protected, or the replacement did not meet safety requirements. A source omission does not disprove a claim.
- Quotes establish that a source contains text, not that every part of a model-written replacement logically follows from it. Corrections require continued editorial scrutiny.
- Many airport connections, coordinate identities, signal coverage, driving estimates and stop descriptions remain unestablished in the retrieved evidence. No blanket “fully verified” label was added.
- Four photo blockers remain: Alice Lake, Dollar Lake, Murray Beach and Tuktut Nogait. No photos were replaced or visually certified in this bulk text audit.

## Future content workflow
Collect destination-specific official text with `collect-sources.py`; Wikipedia may support background, never current operational rules. Review identity and source adequacy before explicitly approving the packet. All four writers refuse missing/unapproved packets, including cached-output reuse, and omit unsupported facts. This reduces fabrication but does not eliminate the need for verification or guarantee error-free pages.

Per-destination JSON files record checks and evidence gaps; `accepted-corrections.json` and `rejected-corrections.json` preserve the proposed changes. Raw complete web fetches are temporary; retained source packets store the excerpts used.
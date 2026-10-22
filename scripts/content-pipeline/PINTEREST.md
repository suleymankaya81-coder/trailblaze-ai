# Pinterest publishing

The ten branded samples were approved on 2026-10-16. Prepare the complete eligible catalog without AI generation. Retain the approved typography, copy and photo attribution.

## Maximum allowance

Pinterest's [official RSS help](https://help.pinterest.com/en/business/article/auto-publish-pins-from-your-rss-feed) states **up to 200 Pins per day**, oldest content first, and creation within 24 hours of feed updates. It does not explicitly grant this allowance to each feed. Apply 200 to the account total, never 800 across four boards. Pinterest controls actual ingestion; release times are availability, not proof of posting.

## Preparation and release

1. Run `test_pin_schedule.py` and the RSS/copy tests.
2. Render once with `render-pins.py --all --release-start=2026-10-17T00:00:00Z`. The first batch becomes available October 17 UTC (03:00 Istanbul). At full capacity 2,200 cards need 11 release days.
3. `pin_schedule.py` balances the boards and prioritizes scenic score within each. Each UTC date holds at most 200 cards across all feeds. Subsequent runs preserve existing dates and count already scheduled cards against capacity.
4. Re-run missing cards until every eligible page has a card. Download each source once into a temporary cache. Retry transient image failures; fetch the same Commons original for undersized thumbnails. For inherently small landscape photos use the full photo above the branded text field rather than a blurry portrait crop. Do not substitute another destination's photo.
5. Check dimensions (1000×1500 JPEG), all copy, missing rows, public image access, board totals and daily counts before marking preparation complete. Record any unresolved photo failures explicitly.
6. Keep the four existing RSS addresses and UTM links. Each feed retains the latest 200 released items, allowing several days for collection. Do not additionally connect the aggregate feed to Pinterest; this would duplicate board feed entries.
7. Check live RSS after rollout and Pinterest import status after 24 hours. Existing plain-photo pins are not automatically removed; the owner may remove them. Neither a new image nor a GUID guarantees Pinterest recreates an existing pin.

## Re-runs

Normal runs skip completed template versions. Do not use `--force` to shift release dates. Changing the daily limit in future requires updating the scheduler, tests and unreleased schedule together, never rescheduling already released pins.
## Wave 2 — "Design the Exit" (2026-10-22)

Template v2 follows Pinterest's Oct 2026 "Design the Exit" guidance: intent-first kicker (WHEN TO GO, WHERE TO SLEEP…), a concrete next step on the card (days, arrival airport, drive time, booking need) and an action CTA. Copy lives in `pin_copy_v2.py` (tested in `test_pin_copy_v2.py`). v1 cards are never re-rendered.

Channels (`pin_assets.channel`): `rss` pins publish through the four existing feeds; `csv` pins (road-trip loops, gateway corridors, RV & camping guides) are uploaded manually from `/mnt/documents/pinterest/*.csv` and are filtered out of RSS, so no page is pinned twice. CSV pins are scheduled only on days with no RSS release, max 100 per day; one file per day (Pinterest accepts up to 200 rows per file). `render-pins.py --csv-only` rewrites the files.

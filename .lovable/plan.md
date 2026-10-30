# LaunchLoop → MiniaLife ad kit

Goal: send LaunchLoop visitors to MiniaLife without hurting LaunchLoop (no entry pop-ups, which Google penalizes). The ads are files you place on LaunchLoop yourself. Nothing on MiniaLife changes.

## Placements (where each ad goes)

| # | Placement on LaunchLoop | Format | Links to |
|---|---|---|---|
| 1 | Thin top announcement bar (closable), all pages | Text only | /road-trips |
| 2 | Homepage, below the main content | Wide banner (landscape 1200x400) | Homepage |
| 3 | Inside long plan/result pages, mid-page | In-content card (square 1080x1080) | /road-trips |
| 4 | Blog/article sidebar | Tall banner (300x600) | /fly-and-drive |
| 5 | Footer, all pages | Text link "Sister project: MiniaLife" | Homepage |
| 6 | Optional: newsletter/email if LaunchLoop sends one | Landscape image + text | /road-trips |

Placement 1 + 3 are expected to bring most clicks; 2, 4, 5 add steady reach and a backlink for Google/AI discovery.

## Images (4, new files)

All built from MiniaLife's real look: beige background, dark-green button, Fraunces headline, real landscape photos already credited on the site (Grand Canyon, Yellowstone, Zion style scenery), plus the MiniaLife logo. Headline text agreed below, rendered exactly.

1. `minialife_road_trip_banner_landscape` — wide canyon road scene, headline left, button right.
2. `minialife_road_trip_card_square` — motorhome on a scenic road, headline top, button bottom.
3. `minialife_fly_drive_tall` — three stacked landscape photos, headline + button.
4. `minialife_newsletter_landscape` — email version of image 1.

Saved to Files (ads folder), grouped in one collection "LaunchLoop cross-promo".

## Copy (English, LaunchLoop audience = US founders/side-hustlers)

| Kind | Text |
|---|---|
| Top bar | Building something big? Take a break. Free US road trip plans on MiniaLife → |
| Banner headline | Your next escape is already planned |
| Banner sub | 500 US destinations and road trips, mapped and free. |
| Button | Plan my trip |
| Card headline | Earned a break? |
| Card sub | Free road trip routes, drive times and where to stay. |
| Tall headline | Fly in. Drive out. |
| Tall sub | Ready-made Fly & Drive trips from major US airports. |
| Footer | Sister project: MiniaLife — free US road trip plans |

All links tagged `?utm_source=launchloop&utm_medium=referral&utm_campaign=crosspromo_<placement>` so GA4 shows which placement works.

## Deliverables

- 4 images + one short guide (which file goes where, exact link, copy, and ready HTML snippet for the top bar and footer link).
- After 2 weeks: read MiniaLife analytics for `launchloop` visits and keep the best placement.

## Not included

- No pop-up / 5-second interstitial.
- No Black Friday text (embargo until 12 Nov).

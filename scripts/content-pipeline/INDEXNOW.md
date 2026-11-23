# IndexNow

IndexNow tells Bing, Yandex, Seznam, Naver and other IndexNow engines that a URL was published or changed.
Bing's index also feeds ChatGPT search and Copilot.

- **Key:** `e30e5c8f5cb37300c499a62294390bb2`, already served at
  `https://wildparkroutes.com/e30e5c8f5cb37300c499a62294390bb2.txt` (`public/`). Do not rename or delete it.
- **Limit:** at most 10,000 URLs per request; only `https://wildparkroutes.com/...` URLs are sent.

## Automatic pings

| When | Where | URLs |
|---|---|---|
| A place is published | `publish-wave.py` (end of run) | `/destinations/{country}/{region}/{slug}` plus `/de/…` and `/fr/…` when stored translations exist |
| A German/French translation is saved | `translate-content.py` (end of run) | `/{locale}/destinations/{country}/{region}/{slug}` |

A failed ping is printed and never undoes a publish. Set `INDEXNOW_DISABLED=1` to skip pings (e.g. staging runs).

Other writers (for example one-off SQL fixes) do not ping. After such a change, run the script below with `--urls`.

## Manual submission (not run automatically)

Dry run first. It prints how many URLs and batches would be sent, and sends nothing:

```bash
python scripts/content-pipeline/indexnow.py --sitemap https://wildparkroutes.com/sitemap.xml
```

Send the whole sitemap (index plus every child sitemap), in batches of at most 10,000:

```bash
python scripts/content-pipeline/indexnow.py --sitemap https://wildparkroutes.com/sitemap.xml --submit
```

Send a few changed pages:

```bash
python scripts/content-pipeline/indexnow.py --urls https://wildparkroutes.com/destinations/us/utah/zion --submit
```

HTTP 200 or 202 means accepted. 403 means the key file is not reachable. 422 means a URL is not on the key's host.
Submit the full sitemap once, not repeatedly: engines may throttle hosts that resend unchanged URLs.

## Server function

`notifyIndexNow` (`src/lib/seo/indexNow.functions.ts`) does the same for publishing tools outside this pipeline.
It only sends when the caller passes the secret `INDEXNOW_SUBMIT_TOKEN` configured in the app's environment.
Without that variable it refuses every call.

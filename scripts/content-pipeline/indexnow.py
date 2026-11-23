"""IndexNow: tell Bing, Yandex and other IndexNow engines that pages were published or changed.

Uses the key file already served at https://wildparkroutes.com/<key>.txt (public/<key>.txt).
One request carries at most 10,000 URLs (IndexNow limit); only https URLs on the site's own host
are sent.

Library use (publish-wave.py, translate-content.py): notify(urls) after a successful publish.
Set INDEXNOW_DISABLED=1 to skip the ping (for example in a staging run).

CLI (dry run unless --submit is given; prints the batches it would send):
  python scripts/content-pipeline/indexnow.py --sitemap https://wildparkroutes.com/sitemap.xml
  python scripts/content-pipeline/indexnow.py --sitemap https://wildparkroutes.com/sitemap.xml --submit
  python scripts/content-pipeline/indexnow.py --urls https://wildparkroutes.com/destinations/us/utah/zion --submit
"""
import argparse, glob, os, re, sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

import requests

HOST = "wildparkroutes.com"
ENDPOINT = "https://api.indexnow.org/indexnow"
MAX_BATCH = 10_000
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SM = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


def find_key(public_dir=os.path.join(ROOT, "public")):
    """The key is the name of public/<32 hex>.txt whose content is that same key."""
    for path in sorted(glob.glob(os.path.join(public_dir, "*.txt"))):
        name = os.path.basename(path)[:-4]
        if re.fullmatch(r"[0-9a-f]{8,128}", name) and open(path).read().strip() == name:
            return name
    raise FileNotFoundError("No IndexNow key file (public/<key>.txt containing the key) found")


def site_urls(urls, host=HOST):
    """https URLs on our own host only, de-duplicated, order kept."""
    seen, out = set(), []
    for u in urls:
        u = (u or "").strip()
        p = urlparse(u)
        if p.scheme == "https" and p.netloc == host and u not in seen:
            seen.add(u)
            out.append(u)
    return out


def batches(urls, size=MAX_BATCH):
    size = min(size, MAX_BATCH)
    return [urls[i:i + size] for i in range(0, len(urls), size)]


def payloads(urls, key=None, host=HOST):
    key = key or find_key()
    return [{"host": host, "key": key, "keyLocation": f"https://{host}/{key}.txt", "urlList": b}
            for b in batches(site_urls(urls, host))]


def submit(urls, post=requests.post, key=None):
    """POST every batch; returns [(url_count, http_status)]. 200/202 = accepted."""
    results = []
    for body in payloads(urls, key):
        r = post(ENDPOINT, json=body, headers={"Content-Type": "application/json; charset=utf-8"}, timeout=60)
        results.append((len(body["urlList"]), r.status_code))
    return results


def notify(urls, post=requests.post):
    """Called after a publish or content change. Never raises: a failed ping must not undo a publish."""
    if os.environ.get("INDEXNOW_DISABLED") == "1" or not site_urls(urls):
        return []
    try:
        results = submit(urls, post=post)
        print("IndexNow:", ", ".join(f"{n} URLs → {s}" for n, s in results))
        return results
    except Exception as e:  # noqa: BLE001
        print("IndexNow ping failed (publish is unaffected):", e)
        return []


def destination_url(country, region, slug, locale="en"):
    prefix = "" if locale == "en" else f"/{locale}"
    return f"https://{HOST}{prefix}/destinations/{country}/{region}/{slug}"


def sitemap_urls(index_url, get=requests.get):
    """All <loc> URLs of a sitemap index and its child sitemaps (one level, as the site serves them)."""
    response = get(index_url, timeout=60)
    if response.status_code != 200:
        raise RuntimeError(f"Sitemap fetch failed: {index_url} → HTTP {response.status_code}; nothing submitted")
    root = ET.fromstring(response.content)
    if root.tag == f"{SM}sitemapindex":
        out = []
        for loc in root.iter(f"{SM}loc"):
            out += sitemap_urls(loc.text.strip(), get)
        return out
    if root.tag != f"{SM}urlset":
        raise ValueError(f"Not a sitemap urlset: {index_url}")
    return [loc.text.strip() for loc in root.findall(f"{SM}url/{SM}loc")]


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--sitemap", help="sitemap index URL, e.g. https://wildparkroutes.com/sitemap.xml")
    src.add_argument("--urls", nargs="+", help="explicit page URLs")
    ap.add_argument("--batch-size", type=int, default=MAX_BATCH, help="URLs per request (max 10000)")
    ap.add_argument("--submit", action="store_true", help="actually send; without it this is a dry run")
    a = ap.parse_args(argv)
    if a.batch_size < 1:
        ap.error("--batch-size must be positive")
    urls = site_urls(sitemap_urls(a.sitemap) if a.sitemap else a.urls)
    groups = batches(urls, a.batch_size)
    print(f"{len(urls)} URLs on {HOST} in {len(groups)} batch(es) of at most {min(a.batch_size, MAX_BATCH)}")
    if not a.submit:
        print("Dry run: nothing sent. Add --submit to notify IndexNow.")
        return 0
    key = find_key()
    failed = False
    for i, g in enumerate(groups, 1):
        r = requests.post(ENDPOINT, json={"host": HOST, "key": key, "keyLocation": f"https://{HOST}/{key}.txt", "urlList": g}, timeout=60)
        print(f"batch {i}: {len(g)} URLs → HTTP {r.status_code}")
        failed = failed or r.status_code not in (200, 202)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

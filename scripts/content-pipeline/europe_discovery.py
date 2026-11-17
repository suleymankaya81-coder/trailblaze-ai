"""Cached, sequential Wikidata/Wikipedia discovery for France/Portugal/Greece.
Mirrors dach_discovery.get() exactly, parameterized by cache directory so each
catalog keeps its own cache instead of mixing into dach/discovery-cache."""
import datetime
import hashlib
import json
import time
import requests

SESSION = requests.Session()
SESSION.headers["User-Agent"] = "WildParkRoutesSourceReview/1.0 (+https://wildparkroutes.com/about)"


def get(url, cache_dir):
    cache_dir.mkdir(parents=True, exist_ok=True)
    path = cache_dir / (hashlib.sha256(url.encode()).hexdigest() + ".json")
    if path.exists():
        value = json.loads(path.read_text())
        if value["status"] != 200:
            raise ValueError("cached HTTP " + str(value["status"]))
        return value
    response = None
    for attempt in range(8):
        if attempt == 0:
            delay = 1
        elif response is not None and response.headers.get("Retry-After", "").isdigit():
            delay = int(response.headers["Retry-After"]) + 1
        else:
            delay = min(60, 5 * (2 ** (attempt - 1)))
        time.sleep(delay)
        response = SESSION.get(url, timeout=30)
        if response.status_code != 429:
            break
    value = {"status": response.status_code, "url": response.url, "body": response.text,
             "fetched_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    if response.status_code != 429:
        # Only persist a settled answer; a run of 429s is transient throttling, not
        # a fact about the URL, so it must not be cached and replayed forever.
        path.write_text(json.dumps(value, ensure_ascii=False))
    response.raise_for_status()
    return value

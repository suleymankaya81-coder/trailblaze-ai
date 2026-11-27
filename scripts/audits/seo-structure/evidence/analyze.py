"""Structural metrics for saved live HTML pages (server-rendered, no JavaScript).

Usage: python3 -I analyze.py sample.tsv pages_dir headers_dir > metrics.json
sample.tsv: template<TAB>url<TAB>file_id
"""
import json, re, sys
from html.parser import HTMLParser
from urllib.parse import urlparse

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
PARTNER_HOSTS = ("awin1.com", "motorhomerepublic.com", "airportrentals.com", "tpm.lv", "vrbo.com", "expedia.com", "viator.com",
                 "getyourguide", "rei.com", "harvesthosts", "roverpass", "campspot", "booking.com", "klook", "tiqets",
                 "airalo", "hipcamp", "outdoorsy", "rvshare", "discovercars", "rentalcars", "kiwitaxi", "tp-em.com")
NON_PROSE_ANCESTORS = {"a", "button", "nav", "aside", "figure", "header", "footer", "form", "label", "iframe", "summary"}
OWN = "wildparkroutes.com"


class Node:
    __slots__ = ("tag", "attrs", "children", "parent", "text")

    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.children, self.text = tag, dict(attrs), parent, [], []


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", {}, None)
        self.cur = self.root
        self.order = []  # document-order list of nodes

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        self.order.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        self.order.append(n)

    def handle_endtag(self, tag):
        c = self.cur
        while c is not self.root and c.tag != tag:
            c = c.parent
        if c is not self.root:
            self.cur = c.parent

    def handle_data(self, d):
        self.cur.children.append(d)


def text(n):
    if n.tag in ("script", "style", "template", "noscript"):
        return ""
    out = []
    for c in n.children:
        out.append(c if isinstance(c, str) else text(c))
    return " ".join(out)


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def words(s):
    return len(re.findall(r"[\w’'-]+", s))


def ancestors(n):
    p = n.parent
    while p is not None:
        yield p
        p = p.parent


def find_all(n, tag):
    for c in n.children:
        if isinstance(c, Node):
            if c.tag == tag:
                yield c
            yield from find_all(c, tag)


def first(n, tag):
    return next(find_all(n, tag), None)


def is_partner(n):
    if n.tag == "iframe":
        return True
    if n.tag == "a":
        href = n.attrs.get("href") or ""
        rel = n.attrs.get("rel") or ""
        host = urlparse(href).netloc.lower()
        return "sponsored" in rel or any(h in host for h in PARTNER_HOSTS) or href.startswith(("/go/", "/out/"))
    if n.tag == "button":
        t = norm(text(n))
        return bool(re.match(r"(See stays|Find campervans|Compare car rental|See tours|See tour times|Get your US eSIM|Reserve rental gear|Shop this gear|Open partner site|Check availability|Book )", t))
    return False


def block_of(n, main):
    """Top-level container inside <main> that holds n (its 'block')."""
    b = n
    for a in ancestors(n):
        if a is main:
            return b
        b = a
    return b


def classify_link(path, own_place):
    p = path.rstrip("/") or "/"
    parts = [x for x in p.split("/") if x]
    if parts and parts[0] in ("de", "fr"):
        parts = parts[1:]
    hubs = {"destinations", "road-trips", "corridors", "rv-camping", "no-reservation", "fly-and-drive", "trip-guides", "gear"}
    if not parts:
        return "home"
    if parts[0] == "destinations":
        if len(parts) <= 3:
            return "hub"
        if len(parts) == 4:
            return "sibling" if parts[3] == own_place else "place"
        return "sibling" if parts[3] == own_place else "other-guide"
    if parts[0] in ("road-trips", "corridors"):
        return "hub" if len(parts) == 1 else "route"
    if parts[0] in ("rv-camping", "no-reservation", "fly-and-drive"):
        if len(parts) == 1:
            return "hub"
        return "sibling" if own_place and own_place in parts[1] else "other-guide"
    if parts[0] in hubs:
        return "hub"
    if parts[0] in ("about", "contact", "privacy", "terms", "affiliate-disclosure", "search", "experiences"):
        return "utility"
    return "other"


def analyze(path_html, url, headers):
    raw = open(path_html, encoding="utf-8", errors="replace").read()
    t = Tree()
    t.feed(raw)
    root = t.root
    head = first(root, "head") or root
    title = norm(text(first(head, "title"))) if first(head, "title") else ""
    metas = list(find_all(head, "meta"))
    desc = next((m.attrs.get("content", "") for m in metas if m.attrs.get("name") == "description"), "")
    robots = next((m.attrs.get("content", "") for m in metas if m.attrs.get("name") == "robots"), "")
    xrobots = next((v for k, v in headers if k.lower() == "x-robots-tag"), "")
    main = first(root, "main") or first(root, "body") or root
    h1 = first(root, "h1")
    h1t = norm(text(h1)) if h1 else ""
    own_place = urlparse(url).path.strip("/").split("/")
    own_place = own_place[3] if len(own_place) >= 4 and own_place[0] == "destinations" else (own_place[1] if len(own_place) == 2 else "")

    # Walk <main> in document order.
    main_nodes = [n for n in t.order if any(a is main for a in ancestors(n))]
    prose_words, first_prose_idx, prose_paras = 0, None, 0
    for i, n in enumerate(main_nodes):
        if n.tag in ("p", "dd") and not any(a.tag in NON_PROSE_ANCESTORS for a in ancestors(n)):
            w = words(norm(text(n)))
            if w >= 12:
                prose_words += w
                prose_paras += 1
                if first_prose_idx is None:
                    first_prose_idx = i
    partner_nodes = [(i, n) for i, n in enumerate(main_nodes) if is_partner(n)]
    before = [n for i, n in partner_nodes if first_prose_idx is None or i < first_prose_idx]
    blocks_before = len({id(block_of(n, main)) for n in before})
    partner_blocks_total = len({id(block_of(n, main)) for _, n in partner_nodes})

    links = []
    for a in find_all(main, "a"):
        href = a.attrs.get("href") or ""
        u = urlparse(href)
        if href.startswith("#") or not href:
            continue
        if u.netloc in ("", OWN, "www." + OWN) and (href.startswith("/") or u.netloc):
            links.append(u.path or "/")
    own_path = urlparse(url).path.rstrip("/")
    links = [l for l in links if l.rstrip("/") != own_path]
    uniq = sorted(set(links))
    cats = {}
    for l in uniq:
        c = classify_link(l, own_place)
        cats[c] = cats.get(c, 0) + 1

    imgs = []
    for img in find_all(root, "img"):
        src = img.attrs.get("src") or ""
        host = urlparse(src).netloc
        if "wikimedia.org" in host:
            kind = "wikimedia"
        elif any(h in host for h in PARTNER_HOSTS) or "viator" in src or "tripadvisor" in host:
            kind = "partner"
        elif src.startswith("/__l5e/"):
            kind = "uploaded asset"
        elif src.startswith("/assets/") or src.startswith("/images/") or src.startswith("data:"):
            kind = "site asset"
        elif host:
            kind = "other: " + host
        else:
            kind = "site asset"
        imgs.append(kind)
    credit_hosts = {}
    for a in find_all(root, "a"):
        h = urlparse(a.attrs.get("href") or "").netloc
        if h in ("commons.wikimedia.org", "www.flickr.com", "flickr.com", "unsplash.com", "www.pexels.com", "pixabay.com"):
            credit_hosts[h] = credit_hosts.get(h, 0) + 1

    scripts = []
    for s in find_all(root, "script"):
        src = s.attrs.get("src")
        if src:
            scripts.append(src)
    third = [s for s in scripts if urlparse(s).netloc and OWN not in urlparse(s).netloc]
    iframes = [i.attrs.get("src", "") for i in find_all(root, "iframe")]

    map_present = (('id="road-trip"' in raw and "Route map coming soon" not in raw) or 'id="country-map"' in raw
                   or "relative h-[340px] overflow-hidden" in raw or "relative h-[360px] overflow-hidden" in raw)
    h2 = len(list(find_all(main, "h2")))
    norm_title = re.sub(r"\s*[—|–-]\s*WildParkRoutes\s*$", "", title).strip().lower()
    return {
        "url": url, "title": title, "description": desc, "h1": h1t,
        "title_differs_from_h1": norm_title != h1t.strip().lower(),
        "prose_words": prose_words, "prose_paragraphs": prose_paras, "h2": h2,
        "partner_elements_before_first_prose": len(before), "partner_blocks_before_first_prose": blocks_before,
        "partner_blocks_total": partner_blocks_total, "first_prose_found": first_prose_idx is not None,
        "internal_links_main": len(uniq), "link_categories": cats,
        "map": map_present, "images": imgs, "photo_credit_links": credit_hosts,
        "scripts": scripts, "third_party_scripts": third, "iframes": iframes,
        "robots_meta": robots, "x_robots_tag": xrobots, "bytes": len(raw.encode("utf-8")),
    }


def read_headers(path):
    try:
        lines = open(path, encoding="latin-1").read().splitlines()
    except FileNotFoundError:
        return [], 0
    status, hs = 0, []
    for l in lines:
        if l.startswith("HTTP/"):
            if "Connection Established" in l:
                continue
            parts = l.split()
            status = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
            hs = []
        elif ":" in l:
            k, v = l.split(":", 1)
            hs.append((k.strip(), v.strip()))
    return hs, status


if __name__ == "__main__":
    sample, pages, heads = sys.argv[1:4]
    out = []
    for line in open(sample):
        tpl, url, fid = line.rstrip("\n").split("\t")
        hs, status = read_headers(f"{heads}/{fid}.txt")
        try:
            m = analyze(f"{pages}/{fid}.html", url, hs)
        except FileNotFoundError:
            m = {"url": url}
        m.update({"template": tpl, "status": status, "id": fid})
        out.append(m)
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)

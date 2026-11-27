import sys, json, re
sys.path.insert(0, ".")
from analyze import Tree, ancestors, first, is_partner, norm, text, words, NON_PROSE_ANCESTORS
out = {}
for line in open("sample.tsv"):
    tpl, url, fid = line.rstrip("\n").split("\t")
    t = Tree(); t.feed(open(f"pages/{fid}.html", encoding="utf-8", errors="replace").read())
    body = first(t.root, "body")
    nodes = [n for n in t.order if any(a is body for a in ancestors(n)) and not any(a.tag in ("header", "footer") for a in ancestors(n))]
    fp = None
    for i, n in enumerate(nodes):
        if n.tag in ("p", "dd") and not any(a.tag in NON_PROSE_ANCESTORS for a in ancestors(n)) and words(norm(text(n))) >= 12:
            fp = i; break
    before = [n for i, n in enumerate(nodes) if is_partner(n) and (fp is None or i < fp)]
    secs = set()
    for n in before:
        s = next((a for a in ancestors(n) if a.tag in ("section", "main") or (a.attrs.get("id") or "").startswith("trip-")), None)
        secs.add(id(s))
    labels = sorted({norm(text(n))[:40] or n.attrs.get("src", "")[:40] for n in before})[:6]
    out[fid] = {"template": tpl, "partner_links_before_first_prose_body": len(before), "partner_blocks_before_first_prose_body": len(secs), "labels": labels}
json.dump(out, open("body_partner.json", "w"), indent=1, ensure_ascii=False)

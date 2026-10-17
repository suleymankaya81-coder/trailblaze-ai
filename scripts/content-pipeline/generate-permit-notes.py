"""Write destination-specific reservation notes once into destinations.permit_*.
Resumable: only rows with an empty permit_note are processed.
Run: python scripts/content-pipeline/generate-permit-notes.py [--limit N] [slug ...]
"""
import json, os, sys
import requests

sys.path.insert(0, "/tmp")
from lovable_ai import call_ai_json  # copied from the ai-gateway skill

REST = os.environ["SUPABASE_URL"] + "/rest/v1"
SK = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json"}
BANNED = ["guarantee", "cheapest", "best deal", "hurry", "discount", "don't miss"]

args = sys.argv[1:]
limit = 20
if "--limit" in args:
    i = args.index("--limit"); limit = int(args[i + 1]); del args[i:i + 2]

q = "destinations?status=eq.published&permit_note=is.null&select=id,slug,name,region,state,best_season,permit_level,nearest_airport_code,drive_minutes,destination_type&order=created_at"
if args:
    q += "&slug=in.(" + ",".join(args) + ")"
rows = requests.get(f"{REST}/{q}&limit={limit}", headers=H).json()

for d in rows:
    prompt = f"""Write the "Reservation needed" note for a road-trip guide page about {d['name']} ({d['region'] or d['state']}), type: {d['destination_type']}.
Known: permit pressure {d['permit_level']}, best season {d['best_season']}, nearest airport {d['nearest_airport_code']}.
Return JSON: {{"headline": "max 40 chars, specific (e.g. 'Timed entry late May–Oct')", "note": "2-3 sentences, 220-340 chars, specific to this place: which reservations matter (entry, campsites, lodges, shuttles, tours), roughly how far ahead, and one practical tip", "source_url": "official https URL (nps.gov, recreation.gov, state park site) or empty string"}}
Rules: only well-known facts about this place; say systems 'may' change and to check the official site; no exact prices, no guarantees, no urgency or discount language, no business names except official agencies; never mention specific years."""
    try:
        r = call_ai_json(prompt, model="google/gemini-3-flash-preview")
        if isinstance(r, str):
            r = json.loads(r)
        head, note, src = r["headline"].strip(), r["note"].strip(), (r.get("source_url") or "").strip()
        if not (12 <= len(head) <= 48 and 160 <= len(note) <= 420) or any(b in note.lower() for b in BANNED):
            print(d["slug"], "REJECTED", len(head), len(note)); continue
        if src and not src.startswith("https://"):
            src = ""
        requests.patch(f"{REST}/destinations?id=eq.{d['id']}", headers=H,
                       json={"permit_headline": head, "permit_note": note, "permit_source_url": src or None}).raise_for_status()
        print(d["slug"], "OK", head)
    except Exception as e:
        print(d["slug"], "ERROR", e)

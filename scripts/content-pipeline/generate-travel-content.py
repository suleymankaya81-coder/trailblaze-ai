"""Generate destination-specific travel content once, in bounded resumable batches.
Run --limit 24. Credits/policy/refusals halt every entry point until explicit --resume.
"""
import argparse, datetime, json, os, re, subprocess, time
from pathlib import Path
import requests
from canada.review import reviewed_item
from source_evidence import grounded_rows, load_packet, validate_citations, GROUNDING
from gateway_call import call_ai_json

JOB = 'destination-travel-v1'
MODEL = 'google/gemini-3-flash-preview'
CACHE = Path('scripts/content-pipeline/travel-content')
CACHE.mkdir(exist_ok=True)

def sql(query):
    return subprocess.check_output(['psql', '-X', '-v', 'ON_ERROR_STOP=1', '-Atc', query], text=True).strip()

def literal(v):
    return "'" + v.replace("'", "''") + "'"

GENERIC_STOP_WORDS = set('unesco world heritage site estate visitor centre center trail walk walks village park country national area the and head show caves cave valley waterways'.split())

def _norm(text):
    return re.sub(r"[’‘`]", "'", text.lower())

def unsupported_stops(plan, packet):
    """A stop passes when every distinctive word of its name appears in the official evidence."""
    text = _norm(' '.join(src.get('text', '') for src in packet['sources']))
    words = set(re.findall(r"[a-z0-9']+", text))
    missing = []
    for day in plan['days']:
        for st in day['stops']:
            name = _norm(re.sub(r'\(.*?\)', '', st['name']))
            key = [w for w in re.findall(r"[a-z0-9']+", name) if len(w) > 2 and w not in GENERIC_STOP_WORDS]
            if not key or not all(w in words for w in key):
                missing.append(st['name'])
    return missing

def validate(item):
    p = item['plan']
    assert 3 <= len(p['days']) <= 4, '3–4 days required'
    for day in p['days']:
        assert 2 <= len(day['stops']) <= 3, '2–3 daily sights required'
        assert all(len(s['detail']) >= 20 for s in day['stops']), 'short sight detail'
        assert all(day.get(k) for k in ['title', 'start', 'driving', 'note'])
    assert {x['kind'] for x in p['intel']} == {'parking','signal','fuel','timing','access'}
    assert all(len(x['text']) >= 30 for x in p['intel'])
    assert all(len(p[k]) >= 40 for k in ['arrival','vehicle','goldenHour'])
    assert p['sources'] and all(s['url'].startswith('https://') for s in p['sources'])
    assert 12 <= len(item['headline']) <= 70 and 160 <= len(item['reservation']) <= 700
    assert item['source_url'].startswith('https://')
    text = json.dumps(item).lower()
    assert not re.search(r'\b20\d{2}\b|ranger pick|cheapest|best deal|hurry', text), 'unsupported claim/year'
    return p

PROMPT = '''You are WildParkRoutes's factual outdoor travel editor. Write fluent, polished English specific to EACH destination in the supplied facts and existing guides. Existing guides are context, not verified current policy. Use stable well-known landmarks and official sources. Never invent a place, a last gas station, a ranger endorsement, exact parking fill time, GPS coordinates, fares or current permit rules. Qualify changing access and distinguish suggested times from opening hours. Avoid repetitive generic park advice for towns, coasts, islands and urban destinations. Match geography and gateway: island itineraries must not assume mainland road access. Daily drives are rough suggestions, not measured routes; use 'Allow ...; conditions vary' or state walking/local transfer. No exact prices or specific years. No packing/gear-shopping content. No urgency/guarantees/discount copy. Reservation note must explain the actual bottleneck and official check. Golden hour is a named viewpoint and season-dependent suggestion, not an exact sunrise time. Vehicle advice must mention checking actual rental/road restrictions. Do not prescribe medical/safety guarantees. Every source_url and sources[].url must be copied exactly from a url in that destination's evidence packet; never cite a homepage or page that is not in the packet. Never write a four-digit year.
Return JSON object {"items":[...]}, exactly one per input slug, each:
{"slug":"...","headline":"specific reservation headline 12–70 chars","reservation":"2–4 sentences 160–700 chars about this place; distinguish entry from accommodation, changing systems require official check","source_url":"official https source","plan":{"version":1,"days":[{"title":"specific regional theme","start":"Suggested: ...","stops":[{"name":"actual named sight","detail":"why visit and logical order, 1–2 sentences"}],"driving":"rough daily travel allowance with uncertainty","note":"local seasonal constraint or pace advice"}],"intel":[{"kind":"parking|signal|fuel|timing|access","title":"local short heading","text":"2 specific useful sentences tied to named local areas; qualify unknowns"}],"arrival":"First two hours: rental pickup, realistic supply town and check-in logic","vehicle":"Car vs RV suitability in this region, check restrictions","goldenHour":"Named sunrise/sunset viewpoint with seasonal caveat","sources":[{"label":"official agency/park","url":"official https page"}]}}
3 or 4 days, exactly 2–3 named sights per day, all five unique intel kinds, at least one real official source. start MUST contain a suggested clock time such as 'Suggested: 8 AM from Bar Harbor', not only a location. No generic day titled Arrive & settle in / The iconic core / Golden hour & departure. Sources must match this destination, not unrelated parks.
Facts and guides:\n'''

def generate(rows):
    rows = grounded_rows(rows)
    # Hide link targets inside page text so only the packet's own source URLs can be cited.
    for r in rows:
        for src in r['evidence']['sources']:
            src['text'] = re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'\1', src['text'])
            src['text'] = re.sub(r'https?://\S+', '', src['text'])
    try:
        parsed = call_ai_json(GROUNDING+'\n'+PROMPT+json.dumps(rows), model=MODEL)
        if isinstance(parsed, dict) and parsed.get('held'):
            raise ValueError('HELD: ' + parsed['held'])
        return parsed if isinstance(parsed, list) else parsed['items']
    except RuntimeError:
        sql(f"update content_pipeline_jobs set status='paused',pause_reason='Gateway failure requires explicit review' where job_key={literal(JOB)}")
        raise

def main():
    args = argparse.ArgumentParser(); args.add_argument('--limit',type=int,default=24); args.add_argument('--resume',action='store_true'); args.add_argument('--country'); args.add_argument('--slugs',nargs='+'); a=args.parse_args()
    assert 1 <= a.limit <= 60
    sql(f"insert into content_pipeline_jobs(job_key) values ({literal(JOB)}) on conflict do nothing")
    if a.resume: sql(f"update content_pipeline_jobs set status='ready',pause_reason=null where job_key={literal(JOB)} and pause_reason not in ('Content refusal','Provider access denial')")
    state = sql(f"select status from content_pipeline_jobs where job_key={literal(JOB)}")
    if state == 'paused': raise RuntimeError('Job paused; restore access or credits before explicit resume')
    lock = sql(f"update content_pipeline_jobs set lease_until=now()+interval '12 minutes' where job_key={literal(JOB)} and status<>'paused' and (lease_until is null or lease_until<now()) returning job_key")
    if not lock: raise RuntimeError('Another run holds the lease')
    try:
        rows = json.loads(sql(f"select coalesce(json_agg(t),'[]') from (select d.slug,d.name,d.state,d.region,d.destination_type,d.best_season,d.permit_level,d.nearest_airport_code,d.nearest_airport_name,d.drive_minutes,d.gateway_cities,d.lat,d.lng,null as guides from destinations d where d.travel_plan is null"+(f" and d.country_code={literal(a.country)}" if a.country else "")+(" and d.slug in ("+','.join(literal(s) for s in a.slugs)+")" if a.slugs else "")+f" order by (d.slug='yellowstone') desc,(d.status='published') desc,d.name limit {a.limit})t"))
        for start in range(0,len(rows),3):
            if sql(f"select status from content_pipeline_jobs where job_key={literal(JOB)}") == 'paused': break
            chunk = rows[start:start+3]
            # Bound source context to the existing guide headings/paragraphs; no per-visit calls.
            for r in chunk:
                r['guides'] = json.dumps(r['guides'])[:13000]
            pending = [r for r in chunk if not (CACHE/(r['slug']+'.json')).exists()]
            if pending:
                items = generate(pending)
                assert len({i['slug'] for i in items}) == len(items), 'duplicate slug'
                assert {i['slug'] for i in items} <= {r['slug'] for r in pending}, 'slug mismatch'
                for item in items:
                    (CACHE/(item['slug']+'.json')).write_text(json.dumps(item,ensure_ascii=False,indent=2))
            for r in chunk:
                if not (CACHE/(r['slug']+'.json')).exists():
                    print(r['slug'], 'HELD incomplete response', flush=True); continue
                item=reviewed_item(json.loads((CACHE/(r['slug']+'.json')).read_text()))
                try:
                    packet = load_packet(r['slug'])
                    p=validate(item)
                    validate_citations([item['source_url']] + [s['url'] for s in p['sources']], packet)
                    missing = unsupported_stops(p, packet)
                    if missing: raise ValueError('stops not named in sources: ' + ', '.join(missing))
                except (AssertionError, KeyError, ValueError) as error:
                    print(r['slug'], 'HELD', str(error), flush=True)
                    continue
                p.update(markers=[],reviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
                # All three fields commit together; reruns skip completed destinations.
                key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
                response = requests.patch(os.environ['SUPABASE_URL']+'/rest/v1/destinations', params={'slug':'eq.'+r['slug'],'travel_plan':'is.null'}, headers={'apikey':key,'Authorization':'Bearer '+key}, json={'travel_plan':p,'permit_headline':item['headline'],'permit_note':item['reservation'],'permit_source_url':item['source_url']})
                response.raise_for_status()
                sql(f"update content_pipeline_jobs set completed=(select count(*) from destinations where travel_plan is not null),updated_at=now(),lease_until=now()+interval '12 minutes' where job_key={literal(JOB)}")
                print(r['slug'],'OK',flush=True)
            time.sleep(1)
    finally: sql(f"update content_pipeline_jobs set lease_until=null where job_key={literal(JOB)}")

if __name__=='__main__': main()

"""Bounded source/fact-first DACH batch; one retained Gemini attempt per place."""
import json
import subprocess
import sys
from pathlib import Path
from combined_content import module, generate_bundle, validate_bundle
from compact_evidence import compact_packet
from dach_discovery import get, fetch_public_source, key
from source_evidence import load_packet
from save_reviewed_bundle import save_reviewed_bundle
from quoted_visit import quoted_bundle

ROOT = Path(__file__).parent
REPORT = ROOT / 'dach/gemini-completion-2026-11-16.json'
JOB = 'dach-gemini-79-v1'
ALIASES = {
 'lake-walchensee':'Walchensee', 'island-of-usedom':'Usedom', 'island-of-amrum':'Amrum',
 'island-of-fohr':'Föhr', 'island-of-borkum':'Borkum', 'island-of-spiekeroog':'Spiekeroog',
 'eisriesenwelt-ice-cave':'Eisriesenwelt', 'gosau-lakes':'Gosausee',
 'golling-waterfall':'Gollinger Wasserfall', 'lake-geneva-and-lavaux':'Lavaux',
 'grosses-walsertal-biosphere-park':'Großes Walsertal', 'teutoburg-forest-nature-park':'Teutoburg Forest / Egge Hills Nature Park',
 'todtnau-waterfall':'Todtnauer Wasserfall', 'kaunertal-glacier-road':'Kaunertal',
 'lower-saxon-elbe-valley-biosphere-reserve':'Niedersächsische Elbtalaue',
 'karst-landscape-south-harz-biosphere-reserve':'Karstlandschaft Südharz',
 'upper-palatinate-forest-nature-park':'Naturpark Oberpfälzer Wald',
 'south-eifel-nature-park':'Naturpark Südeifel',
 'saale-unstrut-triasland-nature-park':'Naturpark Saale-Unstrut-Triasland',
 'vogelsberg-volcanic-region-nature-park':'Naturpark Vulkanregion Vogelsberg',
 'elbe-river-landscape-biosphere-reserve':'Flusslandschaft Elbe',
}

def literal(value):
    return "'" + str(value).replace("'", "''") + "'"

def source_candidates(row, site):
    urls = [u.replace('http://','https://',1) for u in site.get('urls', [])]
    for path in (ROOT/'dach/discovery-cache').glob('*.json'):
        cached = json.loads(path.read_text())
        if cached.get('status') != 200 or 'wikipedia.' in cached.get('url','') or 'wikidata.' in cached.get('url',''):
            continue
        # Only already-collected tourism/park pages; matching paragraphs are reviewed below.
        body = cached.get('body','')
        if row['name'].casefold() in body.casefold() or row['authority'].casefold() in body.casefold():
            urls.append(cached['url'])
    return list(dict.fromkeys(urls))[:6]

def collect_packet(row, site):
    try:
        return compact_packet(load_packet(row['slug']))
    except ValueError:
        pass
    builder = module('dach_packet_builder', 'build-dach-packets.py')
    for url in source_candidates(row, site):
        try:
            source = fetch_public_source(url)
            hit = builder.pick(row, source['text'])
            # An authority can govern a different attraction; require the place itself.
            if not hit or (key(hit[0]) == key(row['authority']) and key(row['name']) not in key(hit[1])):
                continue
            name, quote = hit
            source.update(kind='official', generation_excerpts=[quote])
            packet = {'slug':row['slug'], 'approved_for_generation':True,
                'sources':[source], 'approved_stops':[{'id':row['slug'], 'name':name,
                'quote':quote, 'source_url':source['url']}],
                'review_note':'Exact place-naming paragraph from retained official tourism/park candidate. Operational gaps remain unknown.'}
            compact = compact_packet(packet)
            path = ROOT/'source-packets'/f"{row['slug']}.json"
            path.write_text(json.dumps(packet, ensure_ascii=False, indent=2))
            return compact
        except Exception:
            continue
    raise ValueError('No exact-place official excerpt; Gemini cannot establish absent source facts')

def facts(row, site, prepare):
    path = ROOT/'wave3-facts'/f"{row['slug']}.json"
    if path.exists():
        return json.loads(path.read_text())
    slug = row['slug']
    names = list(dict.fromkeys([ALIASES.get(slug, row['name']), row['name'], row['authority']]))
    if site.get('qid') and {'de':'Q183','at':'Q40','ch':'Q39'}[row['country']] in site.get('countries',[]):
        try:
            entity = json.loads(get('https://www.wikidata.org/wiki/Special:EntityData/'+site['qid']+'.json')['body'])['entities'][site['qid']]
            # Only use entity coordinates when its label is the place, not its parent authority.
            labels = [x['value'] for x in entity.get('labels',{}).values()]
            coords = entity.get('claims',{}).get('P625',[])
            if any(key(n)==key(label) for n in names[:2] for label in labels) and coords:
                point = coords[0]['mainsnak']['datavalue']['value']
                prepare.COORDS[slug] = (point['latitude'],point['longitude'])
            links = entity.get('sitelinks',{})
            if links.get('enwiki'):
                names.insert(0, links['enwiki']['title'])
        except Exception:
            pass
    pimg = lat = lng = None
    for name in names[:3]:
        try:
            image, a, b = prepare.wiki(name)
            if a is not None:
                pimg,lat,lng = image,a,b
                break
        except Exception:
            continue
    if lat is None and slug in prepare.COORDS:
        lat,lng = prepare.COORDS[slug]
    bounds = {'de':(47,55.2,5.5,15.5),'at':(46.3,49.1,9.4,17.2),'ch':(45.8,47.9,5.8,10.6)}[row['country']]
    if lat is None or not(bounds[0]<=lat<=bounds[1] and bounds[2]<=lng<=bounds[3]):
        raise ValueError('Verified same-place coordinates missing')
    used = set(prepare.q('select hero_image from destinations where hero_image is not null').splitlines())
    hero = prepare.file_info(pimg) if pimg else None
    if hero and (hero['url'] in used or prepare.BAD.search(hero['file'])):
        hero = None
    if not hero:
        for name in names[:2]:
            photos = prepare.commons_search(name, limit=12)
            for photo in photos:
                # Require a distinctive place term in the file name, not merely a search hit.
                terms = [key(t) for t in name.split() if len(key(t))>=5 and t.lower() not in {'national','nature','forest','biosphere','reserve','landscape','naturpark','nationalpark'}]
                if photo['url'] not in used and terms and any(t in key(photo['file']) for t in terms):
                    hero=photo
                    break
            if hero:
                break
    if not hero or hero['license'] in ('See source','') or hero['credit']=='Unknown':
        raise ValueError('Licensed exact-place cover missing')
    routes=[]
    for airport in prepare.airports(lat,lng,n=2,country=row['country']):
        route=prepare.route(airport,lat,lng)
        if route: routes.append((route['minutes'],airport,route))
    if not routes:
        raise ValueError('Verified airport route missing; island transfers cannot be invented')
    _,airport,route=min(routes,key=lambda x:x[0])
    prepared={'slug':slug,'name':row['name'],'state':row['region'].replace('-',' ').title(),
        'destination':{'slug':slug,'name':row['name'],'country_code':row['country']},
        'lat':lat,'lng':lng,'airport':airport,'route':route,'hero':hero,'gallery':[],'activity':[]}
    path.write_text(json.dumps(prepared,ensure_ascii=False,indent=2))
    return prepared

def main():
    prepare=module('dach_gemini_prepare','prepare-wave.py')
    rows={r['slug']:r for r in json.loads((ROOT/'dach/catalog.json').read_text())}
    requested=[h['slug'] for h in json.loads((ROOT/'dach/completion-2026-11-16.json').read_text())['held']]
    sites=json.loads((ROOT/'dach/official-sites.json').read_text())
    published=set(prepare.q("select slug from destinations where status='published'").splitlines())
    prepare.q(f"insert into content_pipeline_jobs(job_key) values ({literal(JOB)}) on conflict do nothing")
    if prepare.q(f"select status from content_pipeline_jobs where job_key={literal(JOB)}")=='paused':
        raise RuntimeError('Gemini batch paused; owner recovery required')
    lock=prepare.q(f"update content_pipeline_jobs set lease_until=now()+interval '12 minutes' where job_key={literal(JOB)} and status<>'paused' and (lease_until is null or lease_until<now()) returning job_key")
    if not lock: raise RuntimeError('Another DACH Gemini batch is running')
    results=[]
    def save():
        REPORT.write_text(json.dumps({'requested':len(requested),'results':results},ensure_ascii=False,indent=2))
    try:
        # Finish every non-AI preparation before starting any paid generation.
        ready=[]
        for slug in requested:
            if slug in published:
                results.append({'slug':slug,'status':'already_published'});save();continue
            row=rows[slug]
            try:
                collect_packet(row,sites.get(slug,{}))
                prepare.q("insert into destinations (slug,name,state,country_code,region_slug,currency,park_authority,access_type,destination_type,status,tier,seo_eligible) values ("
                    + ','.join(literal(v) for v in [slug,row['name'],row['region'].replace('-',' ').title(),row['country'],row['region'],
                        'CHF' if row['country']=='ch' else 'EUR',row['authority'],row['access'],row['kind']])
                    + ",'draft','tier1',false) on conflict (slug) do nothing")
                prepared=facts(row,sites.get(slug,{}),prepare)
                ready.append((row,prepared))
                print(slug,'facts ready',flush=True)
            except Exception as error:
                results.append({'slug':slug,'status':'held_before_ai','reason':str(error)[:500]})
                print(slug,'HELD',str(error)[:150],flush=True)
            prepare.q(f"update content_pipeline_jobs set lease_until=now()+interval '12 minutes' where job_key={literal(JOB)}")
            save()
        for row,prepared in ready:
            slug=row['slug']
            try:
                if prepare.q(f"select status from content_pipeline_jobs where job_key={literal(JOB)}")=='paused':
                    raise RuntimeError('Batch paused')
                bundle=generate_bundle(prepared)
                # Structural checks do not verify operational facts. Retain inference,
                # use exact-source compact visits/unknowns for publishable guidance.
                state_path=ROOT/'combined-content'/f'{slug}.json'
                state=json.loads(state_path.read_text())
                state.setdefault('original_gemini_bundle',json.loads(json.dumps(bundle)))
                packet=load_packet(slug)
                bundle['travel']=quoted_bundle(row,packet)['travel']
                bundle=validate_bundle(bundle,slug,compact_packet(packet))
                state.update(bundle=bundle,status='validated',review_note='Gemini summary retained; exact excerpts and explicit operational unknowns replace unsupported guidance, without another call.')
                state_path.write_text(json.dumps(state,ensure_ascii=False,indent=2))
                path=Path('/tmp/wave')/f'{slug}.json'
                path.parent.mkdir(exist_ok=True)
                path.write_text(json.dumps({k:v for k,v in prepared.items() if k!='destination'}|{'ai':bundle['summary']}))
                applied=subprocess.run([sys.executable,str(ROOT/'apply-wave.py'),slug],text=True,capture_output=True)
                if applied.returncode:raise ValueError(applied.stdout+applied.stderr)
                save_reviewed_bundle(slug)
                published_result=subprocess.run([sys.executable,str(ROOT/'publish-wave.py'),slug],text=True,capture_output=True)
                if slug+' published' not in published_result.stdout:raise ValueError(published_result.stdout+published_result.stderr)
                results.append({'slug':slug,'status':'published','name':row['name'],
                    'url':f"https://wildparkroutes.com/destinations/{row['country']}/{row['region']}/{slug}"})
                prepare.q(f"update content_pipeline_jobs set completed=completed+1,lease_until=now()+interval '12 minutes' where job_key={literal(JOB)}")
            except Exception as error:
                results.append({'slug':slug,'status':'held','reason':str(error)[-600:]})
                if 'generation failed' in str(error).lower():
                    prepare.q(f"update content_pipeline_jobs set status='paused',pause_reason='Gateway failure requires explicit review' where job_key={literal(JOB)}")
                    save();break
            print(json.dumps(results[-1],ensure_ascii=False),flush=True);save()
    finally:
        prepare.q(f"update content_pipeline_jobs set lease_until=null where job_key={literal(JOB)}")
        geo_path=Path('src/data/destination-geo.json')
        geo=json.loads(geo_path.read_text())
        for result in results:
            if result['status']=='published':geo[result['slug']]=rows[result['slug']]['country']+'/'+rows[result['slug']]['region']
        geo_path.write_text(json.dumps(dict(sorted(geo.items())),separators=(',',':')))
        save()
    print(json.dumps({'processed':len(results),'published':sum(x['status']=='published' for x in results),'held':sum(x['status'].startswith('held') for x in results)}),flush=True)

if __name__=='__main__':main()
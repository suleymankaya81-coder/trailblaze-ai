"""Collect official evidence before content generation; explicit editor approval required.
Example: --slug example --official https://official.example/park --background https://en.wikipedia.org/wiki/Example
Run --approve only after reviewing the saved text and its destination identity.
"""
import argparse
import json
from source_evidence import PACKETS, fetch_source

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--slug', required=True)
    p.add_argument('--official', action='append', default=[])
    p.add_argument('--background', action='append', default=[])
    p.add_argument('--approve', action='store_true')
    args = p.parse_args()
    if not args.official:
        p.error('At least one destination-specific official source is required')
    sources = []
    for kind, urls in [('official', args.official), ('background', args.background)]:
        for url in urls:
            sources.append({**fetch_source(url), 'kind': kind})
    PACKETS.mkdir(parents=True, exist_ok=True)
    path = PACKETS / (args.slug + '.json')
    path.write_text(json.dumps({'slug': args.slug, 'approved_for_generation': args.approve,
                               'sources': sources}, ensure_ascii=False, indent=2))
    print(args.slug, 'approved' if args.approve else 'collected; review required')

if __name__ == '__main__':
    main()
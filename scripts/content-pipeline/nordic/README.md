# Nordic page production template

One command per stage, all 658 places (NO 224, IS 188, SE 82, FI 100, DK 64):

```
python3 scripts/content-pipeline/nordic/produce.py facts               # 0 credits
python3 scripts/content-pipeline/nordic/produce.py translate           # 0 credits (Argos)
python3 scripts/content-pipeline/nordic/produce.py publish --apply     # 0 credits, goes live
python3 scripts/content-pipeline/nordic/produce.py plan                # Gemini Flash, 1 cached call per place
python3 scripts/content-pipeline/nordic/produce.py all --apply         # everything in order
```

Options: `--country no` (or `no,is`), `--limit 10` for a test batch.
Progress per place: `nordic/production-report.json`; HELD lines name the missing fact.
Reruns skip finished places and reuse every cached download and model answer.

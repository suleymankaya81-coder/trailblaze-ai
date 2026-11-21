"""Step D: deterministic audit of the UI dictionary (dict/en|de|fr.ts) and the fixed-phrase
tables (phrases.de.ts/fr.ts + their generated.json). No network, no model calls. Run from repo root:
    python3 scripts/audits/translations-2026-11/dict_audit.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
I18N = ROOT / "src" / "lib" / "i18n"


def parse_ts_object(path):
    """Extract "key": "value" (or 'key': 'value') pairs from a simple TS object literal.
    Good enough for these flat string->string dictionaries; does not evaluate expressions."""
    text = path.read_text()
    pairs = {}
    for m in re.finditer(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', text):
        key = m.group(1).encode().decode("unicode_escape")
        val = m.group(2).encode().decode("unicode_escape")
        pairs[key] = val
    return pairs


def audit_nav_dict():
    en = parse_ts_object(I18N / "dict" / "en.ts")
    de = parse_ts_object(I18N / "dict" / "de.ts")
    fr = parse_ts_object(I18N / "dict" / "fr.ts")
    out = {"en_keys": len(en), "de_keys": len(de), "fr_keys": len(fr), "findings": []}
    for locale, table in (("de", de), ("fr", fr)):
        missing = sorted(set(en) - set(table))
        if missing:
            out["findings"].append({"locale": locale, "issue": "missing_keys", "keys": missing})
        identical = sorted(k for k in table if table[k] == en.get(k) and en.get(k))
        if identical:
            out["findings"].append({"locale": locale, "issue": "identical_to_english", "keys": identical})
        extra = sorted(set(table) - set(en))
        if extra:
            out["findings"].append({"locale": locale, "issue": "extra_key_not_in_english", "keys": extra})
        # Overflow risk: nav/button chrome ballooning far past the English length (fixed-width UI).
        overflow = []
        for k, v in table.items():
            base = en.get(k)
            if base and len(v) > max(20, len(base) * 1.8):
                overflow.append({"key": k, "en": base, "translated": v, "en_len": len(base), "translated_len": len(v)})
        if overflow:
            out["findings"].append({"locale": locale, "issue": "length_overflow_risk", "entries": overflow})
    return out


BANNED_TOKENS = ["{{", "}}", "{PLACE}", "undefined", "null", "[dated source]", "Check official seasonal information"]


def looks_untranslated(value, lang):
    """Very rough stopword heuristic: no accented/lang-specific function words at all in a long-enough string."""
    if len(value) < 15:
        return False
    low = value.lower()
    markers = {
        "de": ["der ", "die ", "das ", "und ", "für ", "mit ", "nicht ", "ihre", "ihr ", "ß", "ä", "ö", "ü"],
        "fr": [" le ", " la ", " les ", " des ", " et ", " pour ", " vous", " votre", " dans ", "é", "è", "ê", "à ", "ç"],
    }[lang]
    return not any(m in low for m in markers)


def audit_phrases(lang):
    hand = parse_ts_object(I18N / f"phrases.{lang}.ts")
    gen_path = I18N / f"phrases.{lang}.generated.json"
    gen = json.loads(gen_path.read_text())
    keys = list(gen.keys())
    key_set = set(keys)
    out = {"lang": lang, "hand_written_count": len(hand), "generated_count": len(gen), "findings": []}

    identical = [k for k, v in gen.items() if v == k]
    if identical:
        out["findings"].append({"issue": "identical_to_english_passthrough", "count": len(identical), "examples": identical[:10]})

    banned_hits = []
    for k, v in gen.items():
        for token in BANNED_TOKENS:
            if token in v:
                banned_hits.append({"key": k[:80], "value": v[:80], "token": token})
    if banned_hits:
        out["findings"].append({"issue": "leftover_placeholder_token", "count": len(banned_hits), "examples": banned_hits[:10]})

    # Cross-key misattribution: value is verbatim a DIFFERENT dict key (not its own) -- see report.md
    # for the full investigation; this is the mechanically provable signature of the fr scrambling bug.
    misattributed = []
    for i, k in enumerate(keys):
        v = gen[k]
        if v != k and v in key_set and gen.get(v) != v:
            misattributed.append({"index": i, "key": k[:90], "shown_value": v[:90], "that_keys_own_value": gen.get(v, "")[:90]})
    if misattributed:
        idxs = [m["index"] for m in misattributed]
        out["findings"].append({
            "issue": "cross_key_misattribution",
            "count": len(misattributed),
            "index_range": [min(idxs), max(idxs)],
            "total_entries": len(keys),
            "note": "value is verbatim a different dict key's English text, and that other key has its own distinct value -- "
                    "i.e. this entry shows unrelated English/scrambled content, not a translation of its own key. "
                    "Confined to a contiguous low-index window; entries inside that window that do NOT trip this exact "
                    "check are NOT thereby confirmed correct -- see report.md.",
            "examples": misattributed[:15],
        })

    rough_untranslated = [k for k, v in gen.items() if v != k and looks_untranslated(v, lang)]
    if rough_untranslated:
        out["findings"].append({"issue": "no_lang_markers_rough_heuristic", "count": len(rough_untranslated), "examples": rough_untranslated[:10]})

    return out


def main():
    OUT = Path(__file__).parent
    nav = audit_nav_dict()
    de_phrases = audit_phrases("de")
    fr_phrases = audit_phrases("fr")
    report = {"nav_dict": nav, "de_phrases": de_phrases, "fr_phrases": fr_phrases}
    (OUT / "dict-audit-data.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({
        "nav_dict_en_keys": nav["en_keys"],
        "de_phrases_generated": de_phrases["generated_count"],
        "fr_phrases_generated": fr_phrases["generated_count"],
        "fr_cross_key_misattribution_count": next((f["count"] for f in fr_phrases["findings"] if f["issue"] == "cross_key_misattribution"), 0),
        "de_cross_key_misattribution_count": next((f["count"] for f in de_phrases["findings"] if f["issue"] == "cross_key_misattribution"), 0),
    }, indent=2))


if __name__ == "__main__":
    main()

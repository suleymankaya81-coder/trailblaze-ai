import copy
import json
import unittest
from pathlib import Path
from validate_catalogs import validate_rows, validate_coverage, COUNTRIES


class CatalogRules(unittest.TestCase):
    def row(self):
        return dict(slug="thy-national-park", name="Thy National Park", region="north-jutland",
                    also_regions=[], country="dk", kind="national_park", wave=1,
                    wikidata=None, enwiki=True, lat=None, lng=None, official_site=None,
                    access="road", source="official", source_urls=["https://nationalparkthy.dk/"])

    def test_requested_five_countries(self):
        self.assertEqual(COUNTRIES, ("no", "is", "se", "fi", "dk"))

    def test_duplicate_destination_is_rejected(self):
        row = self.row()
        self.assertIn("dk/thy-national-park: duplicate slug", validate_rows([row, copy.deepcopy(row)], "dk"))

    def test_unknown_coordinates_allowed_not_guessed(self):
        self.assertEqual(validate_rows([self.row()], "dk"), [])

    def test_missing_official_park_fails_coverage(self):
        report = {"inventories": [{"id": "denmark-national-parks", "country": "dk", "expected_count": 1,
                                  "entries": [{"name": "Thy National Park", "catalog_slug": "thy-national-park"}]}]}
        self.assertEqual(validate_coverage({"dk": []}, report),
                         ["denmark-national-parks: unmatched Thy National Park"])

    def test_boat_only_requires_access_explanation(self):
        row = self.row()
        row["access"] = "boat"
        self.assertIn("dk/thy-national-park: non-road/unknown access needs note", validate_rows([row], "dk"))

    def test_delivered_catalogs_cover_every_enumerated_official_place(self):
        root = Path(__file__).parent
        catalogs = {cc: json.loads((root / f"{cc}-catalog.json").read_text()) for cc in COUNTRIES}
        report = json.loads((root / "coverage.json").read_text())
        self.assertEqual(validate_coverage(catalogs, report), [])
        for cc, rows in catalogs.items():
            self.assertEqual(validate_rows(rows, cc), [])

    def test_no_input_slug_is_lost_between_batches(self):
        root = Path(__file__).parent
        manifest = json.loads((root / "batch-manifest.json").read_text())
        for cc in COUNTRIES:
            rows = json.loads((root / f"{cc}-catalog.json").read_text())
            batched = [slug for batch in manifest if batch["country"] == cc for slug in batch["slugs"]]
            self.assertEqual(batched, [row["slug"] for row in rows])

    def test_realm_territories_do_not_become_denmark_mainland(self):
        rows = json.loads((Path(__file__).parent / "dk-catalog.json").read_text())
        self.assertFalse(any(row.get("territory") in ("fo", "gl") for row in rows))


if __name__ == "__main__":
    unittest.main()
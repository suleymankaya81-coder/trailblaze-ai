import json, pathlib, unittest
CAT = json.loads((pathlib.Path(__file__).parent / "uk/catalog.json").read_text())

class UkCatalog(unittest.TestCase):
    def test_no_duplicate_slugs(self):
        slugs = [e["slug"] for e in CAT]
        self.assertEqual(len(slugs), len(set(slugs)))
    def test_pilot_is_the_15_national_parks(self):
        self.assertEqual(len([e for e in CAT if e["wave"] == 1]), 15)
    def test_skomer_is_in_wales(self):
        self.assertEqual(next(e for e in CAT if e["slug"] == "skomer-island")["region"], "wales")
    def test_north_coast_500_is_not_a_destination_wave(self):
        self.assertIsNone(next(e for e in CAT if e["slug"] == "north-coast-500")["wave"])

if __name__ == "__main__":
    unittest.main()

class StopsMustBeSourced(unittest.TestCase):
    def test_stop_missing_from_sources_is_reported(self):
        import importlib.util, sys
        sys.path.insert(0, str(pathlib.Path(__file__).parent))
        spec = importlib.util.spec_from_file_location("gtc", pathlib.Path(__file__).parent / "generate-travel-content.py")
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        plan = {"days": [{"stops": [{"name": "Mam Tor"}, {"name": "Invented Falls (east)"}]}]}
        packet = {"sources": [{"text": "Walk up Mam Tor from Castleton."}]}
        self.assertEqual(m.unsupported_stops(plan, packet), ["Invented Falls (east)"])

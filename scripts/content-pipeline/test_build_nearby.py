import importlib.util, json, os, unittest

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("build_nearby", os.path.join(HERE, "build-nearby.py"))
bn = importlib.util.module_from_spec(spec); spec.loader.exec_module(bn)
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))


class NearbyRule(unittest.TestCase):
    def test_same_country_first_then_cross_border_within_150_km(self):
        geo = {"a": "nl/limburg", "b": "nl/limburg", "c": "be/liege", "d": "de/nrw", "e": "be/far"}
        coords = {"a": (50.85, 5.86), "b": (50.90, 5.90), "c": (50.80, 5.70), "d": (50.78, 6.08), "e": (49.5, 5.0)}
        out = bn.build(geo, coords)
        self.assertEqual([s for s, _ in out["a"]][0], "b")                 # same country first
        self.assertEqual({s for s, _ in out["a"]}, {"b", "c", "d"})        # e is > 150 km away
        self.assertTrue(all(d <= 150 for s, d in out["a"][1:]))
        self.assertNotIn("a", [s for s, _ in out["a"]])

    def test_generated_file_matches_the_rule(self):
        geo = json.load(open(os.path.join(ROOT, "src/data/destination-geo.json")))
        near = json.load(open(os.path.join(ROOT, "src/data/nearby.json")))
        self.assertEqual(set(near), set(geo))
        for slug, lst in near.items():
            self.assertLessEqual(len(lst), 6)
            self.assertNotIn(slug, [s for s, _ in lst])
            country = geo[slug].split("/")[0]
            seen_other = False
            for s, km in lst:
                if geo[s].split("/")[0] != country:
                    seen_other = True
                    self.assertLessEqual(km, 150, (slug, s, km))
                else:
                    self.assertFalse(seen_other, f"{slug}: same-country place after a foreign one")


if __name__ == "__main__":
    unittest.main()

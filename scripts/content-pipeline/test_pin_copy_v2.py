import datetime, importlib.util, os, unittest
import pin_copy_v2 as c

os.environ.setdefault("SUPABASE_DB_URL", "x"); os.environ.setdefault("SUPABASE_URL", "x"); os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "x")
spec = importlib.util.spec_from_file_location("rp", os.path.join(os.path.dirname(__file__), "render-pins.py"))
rp = importlib.util.module_from_spec(spec); spec.loader.exec_module(rp)


class CopyTests(unittest.TestCase):
    def test_card_gives_concrete_next_step(self):
        sub, info = c.card("destination", {"dur": "3-4 days", "airport": "DEN", "drive_minutes": 95, "permit_level": "high"})
        self.assertEqual(info, "Fly into DEN · 1.5 hr drive · Reservation required")

    def test_csv_limits(self):
        self.assertLessEqual(len(c.csv_title("rv_camping", "X" * 120)), 100)
        self.assertLessEqual(len(c.csv_description("loop", "A", "s", "i" * 600, {"stop_names": "a"})), 500)


class CsvScheduleTests(unittest.TestCase):
    def test_csv_skips_rss_days_and_caps_100(self):
        s = datetime.datetime(2026, 10, 28, tzinfo=datetime.timezone.utc)
        out = rp.csv_schedule([str(i) for i in range(150)], [s], s)
        days = sorted({d.date() for d in out.values()})
        self.assertNotIn(s.date(), days)
        self.assertEqual(sum(d.date() == days[0] for d in out.values()), 100)


if __name__ == "__main__":
    unittest.main()

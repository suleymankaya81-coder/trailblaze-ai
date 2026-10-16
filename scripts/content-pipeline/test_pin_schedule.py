import datetime
import unittest
from collections import Counter
from pin_schedule import release_schedule

START = datetime.datetime(2026, 10, 17, tzinfo=datetime.timezone.utc)


class ScheduleTests(unittest.TestCase):
    def test_maximum_is_200_across_boards_not_per_board(self):
        items = [{"key": str(i), "feed": str(i % 4), "score": i} for i in range(2200)]
        counts = Counter(d.date() for d in release_schedule(items, START).values())
        self.assertEqual(len(counts), 11)
        self.assertEqual(set(counts.values()), {200})

    def test_existing_releases_keep_their_dates_and_consume_capacity(self):
        items = [{"key": str(i), "feed": "parks", "score": i} for i in range(201)]
        dates = release_schedule(items, START, {"0": START})
        self.assertEqual(dates["0"], START)
        self.assertEqual(sum(d.date() == START.date() for d in dates.values()), 200)
        self.assertEqual(sum(d.date() == (START + datetime.timedelta(days=1)).date() for d in dates.values()), 1)


if __name__ == "__main__":
    unittest.main()
import unittest
from travel_review_rules import reviewed_markers

class MarkerReviewTests(unittest.TestCase):
    def test_wrong_hawksbill_is_removed(self):
        self.assertEqual(reviewed_markers('linville-gorge', [{'name': 'Hawksbill Mountain', 'lat': 38.55527778, 'lng': -78.395}]), [])

    def test_flaming_gorge_uses_official_center_coordinates(self):
        result = reviewed_markers('flaming-gorge', [{'name': 'Red Canyon Visitor Center', 'lat': 38.03333333, 'lng': -111.63333333}])
        self.assertEqual(result[0]['lat'], 40.89091)
        self.assertEqual(result[0]['lng'], -109.560855)

    def test_catherine_creek_uses_washington_trailhead(self):
        result = reviewed_markers('columbia-river-gorge-washington', [{'name': 'Catherine Creek', 'lat': 45.31361111, 'lng': -117.87222222}])
        self.assertEqual(result[0]['name'], 'Catherine Creek Trailhead')
        self.assertEqual(result[0]['lat'], 45.710501)
        self.assertEqual(result[0]['lng'], -121.362052)

    def test_unverified_parent_point_is_withheld(self):
        self.assertEqual(reviewed_markers('pictured-rocks', [{'name': 'Grand Sable Dunes'}]), [])

    def test_other_destination_is_not_removed_by_same_name(self):
        marker = {'name': 'Hawksbill Mountain', 'lat': 38.55527778, 'lng': -78.395}
        self.assertEqual(reviewed_markers('shenandoah', [marker]), [marker])

if __name__ == '__main__':
    unittest.main()
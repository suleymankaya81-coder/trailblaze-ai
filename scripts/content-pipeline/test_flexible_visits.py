import copy
import unittest
from combined_content import module
from compact_evidence import approved_stops
from visit_policy import required_offer_count, requires_activity_photos

travel = module('flexible_travel_test', 'generate-travel-content.py')

def item(days=1):
    return {'headline': 'Check local visitor access', 'reservation': 'Check the official visitor page before departure for current access and admission arrangements. Entry and accommodation are separate; confirm any booking requirement for the chosen visit.',
            'source_url': 'https://park.test/visit', 'plan': {
                'days': [{'title': 'Waterfall visit', 'start': 'Suggested: 10 AM', 'driving': 'Walking visit; conditions vary', 'note': 'Check access before departure',
                          'stops': [{'name': 'Waterfall', 'detail': 'Follow the official walking route to view the waterfall.'}]} for _ in range(days)],
                'intel': [{'kind': k, 'text': 'Consult the official visitor information before departure.'} for k in ['parking', 'signal', 'fuel', 'timing', 'access']],
                'arrival': 'Check official visitor access before starting the walk.',
                'vehicle': 'Check actual rental restrictions before travelling here.',
                'goldenHour': 'Only visit the viewpoint during permitted seasonal access.',
                'sources': [{'url': 'https://park.test/visit'}]}}

class FlexibleVisitTests(unittest.TestCase):
    def test_dach_cover_only_does_not_require_supporting_photos(self):
        for country in ('de', 'at', 'ch'):
            self.assertFalse(requires_activity_photos(country))

    def test_existing_uk_and_us_activity_photo_gates_remain(self):
        self.assertTrue(requires_activity_photos('gb'))
        self.assertTrue(requires_activity_photos('us'))

    def test_compact_uk_offer_count_follows_actual_sights(self):
        self.assertEqual(required_offer_count('gb', item()['plan']), 10)
        plan = item()['plan']
        plan['days'][0]['stops'].append({'name': 'Second sight'})
        self.assertEqual(required_offer_count('gb', plan), 11)

    def test_existing_us_offer_gate_is_unchanged(self):
        self.assertEqual(required_offer_count('us', item()['plan']), 15)

    def test_one_day_one_sight_is_valid(self):
        self.assertEqual(len(travel.validate(item())['days']), 1)

    def test_review_timestamp_does_not_fail_visible_year_screening(self):
        value = item()
        value['plan']['reviewedAt'] = '2026-11-15T18:00:00+00:00'
        self.assertEqual(len(travel.validate(value)['days']), 1)

    def test_visible_unsupported_year_still_fails(self):
        value = item()
        value['plan']['arrival'] += ' Visit in 2026.'
        with self.assertRaisesRegex(AssertionError, 'unsupported claim/year'):
            travel.validate(value)

    def test_multiple_days_remain_valid(self):
        self.assertEqual(len(travel.validate(item(5))['days']), 5)

    def test_empty_visit_is_rejected(self):
        with self.assertRaises(AssertionError):
            travel.validate(item(0))

    def test_empty_sight_day_is_rejected(self):
        value = item()
        value['plan']['days'][0]['stops'] = []
        with self.assertRaises(AssertionError):
            travel.validate(value)

    def test_one_exactly_sourced_identity_is_enough(self):
        quote = 'Waterfall is reached along the official visitor walking route.'
        packet = {'sources': [{'kind': 'official', 'url': 'https://park.test/visit', 'text': quote}],
                  'approved_stops': [{'id': 'waterfall', 'name': 'Waterfall', 'quote': quote, 'source_url': 'https://park.test/visit'}]}
        self.assertEqual(len(approved_stops(packet)), 1)
        unsupported = copy.deepcopy(packet)
        unsupported['approved_stops'][0]['name'] = 'Invented beach'
        with self.assertRaises(ValueError):
            approved_stops(unsupported)

if __name__ == '__main__':
    unittest.main()
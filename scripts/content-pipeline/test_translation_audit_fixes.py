"""Tests for the 2026-11 translation-audit fixes: dated text, publication gate, German templates."""
import importlib.util
import unittest
from pathlib import Path

from dated_text import clause_problems, drop_dated, drop_placeholder_sentences, has_year, placeholder_rule_a
from placeholder_gate import day_start_mismatches, find_blocked_text, publication_problems
from quoted_visit import clean, quoted_bundle

HERE = Path(__file__).parent


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class DatedTextTest(unittest.TestCase):
    def test_sentence_with_year_is_removed_without_marker(self):
        text = ('Folgefonna National Park is a national park in Vestland county, Norway. '
                'The national park was opened by Queen Sonja on 14 May 2005.')
        self.assertEqual(drop_dated(text), 'Folgefonna National Park is a national park in Vestland county, Norway.')
        self.assertNotIn('[dated source]', clean(text))

    def test_natura_2000_is_a_name_not_a_date(self):
        text = 'Eastern Vechtplassen is a Natura 2000 site, a site designated for nature conservation purposes.'
        self.assertFalse(has_year(text))
        self.assertEqual(drop_dated(text), text)

    def test_single_dated_sentence_keeps_first_clause_without_dangling_words(self):
        self.assertEqual(drop_dated('Őrség National Park is a Hungarian National Park established in 2002 with an area of 440 km2.'),
                         'Őrség National Park is a Hungarian National Park.')
        self.assertEqual(drop_dated('In 2012 a solar eclipse was visible.'), '')

    def test_abbreviations_do_not_split_sentences(self):
        self.assertEqual(drop_dated('Visit St. George first. It was founded in 2001. Then go on to the canyon rim.'),
                         'Visit St. George first. Then go on to the canyon rim.')

    def test_placeholder_sentences_match_sql_rule_a(self):
        self.assertEqual(drop_placeholder_sentences(
            'Látrabjarg ist ein Vorgebirge in Island. Es ist Europas größte Vogelklippe. In [datierter Quelle] war eine Sonnenfinsternis sichtbar.'),
            'Látrabjarg ist ein Vorgebirge in Island. Es ist Europas größte Vogelklippe.')
        self.assertEqual(drop_placeholder_sentences(
            'Salzburger Lungau et les Nockberge ont été classés réserve de biosphère par l\'UNESCO en juillet [source datée].'),
            'Salzburger Lungau et les Nockberge ont été classés réserve de biosphère par l\'UNESCO.')


class RuleAVersion2Test(unittest.TestCase):
    """Live preview 2026-11-21: v1 wrote these fragments; v2 must never write a fragment."""
    BROKEN_V1 = ['Dieser regionale Naturpark wurde am 26. Januar.',
                 'Breheimen National Park est un parc national qui.',
                 'Lomsdal-Visten Nationalpark ist ein norwegischer Nationalpark, der am 26. Juni.',
                 'With about 2,468 km2, it includes 138 communes since 1 January.',
                 'Salpausselkä Geopark a été accepté le 13 avril.',
                 'Der Marker Wadden ist ein künstliches Archipel, das im Markermeer.',
                 'The Regional Natural Park of the Ardennes is a regional natural park established on December.']

    def test_v1_fragments_fail_the_dangling_check(self):
        for text in self.BROKEN_V1:
            self.assertTrue(clause_problems(text.rstrip('.')), text)

    def test_cut_back_to_last_complete_clause(self):
        self.assertEqual(drop_placeholder_sentences(
            'Lomsdal-Visten Nationalpark ist ein norwegischer Nationalpark, der am 26. Juni [datiert Quelle] gegründet wurde.'),
            'Lomsdal-Visten Nationalpark ist ein norwegischer Nationalpark.')
        self.assertEqual(drop_placeholder_sentences(
            'Lomsdal–Visten National Park is a Norwegian national park that was established on 26 June [dated source].'),
            'Lomsdal–Visten National Park is a Norwegian national park.')

    def test_unresolved_is_left_unchanged(self):
        for text in ('Dieser regionale Naturpark wurde am 26. Januar [datiert Quelle] gegründet.',
                     'With about 2,468 km2, it includes 138 communes since 1 January [dated source] and 46,000 inhabitants.',
                     'Salpausselkä Geopark a été accepté le 13 avril [dated source].'):
            result, mode = placeholder_rule_a(text, 'tagline')
            self.assertEqual((result, mode), (text, 'unresolved'))

    def test_dated_opening_phrase_keeps_main_clause(self):
        self.assertEqual(drop_placeholder_sentences('Created in [dated source], it encompasses the country\'s largest lagoon complex.'),
                         "It encompasses the country's largest lagoon complex.")

    def test_german_verb_final_subordinate_clause_is_complete(self):
        self.assertEqual(clause_problems('Der Park wurde 1992 gegründet, obwohl De Wieden später hinzugefügt wurde'), [])


class QuotedVisitTest(unittest.TestCase):
    def test_no_seasonal_placeholder_in_new_bundles(self):
        url = 'https://example.org/park'
        text = 'Roe Valley Country Park has riverside woodland walks. It opened in 2004 after restoration.'
        packet = {'slug': 'roe-valley', 'sources': [{'url': url, 'kind': 'official', 'text': text, 'generation_excerpts': [text]}],
                  'approved_stops': [{'id': 'roe', 'name': 'Roe Valley Country Park', 'quote': text, 'source_url': url}]}
        bundle = quoted_bundle({'name': 'Roe Valley', 'slug': 'roe-valley', 'region': 'northern-ireland'}, packet)
        self.assertEqual(find_blocked_text(bundle), [])
        self.assertEqual(bundle['travel']['plan']['days'][0]['stops'][0]['detail'], 'Roe Valley Country Park has riverside woodland walks.')


class PublicationGateTest(unittest.TestCase):
    def test_every_marker_blocks_publication(self):
        destination = {'tagline': 'A park.', 'best_season': 'Check official seasonal information',
                       'travel_plan': {'days': [{'start': 'x', 'stops': [{'name': 'A', 'detail': 'Created in [dated source].'}]}]}}
        translations = [{'locale': 'de', 'fields': {'permitNote': 'Gegründet in [datierter Quelle].'}},
                        {'locale': 'fr', 'fields': {'tagline': 'Créé en [source datée].', 'days': []}},
                        {'locale': 'de', 'fields': {'tagline': 'Seit [datiert Quelle].'}}]
        problems = publication_problems(destination, translations)
        self.assertEqual(len(problems), 5)

    def test_clean_page_passes(self):
        self.assertEqual(publication_problems({'tagline': 'A park.', 'travel_plan': {'days': []}}, []), [])

    def test_wrong_day_start_place_is_reported(self):
        english = {'days': [{'start': 'Suggested: choose a daytime visit'}, {'start': 'Suggested: morning departure from Aare Gorge'},
                            {'start': 'Suggested: morning departure from Giessbach Falls'}]}
        german = {'days': [{'start': 'Vorschlag: …'}, {'start': 'Vorschlag: Abfahrt am Morgen ab Aare Gorge'},
                           {'start': 'Vorschlag: Abfahrt am Morgen ab Aare Gorge'}]}
        self.assertEqual(day_start_mismatches(english, german), [2])


class GermanTemplateTest(unittest.TestCase):
    def setUp(self):
        self.dach = load('audit_dach_test', 'audit-dach.py')

    def test_reviewed_wording_has_capitalised_nouns(self):
        note = self.dach.REVIEWED_DE['Check the official visitor information for WPRPLACE before departure. Entry, activity permissions and overnight accommodation are separate checks; the source excerpts below do not establish availability for your dates.']
        for word in ('Aktivitätsgenehmigungen', 'Quellenauszüge', 'Verfügbarkeit', 'Ihre Reisedaten'):
            self.assertIn(word, note)
        self.assertEqual(self.dach.REVIEWED_DE['Parking check'], 'Parken')

    def test_multiday_start_keeps_the_english_place(self):
        pattern, german = self.dach.TEMPLATE_DE[0]
        self.assertEqual(pattern.sub(german, 'Suggested: morning departure from Giessbach Falls'),
                         'Vorschlag: Abfahrt am Morgen ab Giessbach Falls')

    def test_meta_title_never_cuts_a_word(self):
        self.assertEqual(self.dach.fit_title('Bannau Brycheiniog (Brecon Beacons) National Park', ' – Reiseplan'),
                         'Bannau Brycheiniog (Brecon Beacons) National Park')


class TravelValidatorTest(unittest.TestCase):
    def test_natura_2000_allowed_but_years_and_markers_rejected(self):
        validate = load('travel_validate_test', 'generate-travel-content.py').validate
        day = {'title': 'Day', 'start': 'Suggested: 9 AM', 'driving': 'Allow 1 hour', 'note': 'Note',
               'stops': [{'name': 'Vechtplassen', 'detail': 'Eastern Vechtplassen is a Natura 2000 site for nature conservation.'}]}
        plan = {'days': [day], 'sources': [{'url': 'https://example.org'}],
                'intel': [{'kind': k, 'text': 'x' * 30} for k in ('parking', 'signal', 'fuel', 'timing', 'access')],
                'arrival': 'a' * 40, 'vehicle': 'v' * 40, 'goldenHour': 'g' * 40}
        item = {'plan': plan, 'headline': 'Check visitor access', 'reservation': 'r' * 170, 'source_url': 'https://example.org'}
        validate(item)
        day['stops'][0]['detail'] = 'It was opened in 2005 for visitors to the wetland.'
        with self.assertRaises(AssertionError):
            validate(item)
        day['stops'][0]['detail'] = 'It was opened in [dated source] for visitors.'
        with self.assertRaises(AssertionError):
            validate(item)


if __name__ == '__main__':
    unittest.main()

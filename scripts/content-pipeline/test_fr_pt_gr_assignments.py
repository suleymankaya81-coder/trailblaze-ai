import unittest
from combined_content import module

assignment = module('assignment_tests','assign-fr-pt-gr.py')
recovery = module('recovery_tests','recover-fr-pt-gr.py')

class AssignmentsTests(unittest.TestCase):
    def test_original_42_holds_are_not_lost(self):
        rows=assignment.scope()
        self.assertEqual(sum(r['assignment_group']=='original_hold' for r in rows.values()),42)

    def test_all_french_inventory_identities_tracked(self):
        rows=assignment.scope()
        self.assertEqual(sum(r['assignment_group']=='fr_inventory' for r in rows.values()),32)
        self.assertEqual(rows['baie-de-somme']['merge_into'],'baie-de-somme-picardie-maritime')

    def test_official_quote_must_be_verbatim(self):
        with self.assertRaises(ValueError):
            recovery.reviewed_source({'url':'https://example.org','text':'closed','quote':'open'})

    def test_season_requires_an_explicit_source(self):
        item={'payload':{'best_season':'unknown'}}
        self.assertFalse(recovery.apply_season(item,{}))
        self.assertEqual(item['payload']['best_season'],'unknown')
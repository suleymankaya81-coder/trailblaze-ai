import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
FIXES = Path(__file__).resolve().parent
EXISTING = {
    'haagse-bos', 'midden-delfland', 'parco-naturale-regionale-bosco-incoronata',
    'parco-naturale-regionale-del-vulture', 'valaste-waterfall', 'leka',
    'mors-and-hanklit', 'naturpark-nissum-fjord', 'breheimen-national-park', 'bulbjerg',
}
ADDED = {
    'aspromonte-national-park', 'faerder', 'lycklamabos', 'waterloopbos',
    'lake-peipus', 'lammijarv', 'jostedalsbreen-national-park', 'nigardsbreen',
    'lierne-national-park',
}


def exclusions(path):
    sql = path.read_text()
    match = re.search(r'function\s+translation_fix\.needs_human_slugs\(\).*?\$\$(.*?)\$\$', sql, re.I | re.S)
    if match is None:
        raise AssertionError('Missing exclusion function')
    return re.findall(r"'([^']+)'", match.group(1))


class NeedsHumanExclusionsTest(unittest.TestCase):
    def test_original_ten_remain(self):
        self.assertTrue(EXISTING.issubset(exclusions(FIXES / '01c-helper-rule-a-quality.sql')))

    def test_each_approved_addition_is_excluded(self):
        values = exclusions(FIXES / '01c-helper-rule-a-quality.sql')
        for slug in sorted(ADDED):
            with self.subTest(slug=slug):
                self.assertIn(slug, values)
        self.assertEqual(len(values), 19)
        self.assertEqual(set(values), EXISTING | ADDED)

    def test_migration_installs_the_same_nineteen(self):
        values = exclusions(ROOT / 'drizzle/migrations/0031_extend_rule_a_needs_human_slugs.sql')
        self.assertEqual(len(values), 19)
        self.assertEqual(set(values), EXISTING | ADDED)


if __name__ == '__main__':
    unittest.main()
import unittest
from quoted_visit import quoted_bundle

class QuotedVisitTest(unittest.TestCase):
    def test_one_sourced_stop_without_model(self):
        url = 'https://example.org/park'
        text = 'Roe Valley Country Park has riverside woodland walks.'
        packet = {'slug':'roe-valley','sources':[{'url':url,'kind':'official','text':text,'generation_excerpts':[text]}],
            'approved_stops':[{'id':'roe','name':'Roe Valley Country Park','quote':text,'source_url':url}]}
        b = quoted_bundle({'name':'Roe Valley','slug':'roe-valley','region':'northern-ireland'},packet)
        self.assertEqual(len(b['travel']['plan']['days']),1)
        self.assertEqual(b['travel']['plan']['days'][0]['stops'][0]['detail'], text)
        self.assertIsNone(b['summary']['avg_daily_budget'])

if __name__ == '__main__': unittest.main()
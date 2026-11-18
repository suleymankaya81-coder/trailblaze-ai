import importlib.util,unittest
from pathlib import Path
from unittest.mock import patch
class HollandProductionTest(unittest.TestCase):
    def test_wrong_country_is_rejected(self):
        spec=importlib.util.spec_from_file_location('west_test',Path(__file__).parent/'west-europe/produce.py')
        m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        entity={'claims':{'P17':[{'mainsnak':{'datavalue':{'value':{'id':'Q30'}}}}]}}
        with patch.object(m.runner.fin,'fetch_article',return_value={'pageprops':{'wikibase_item':'Q1'}}),patch.object(m.runner.fin,'identity_and_packet',return_value=({}, {},'en',entity)):
            with self.assertRaisesRegex(ValueError,'another country'):m.runner._identity({'country':'nl','name':'Texel','enwiki':'Texel'},'nl')
if __name__=='__main__':unittest.main()
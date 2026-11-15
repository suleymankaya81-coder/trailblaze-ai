import unittest
from combined_content import module

facts = module('photo_identity_facts', 'prepare-wave.py')


class UkPhotoIdentity(unittest.TestCase):
    def test_oxford_island_rejects_new_zealand_and_oxford_city(self):
        self.assertFalse(facts.relevant_photo('oxford-island-national-nature-reserve', 'View from Mt Oxford, Canterbury, New Zealand.jpg'))
        self.assertFalse(facts.relevant_photo('oxford-island-national-nature-reserve', 'Osney Island, Oxford.jpg'))
        self.assertTrue(facts.relevant_photo('oxford-island-national-nature-reserve', 'Oxford Island Lough Neagh.jpg'))

    def test_roe_valley_rejects_kyrgyzstan(self):
        self.assertFalse(facts.relevant_photo('roe-valley-country-park', 'Kyrgyzstan Alpinism, Ala Archa National Park.jpg'))
        self.assertTrue(facts.relevant_photo('roe-valley-country-park', 'Weir in Roe Valley Country Park.jpg'))

    def test_cranborne_rejects_archaeological_objects(self):
        self.assertFalse(facts.relevant_photo('cranborne-chase-national-landscape', 'Cranborne chase stater (FindID 983439).jpg'))
        self.assertTrue(facts.relevant_photo('cranborne-chase-national-landscape', 'Cranborne Chase, Gore Clump.jpg'))

    def test_gower_rejects_other_mountain(self):
        self.assertFalse(facts.relevant_photo('gower-national-landscape', 'Widok sponad Wagi NW.jpg'))
        self.assertTrue(facts.relevant_photo('gower-national-landscape', 'Worms Head Gower Peninsula.jpg'))
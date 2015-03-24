import os
import unittest

from models import Characters
from models import Comics
from models import TvShow

class TestCase (unittest.TestCase) :
	def setUp (self) :
		pass
		# TODO configure everything
		# TODO create db
	
	def tearDown (self) :
		pass
		# TODO destroy db

	def test_Characters_1 (self) :
		character = Characters ("Captain America", "Some universe", "alias1, alias2", "Male", "power1, power2", "a description of the character", "A URL for the picture")
		assert (type(character) == Characters)

	def test_Comics_1 (self) :
		comic = Comics ("A comic", 4, "dec 1990", "some universe", "a description", 16)
		assert (type(comic) == Comics)

	def test_TvShows_1 (self) :
		tvShow = TvShows ("a tv show", "nov 1996", "a description for a tv show", 2, 15, "broadcast date")
		assert (type(tvShow) == TvShows)

if __name__ == '__main__' :
	unittest.main ()

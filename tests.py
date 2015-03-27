import os
import unittest

from config import db

from datetime import date

from models import Characters
from models import Comics
from models import TvShows
from sqlalchemy.exc import IntegrityError

class TestCase (unittest.TestCase) :
	def setUp (self) :
		db.create_all ()
	
	def tearDown (self) :
		db.session.remove ()
		db.drop_all ()
		

	##############
	# CHARACTERS
	##############
	def test_Characters_1 (self) :
		character = Characters ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		assert (type(character) == Characters)

	def test_Characters_2 (self) :
		character = Characters ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		db.session.add (character)
		db.session.commit ()
		characters = Characters.query.all ()
		assert (characters[0] == character)

		db.session.delete (character)
		db.session.commit ()
		characters = Characters.query.all ()
		assert (len(characters) == 0)

	def test_Characters_3 (self) :
		character1 = Characters ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		character2 = Characters ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		
		try :
			db.session.add (character1)
			db.session.add (character2)
			db.session.commit ()
		except IntegrityError:
			pass
		finally :
			db.session.rollback ()

		characters = Characters.query.all ()
		assert (len(characters) == 0)


	##########
	# COMICS
	##########
	def test_Comics_1 (self) :
		comic = Comics ("name", 1, date (1,1,1), "universe", "description", 10)
		assert (type(comic) == Comics)

	def test_Comics_2 (self) :
		comic = Comics ("name", 1, date (1,1,1), "universe", "description", 10)
		db.session.add (comic)
		db.session.commit ()
		comics = Comics.query.all ()
		assert (comics[0] == comic)

		db.session.delete (comic)
		db.session.commit ()
		comics = Comics.query.all ()
		assert (len(comics) == 0)

	def test_Comics_3 (self) :
		comic1 = Comics ("name", 1, date (1,1,1), "universe", "description", 10)
		comic2 = Comics ("name", 1, date (1,1,1), "universe", "description", 10)

		try :
			db.session.add (comic1)
			db.session.add (comic2)
			db.session.commit ()
		except IntegrityError:
			pass
		finally :
			db.session.rollback ()

		comics = Comics.query.all ()
		assert (len(comics) == 0)


	############
	# TV Shows
	############
	def test_TvShows_1 (self) :
		tvShow = TvShows ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		assert (type(tvShow) == TvShows)

	def test_TvShows_2 (self) :
		tvShow = TvShows ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		db.session.add (tvShow)
		db.session.commit ()
		tvShows = TvShows.query.all ()
		assert (tvShows[0] == tvShow)

		db.session.delete (tvShow)
		db.session.commit ()
		tvShows = TvShows.query.all ()
		assert (len(tvShows) == 0)

	def test_TvShows_3 (self) :
		tvShow1 = TvShows ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		tvShow2 = TvShows ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")

		try :
			db.session.add (tvShow1)
			db.session.add (tvShow2)
			db.session.commit ()
		except IntegrityError:
			pass
		finally :
			db.session.rollback ()

		tvShows = TvShows.query.all ()
		assert (len(tvShows) == 0)

if __name__ == '__main__' :
	unittest.main ()

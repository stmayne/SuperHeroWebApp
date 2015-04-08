import os
import unittest

from config import db

from datetime import date

from models import Character, Comic, TvShow, CharacterTvShowXRef, CharacterComicXRef
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
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		assert (type(character) == Character)

	def test_Characters_2 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		db.session.add (character)
		db.session.commit ()
		characters = Character.query.all ()
		assert (characters[0] == character)

		db.session.delete (character)
		db.session.commit ()
		characters = Character.query.all ()
		assert (len(characters) == 0)

	def test_Characters_3 (self) :
		character1 = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		character2 = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		
		try :
			db.session.add (character1)
			db.session.add (character2)
			db.session.commit ()
		except IntegrityError:
			pass
		finally :
			db.session.rollback ()

		characters = Character.query.all ()
		assert (len(characters) == 0)


	##########
	# COMICS
	##########
	def test_Comics_1 (self) :
		comic = Comic ("name", 1, date (1,1,1), "universe", "description", 10)
		assert (type(comic) == Comic)

	def test_Comics_2 (self) :
		comic = Comic ("name", 1, date (1,1,1), "universe", "description", 10)
		db.session.add (comic)
		db.session.commit ()
		comics = Comic.query.all ()
		assert (comics[0] == comic)

		db.session.delete (comic)
		db.session.commit ()
		comics = Comic.query.all ()
		assert (len(comics) == 0)

	def test_Comics_3 (self) :
		comic1 = Comic ("name", 1, date (1,1,1), "universe", "description", 10)
		comic2 = Comic ("name", 1, date (1,1,1), "universe", "description", 10)

		try :
			db.session.add (comic1)
			db.session.add (comic2)
			db.session.commit ()
		except IntegrityError:
			pass
		finally :
			db.session.rollback ()

		comics = Comic.query.all ()
		assert (len(comics) == 0)


	############
	# TV Shows
	############
	def test_TvShows_1 (self) :
		tvShow = TvShow ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		assert (type(tvShow) == TvShow)

	def test_TvShows_2 (self) :
		tvShow = TvShow ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		db.session.add (tvShow)
		db.session.commit ()
		tvShows = TvShow.query.all ()
		assert (tvShows[0] == tvShow)

		db.session.delete (tvShow)
		db.session.commit ()
		tvShows = TvShow.query.all ()
		assert (len(tvShows) == 0)

	def test_TvShows_3 (self) :
		tvShow1 = TvShow ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		tvShow2 = TvShow ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")

		try :
			db.session.add (tvShow1)
			db.session.add (tvShow2)
			db.session.commit ()
		except IntegrityError:
			pass
		finally :
			db.session.rollback ()

		tvShows = TvShow.query.all ()
		assert (len(tvShows) == 0)

	#######################
	# Characters X TV Shows
	#######################
	def test_CharactersXTvShows_1 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		tvshow = TvShow ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		db.session.add (character)
		db.session.add (tvshow)
		
		character = Character.query.filter_by (name=character.name).first ()
		tvshow = TvShow.query.filter_by (name=tvshow.name).first ()
		assert (character != None)
		assert (tvshow != None)

		xref = CharacterTvShowXRef (character.id, tvshow.id, "")
		db.session.add (xref)

		xref = CharacterTvShowXRef.query.filter_by (character_id=xref.character_id, tvshow_id=xref.tvshow_id)
		assert (xref != None)

		db.session.commit ()

	def test_CharactersXTvShows_2 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		tvshow = TvShow ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		db.session.add (character)
		db.session.add (tvshow)
		
		character = Character.query.filter_by (name=character.name).first ()
		tvshow = TvShow.query.filter_by (name=tvshow.name).first ()

		xref = CharacterTvShowXRef (character.id, tvshow.id, "")
		db.session.add (xref)

		character = Character.query.filter_by (name=character.name).first ()
		tvshow = TvShow.query.filter_by (name=tvshow.name).first ()
		assert (len(character.tvshows) == 1)
		assert (len(tvshow.characters) == 1)

		db.session.commit ()


	def test_CharactersXTvShows_3 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		tvshow1 = TvShow ("name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		tvshow2 = TvShow ("another_name", "start <-> end", "universe", "description", 1, 10, "broadcast")
		db.session.add (character)
		db.session.add (tvshow1)
		db.session.add (tvshow2)
		
		character = Character.query.filter_by (name=character.name).first ()
		tvshow1 = TvShow.query.filter_by (name=tvshow1.name).first ()
		tvshow2 = TvShow.query.filter_by (name=tvshow2.name).first ()

		xref1 = CharacterTvShowXRef (character.id, tvshow1.id, "")
		xref2 = CharacterTvShowXRef (character.id, tvshow2.id, "")
		db.session.add (xref1)
		db.session.add (xref2)

		character = Character.query.filter_by (name=character.name).first ()
		tvshow1 = TvShow.query.filter_by (name=tvshow1.name).first ()
		tvshow2 = TvShow.query.filter_by (name=tvshow2.name).first ()

		assert (len(character.tvshows) == 2)
		assert (len(tvshow1.characters) == 1)
		assert (len(tvshow2.characters) == 1)

		db.session.commit ()


	#####################
	# Characters X Comics
	#####################
	def test_CharactersXComics_1 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		comic = Comic ("name", 1, date (1,1,1), "universe", "description", 10)
		db.session.add (character)
		db.session.add (comic)
		
		character = Character.query.filter_by (name=character.name).first ()
		comic = Comic.query.filter_by (name=comic.name).first ()
		assert (character != None)
		assert (comic != None)

		xref = CharacterComicXRef (character.id, comic.id, "")
		db.session.add (xref)

		xref = CharacterComicXRef.query.filter_by (character_id=xref.character_id, comic_id=xref.comic_id)
		assert (xref != None)

		db.session.commit ()

	def test_CharactersXTvComics_2 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		comic = Comic ("name", 1, date (1,1,1), "universe", "description", 10)
		db.session.add (character)
		db.session.add (comic)
		
		character = Character.query.filter_by (name=character.name).first ()
		comic = Comic.query.filter_by (name=comic.name).first ()

		xref = CharacterComicXRef (character.id, comic.id, "")
		db.session.add (xref)

		character = Character.query.filter_by (name=character.name).first ()
		comic = Comic.query.filter_by (name=comic.name).first ()
		assert (len(character.comics) == 1)
		assert (len(comic.characters) == 1)

		db.session.commit ()


	def test_CharactersXTvComics_3 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		comic1 = Comic ("name", 1, date (1,1,1), "universe", "description", 10)
		comic2 = Comic ("another_name", 1, date (1,1,1), "universe", "description", 10)

		db.session.add (character)
		db.session.add (comic1)
		db.session.add (comic2)
		
		character = Character.query.filter_by (name=character.name).first ()
		comic1 = Comic.query.filter_by (name=comic1.name).first ()
		comic2 = Comic.query.filter_by (name=comic2.name).first ()

		xref1 = CharacterComicXRef (character.id, comic1.id, "")
		xref2 = CharacterComicXRef (character.id, comic2.id, "")
		db.session.add (xref1)
		db.session.add (xref2)

		character = Character.query.filter_by (name=character.name).first ()
		comic1 = Comic.query.filter_by (name=comic1.name).first ()
		comic2 = Comic.query.filter_by (name=comic2.name).first ()

		assert (len(character.comics) == 2)
		assert (len(comic1.characters) == 1)
		assert (len(comic2.characters) == 1)

		db.session.commit ()


if __name__ == '__main__' :
	unittest.main ()

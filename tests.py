import os
import unittest

from config import db, app
import create_models

from datetime import date

from models import Character, Comic, TvShow, CharacterTvShowXRef, CharacterComicXRef
from sqlalchemy.exc import IntegrityError

import json
from app import getCharacterData, getComicData, getShowData, andSearch, orSearch

create_models.run ()

class APITestCase (unittest.TestCase) :
	def setUp(self):
		pass

	def tearDown(self):
		pass


	############
	# SEARCH
	############
	def test_andSearch_1 (self) :
		model = Character
		searchWords = ['Captain']
		results = andSearch(model, searchWords)
		assert (type(results) == list)
		assert (type(results[0]) == dict)

	def test_andSearch_2 (self) :
		model = Character
		searchWords = ['Captain', 'Amer']
		results = andSearch(model, searchWords)
		assert (results[0]['name'] == 'Captain America')

	def test_andSearch_3 (self) :
		model = Comic
		searchWords = ['Avenge']
		results = andSearch(model, searchWords)
		assert (results[0]['name'] == 'Avengers')

	def test_andSearch_4 (self) :
		model = Character
		searchWords = ['Avengers','Captain']
		results = orSearch(model, searchWords)
		assert (type(results) == list)
		assert (type(results[0]) == dict)

	def test_andSearch_5 (self) :
		model = Comic
		searchWords = ['Avengers','Captain']
		results = orSearch(model, searchWords)
		assert (results[0]['name'] == "Avengers")

	def test_andSearch_6 (self) :
		model = Character
		searchWords = ['Avengers','Captain']
		results = orSearch(model, searchWords)
		assert (results[0]['name'] == "Captain America")
		
	################
	# API CHARACTERS
	################
	def test_apiCharacters_1 (self) :
		tester = app.test_client(self)
		response = tester.get('/characters/1', content_type='application/json')
		self.assertEqual(response.status_code, 200)

		character = json.loads(response.data)
		assert(character["name"] == "Captain America")
		assert(character["id"] == 1)
		assert(character["universe"] == "Earth-616")
		assert(len(character) == 11)
		assert("aliases" in character)

	def test_apiCharacters_2 (self) :
		tester = app.test_client(self)
		response1 = tester.get('/characters/1', content_type='application/json')
		self.assertEqual(response1.status_code, 200)
		tester = app.test_client(self)
		response2 = tester.get('/characters/2', content_type='application/json')
		self.assertEqual(response2.status_code, 200)

		character1 = json.loads(response1.data)
		character2 = json.loads(response2.data)
		for key1 in character1:
			assert(key1 in character2)
		for key2 in character2:
			assert(key2 in character1)

	def test_apiCharacters_3 (self) :
		tester = app.test_client(self)
		response = tester.get('/characters/', content_type='application/json')
		self.assertEqual(response.status_code, 200)

		cDict = json.loads(response.data)
		assert(len(cDict) == 1)
		assert("Characters" in cDict)
		characters = cDict["Characters"]
		assert(len(characters)==10)
		assert(len(characters[0])==2)
		assert(characters[0]["name"] == "Captain America")


	############
	# API COMICS
	############
	def test_apiComics_1 (self) :
		tester = app.test_client(self)
		response = tester.get('/comics/1', content_type='application/json')
		self.assertEqual(response.status_code, 200)

		comic = json.loads(response.data)
		assert(comic["name"] == "Fantastic Four")
		assert(comic["id"] == 1)
		assert(comic["universe"] == "Earth-616")
		assert(len(comic) == 10)
		assert("issues" in comic)

	def test_apiComics_2 (self) :
		tester = app.test_client(self)
		response1 = tester.get('/comics/1', content_type='application/json')
		self.assertEqual(response1.status_code, 200)
		response2 = tester.get('/comics/2', content_type='application/json')
		self.assertEqual(response2.status_code, 200)

		comic1 = json.loads(response1.data)
		comic2 = json.loads(response2.data)
		for key1 in comic1:
			assert(key1 in comic2)
		for key2 in comic2:
			assert(key2 in comic1)

	def test_apiComics_3 (self) :
		tester = app.test_client(self)
		response = tester.get('/comics/', content_type='application/json')
		self.assertEqual(response.status_code, 200)

		cDict = json.loads(response.data)
		assert(len(cDict) == 1)
		assert("Comics" in cDict)
		comics = cDict["Comics"]
		assert(len(comics)==10)
		assert(len(comics[0])==2)
		assert(comics[0]["name"] == "Fantastic Four")


	###########
	# API SHOWS
	###########
	def test_apiShows_1 (self) :
		tester = app.test_client(self)
		response = tester.get('/shows/1', content_type='application/json')
		self.assertEqual(response.status_code, 200)

		comic = json.loads(response.data)
		assert(comic["name"] == "Agents of S.H.I.E.L.D.")
		assert(comic["id"] == 1)
		assert(comic["universe"] == "Earth-616")
		assert(len(comic) == 11)
		assert("episodes" in comic)

	def test_apiShows_2 (self) :
		tester = app.test_client(self)
		response1 = tester.get('/shows/1', content_type='application/json')
		self.assertEqual(response1.status_code, 200)
		response2 = tester.get('/shows/2', content_type='application/json')
		self.assertEqual(response2.status_code, 200)

		show1 = json.loads(response1.data)
		show2 = json.loads(response2.data)
		for key1 in show1:
			assert(key1 in show2)
		for key2 in show2:
			assert(key2 in show1)

	def test_apiShows_3 (self) :
		tester = app.test_client(self)
		response = tester.get('/shows/', content_type='application/json')
		self.assertEqual(response.status_code, 200)

		cDict = json.loads(response.data)
		assert(len(cDict) == 1)
		assert("Shows" in cDict)
		shows = cDict["Shows"]
		assert(len(shows)==10)
		assert(len(shows[0])==2)
		assert(shows[0]["name"] == "Agents of S.H.I.E.L.D.")


class TestCase (unittest.TestCase) :
	def setUp (self) :
		db.drop_all ()
		db.create_all ()
	
	def tearDown (self) :
		db.session.remove ()
		db.drop_all ()
		create_models.run ()
		

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
		comic = Comic ("name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")
		assert (type(comic) == Comic)

	def test_Comics_2 (self) :
		comic = Comic ("name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")
		db.session.add (comic)
		db.session.commit ()
		comics = Comic.query.all ()
		assert (comics[0] == comic)

		db.session.delete (comic)
		db.session.commit ()
		comics = Comic.query.all ()
		assert (len(comics) == 0)

	def test_Comics_3 (self) :
		comic1 = Comic ("name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")
		comic2 = Comic ("name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")

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
		tvShow = TvShow ("name", "start","end", "universe", "description", 1, 10, "broadcast","picture")
		assert (type(tvShow) == TvShow)

	def test_TvShows_2 (self) :
		tvShow = TvShow ("name", "start","end", "universe", "description", 1, 10, "broadcast","picture")
		db.session.add (tvShow)
		db.session.commit ()
		tvShows = TvShow.query.all ()
		assert (tvShows[0] == tvShow)

		db.session.delete (tvShow)
		db.session.commit ()
		tvShows = TvShow.query.all ()
		assert (len(tvShows) == 0)

	def test_TvShows_3 (self) :
		tvShow1 = TvShow ("name", "start","end", "universe", "description", 1, 10, "broadcast","picture")
		tvShow2 = TvShow ("name", "start","end", "universe", "description", 1, 10, "broadcast","picture")

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
		tvshow = TvShow ("name", "start","end", "universe", "description", 1, 10, "broadcast","picture")
		db.session.add (character)
		db.session.add (tvshow)
		db.session.commit ()
		
		character = Character.query.filter_by (name=character.name).first ()
		tvshow = TvShow.query.filter_by (name=tvshow.name).first ()
		assert (character != None)
		assert (tvshow != None)

		xref = CharacterTvShowXRef (character.id, tvshow.id, "")
		db.session.add (xref)
		db.session.commit ()

		xref = CharacterTvShowXRef.query.filter_by (character_id=xref.character_id, tvshow_id=xref.tvshow_id)
		assert (xref != None)

		db.session.commit ()

	def test_CharactersXTvShows_2 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		tvshow = TvShow ("name", "start","end", "universe", "description", 1, 10, "broadcast","picture")
		db.session.add (character)
		db.session.add (tvshow)
		db.session.commit ()
		
		character = Character.query.filter_by (name=character.name).first ()
		tvshow = TvShow.query.filter_by (name=tvshow.name).first ()

		xref = CharacterTvShowXRef (character.id, tvshow.id, "")
		db.session.add (xref)
		db.session.commit ()

		character = Character.query.filter_by (name=character.name).first ()
		tvshow = TvShow.query.filter_by (name=tvshow.name).first ()
		assert (len(character.tvshows) == 1)
		assert (len(tvshow.characters) == 1)

		db.session.commit ()


	def test_CharactersXTvShows_3 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		tvshow1 = TvShow ("name", "start","end", "universe", "description", 1, 10, "broadcast","picture")
		tvshow2 = TvShow ("another_name", "start","end", "universe", "description", 1, 10, "broadcast","picture")
		db.session.add (character)
		db.session.add (tvshow1)
		db.session.add (tvshow2)
		db.session.commit ()
		
		character = Character.query.filter_by (name=character.name).first ()
		tvshow1 = TvShow.query.filter_by (name=tvshow1.name).first ()
		tvshow2 = TvShow.query.filter_by (name=tvshow2.name).first ()

		xref1 = CharacterTvShowXRef (character.id, tvshow1.id, "")
		xref2 = CharacterTvShowXRef (character.id, tvshow2.id, "")
		db.session.add (xref1)
		db.session.add (xref2)
		db.session.commit ()

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
		comic = Comic ("name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")
		db.session.add (character)
		db.session.add (comic)
		db.session.commit ()
		
		character = Character.query.filter_by (name=character.name).first ()
		comic = Comic.query.filter_by (name=comic.name).first ()
		assert (character != None)
		assert (comic != None)

		xref = CharacterComicXRef (character.id, comic.id, "")
		db.session.add (xref)
		db.session.commit ()

		xref = CharacterComicXRef.query.filter_by (character_id=xref.character_id, comic_id=xref.comic_id)
		assert (xref != None)

		db.session.commit ()

	def test_CharactersXTvComics_2 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		comic = Comic ("name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")
		db.session.add (character)
		db.session.add (comic)
		db.session.commit ()
		
		character = Character.query.filter_by (name=character.name).first ()
		comic = Comic.query.filter_by (name=comic.name).first ()

		xref = CharacterComicXRef (character.id, comic.id, "")
		db.session.add (xref)
		db.session.commit ()

		character = Character.query.filter_by (name=character.name).first ()
		comic = Comic.query.filter_by (name=comic.name).first ()
		assert (len(character.comics) == 1)
		assert (len(comic.characters) == 1)

		db.session.commit ()


	def test_CharactersXTvComics_3 (self) :
		character = Character ("name", "universe", "aliases", "alignment", "gender", "powers", "description", "picture")
		comic1 = Comic ("name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")
		comic2 = Comic ("another_name", 1, "1/1/1","1/1/1", "universe", "description", 10,"picture")

		db.session.add (character)
		db.session.add (comic1)
		db.session.add (comic2)
		db.session.commit ()

		character = Character.query.filter_by (name=character.name).first ()
		comic1 = Comic.query.filter_by (name=comic1.name).first ()
		comic2 = Comic.query.filter_by (name=comic2.name).first ()

		xref1 = CharacterComicXRef (character.id, comic1.id, "")
		xref2 = CharacterComicXRef (character.id, comic2.id, "")
		db.session.add (xref1)
		db.session.add (xref2)
		db.session.commit ()

		character = Character.query.filter_by (name=character.name).first ()
		comic1 = Comic.query.filter_by (name=comic1.name).first ()
		comic2 = Comic.query.filter_by (name=comic2.name).first ()

		assert (len(character.comics) == 2)
		assert (len(comic1.characters) == 1)
		assert (len(comic2.characters) == 1)

		db.session.commit ()

if __name__ == '__main__' :
	unittest.main ()

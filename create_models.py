from config import db
from models import Character, Comic, TvShow, CharacterComicXRef, CharacterTvShowXRef

import datetime
import json

def create_models (data, creators) :
	for data_set in data :
		for data_type_key, data_type_objects in data_set.items () :
			creator = creators[data_type_key]
			for obj in data_type_objects :
				entry = creator (obj)
				db.session.add (entry)
				db.session.commit ()

# name, universe, aliases, alignment, gender, powers, description, picture
def create_character (data) :
	return Character (
		data['name'],
		data['universe'],
		data['aliases'],
		data['alignment'],
		data['gender'],
		data['powers'],
		data['description'],
		data['picture']
	)

# name, volume, pubdate, universe, description, nuissues
def create_comic (data) :
	return Comic (
		data['name'],
		int (data['volumes']),
		data['pubstart'],
		data['pubend'],
		data['universe'],
		data['description'],
		int (data['issues'])
	)

# name, date, universe, description, nuseasons, nuepisodes, broadcast
def create_tvshow (data) :
	return TvShow (
		data['name'],
		data['startdate'],
		data['enddate'],
		data['universe'],
		data['description'],
		int (data['seasons']),
		int (data['episodes']),
		data['broadcaster']
	)

def create_character_x_comic (data) :
	character = Character.query.filter_by (name=data['character_name']).first ()
	comic = Comic.query.filter_by (name=data['comic_name']).first ()

	assert (comic != None)
	assert (character != None)

	xref = CharacterComicXRef (character.id, comic.id, data['description'])
	return xref


def create_character_x_tvshow (data) :
	character = Character.query.filter_by (name=data['character_name']).first ()
	tvshow = TvShow.query.filter_by (name=data['tvshow_name']).first ()

	assert (character != None)
	assert (tvshow != None)

	xref = CharacterTvShowXRef (character.id, tvshow.id, data['description'])
	return xref

def run () :
	db.drop_all ()
	db.create_all ()

	creators = {
		'Characters' : create_character,
		'Comics' : create_comic,
		'Shows' : create_tvshow,
		'CharactersXComics' : create_character_x_comic,
		'CharactersXTvShows' : create_character_x_tvshow
	}

	with open('Data.json') as data_file:
		data = json.load(data_file)
		create_models (data, creators)

if __name__ == '__main__' :
	run ()
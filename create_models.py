from config import db
from models import Character, Comic, TvShow

import datetime
import json

def create_models (data, creators) :
	for data_key in data :
		creator = creators[data_key]
		for id_key in data[data_key] :
			entry = creator (data[data_key][id_key])
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
		datetime.date.today (),
		data['universe'],
		data['description'],
		int (data['issues'])
	)

# name, date, universe, description, nuseasons, nuepisodes, broadcast
def create_tvshow (data) :
	return TvShow (
		data['name'],
		data['date'],
		data['universe'],
		data['description'],
		int (data['seasons']),
		int (data['episodes']),
		data['broadcaster']
	)

def run () :
	db.drop_all ()
	db.create_all ()

	creators = {
		'Characters' : create_character,
		'Comics' : create_comic,
		'Shows' : create_tvshow
	}

	with open('Data.json') as data_file:
		data = json.load(data_file)
		create_models (data, creators)

if __name__ == '__main__' :
	run ()
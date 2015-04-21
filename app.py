from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
import traceback
import subprocess

import json
import urllib
from difflib import SequenceMatcher
import re

from config import app

import models
import create_models

imageNotFound = "https://browshot.com/static/images/not-found.png"

#html
@app.route('/')
def get():
	return render_template('index.html')

@app.route('/directory/')
def getDirectory():
	data = dict(dict(json.loads(getComicData().data), **json.loads(getShowData().data)), **json.loads(getCharacterData().data))
	return render_template('directory.html', **data)

@app.route('/about/')
def getAbout():
	return render_template('AboutUs.html')

@app.route('/test/')
def getTestOutput():
	proc = subprocess.Popen(['python', 'tests.py', '-v'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
	return proc.communicate()[0].replace("\n", "<br>")

@app.route('/search')
def getSearch():
	searchString = request.args.get('search')
	if searchString is None:
		return
	searchWords = re.split('\W+', searchString)

	if len(searchWords) > 1:
		andResults = {'Characters':andSearch(models.Character, searchWords), 'TvShows':andSearch(models.TvShow, searchWords), 'Comics':andSearch(models.Comic, searchWords)}
		orResults = {'Characters':orSearch(models.Character, searchWords), 'TvShows':orSearch(models.TvShow, searchWords), 'Comics':orSearch(models.Comic, searchWords)}
		results = {'isMultiword':True, 'andResults':andResults, 'orResults':orResults}
	else:
		results = {'Characters':andSearch(models.Character, searchWords), 'TvShows':andSearch(models.TvShow, searchWords), 'Comics':andSearch(models.Comic, searchWords)}
		results = {'isMultiword':False, 'results':results}

	return render_template('search.html', results=results)

def andSearch(model, searchWords):
	andQuery = model.query
	for s in searchWords:
		andQuery = andQuery.filter(model.name.ilike('%'+s+'%'))
	return [modelToListDict(andResult) for andResult in andQuery.all()]

def orSearch(model, searchWords):
	orQuery = model.query
	orResultSet = set()
	for s in searchWords:
		orResultSet.update(orQuery.filter(model.name.ilike('%'+s+'%')).all())
	return [modelToListDict(orResult) for orResult in orResultSet]

@app.route('/banana-fish/')
def getBananaFish():
	#get the list of characters
	characters = json.loads(getCharacterData().data)

	#get the list of video games
	response = urllib.urlopen("http://23.253.89.46:5000/api/v1/games/");
	videoGames = json.loads(response.read())

	mapping = {}

	#for each character, map to the most related video game
	for c in characters['Characters'] :
		character = json.loads(getCharacterData(c['id']).data)
		maxRelated = 0
		for videoGame in videoGames['games'] :
			if not videoGame.get('name') or not videoGame.get('image') or videoGame['game_id'] == 1:
				continue

			cName = character['name']
			vgName = videoGame['name']

			#get the similarity
			relation = SequenceMatcher(None, cName, vgName).ratio()

			if relation > maxRelated :
				maxRelated = relation
				mapping[character['name']] = {'videoGameName':videoGame['name'], 'videoGameImage':videoGame['image'], 'videoGameLink':"http://23.253.89.46:3000/#/games/profile/"+str(videoGame['game_id']), 'characterImage':character['picture'], 'characterLink':"http://superheroes-idb.tk/character/"+str(character['id'])}

	return render_template('banana-fish.html', mapping=mapping)

@app.route('/comic/<comic_id>')
def getComic(comic_id):
	return render_template('comic.html', **json.loads(getComicData(comic_id).data))

@app.route('/show/<show_id>')
def getShow(show_id):
	return render_template('show.html', **json.loads(getShowData(show_id).data))

@app.route('/character/<character_id>')
def getCharacter(character_id):
	return render_template('character.html', **json.loads(getCharacterData(character_id).data))

#json (public API)
@app.route('/comics/')
@app.route('/comics/<comic_id>')
def getComicData(comic_id=None):
	if comic_id == None :
		comics = models.Comic.query.all()
		comicsData = {'Comics':tuple(modelToListDict(comic) for comic in comics)}
		return jsonify(**comicsData)

	comic = models.Comic.query.get(int(comic_id))
	if comic != None :
		comicData = modelToDict(comic)
		characters = [{ "id":str(relation.character_id), "name":relation.Characters.name } for relation in comic.characters]
		comicData["characters"] = characters
		return jsonify(**comicData)

	else :
		return ""

@app.route('/shows/')
@app.route('/shows/<show_id>')
def getShowData(show_id=None):
	if show_id == None :
		shows = models.TvShow.query.all()
		showsData = {'Shows':tuple(modelToListDict(show) for show in shows)}
		return jsonify(**showsData)

	show = models.TvShow.query.get(int(show_id))
	if show != None :
		showData = modelToDict(show)
		characters = [{"type":"character", "id":str(relation.character_id), "name":relation.Characters.name} for relation in show.characters]
		showData["characters"] = characters
		return jsonify(**showData)

	else :
		return ""

@app.route('/characters/')
@app.route('/characters/<character_id>')
def getCharacterData(character_id=None):
	if character_id == None :
		characters = models.Character.query.all()
		charactersData = {'Characters':tuple(modelToListDict(character) for character in characters)}
		return jsonify(**charactersData)

	character = models.Character.query.get(int(character_id))
	if character != None :
		characterData = modelToDict(character)
		tvshows  = [{"id":str(relation.tvshow_id), "name":relation.tvshow.name} for relation in character.tvshows]
		comics = [{"id":str(relation.comic_id), "name":relation.comic.name} for relation in character.comics]
		characterData["shows"] = tvshows
		characterData['comics'] = comics
		return jsonify(**characterData)

	else :
		return ""

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

def modelToDict(model):
	res = {key:value for key, value in model.__dict__.items() if not key.startswith('_') and not callable(key)}

	if 'picture' not in res or res['picture'] == "" :
		res['picture'] = imageNotFound

	return res

def modelToListDict(model):
	return {"name":model.name, "id":str(model.id)}

#run Flask open to all IPs on port 80(requires root access)
if __name__ == '__main__':
	#create_models.run ()
	app.run(host='0.0.0.0', port=80, debug=True)

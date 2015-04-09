from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
import traceback

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
	comics = models.Comic.query.all()
	comicsData = tuple(modelToDict(comic) for comic in comics)

	shows = models.TvShow.query.all()
	showsData = tuple(modelToDict(show) for show in shows)

	characters = models.Character.query.all()
	charactersData = tuple(modelToDict(character) for character in characters)

	data = {"Characters":charactersData, "Shows":showsData, "Comics":comicsData}
	return render_template('directory.html', **data)

@app.route('/testDirectory/')
def getTestDirectory():
	comics = models.Comic.query.all()
	comicsData = tuple(modelToDict(comic) for comic in comics)

	shows = models.TvShow.query.all()
	showsData = tuple(modelToDict(show) for show in shows)

	characters = models.Character.query.all()
	charactersData = tuple(modelToDict(character) for character in characters)

	data = {"Characters":charactersData, "Shows":showsData, "Comics":comicsData}
	return jsonify(**data)

@app.route('/about/')
def getAbout():
	return render_template('AboutUs.html')

@app.route('/comic/<comic_id>')
def getComic(comic_id):
	comic = models.Comic.query.get(int(comic_id))
	comicData = modelToDict(comic)
	characters = [{ "id":str(relation.character_id), "name":relation.Characters.name } for relation in comic.characters]
	comicData["characters"] = characters
	return render_template('comic.html', **comicData)

@app.route('/show/<show_id>')
def getShow(show_id):
	show = models.TvShow.query.get(int(show_id))
	showData = modelToDict(show)
	characters = [{"type":"character", "id":str(relation.character_id), "name":relation.Characters.name} for relation in show.characters]
	showData["characters"] = characters
	return render_template('show.html', **showData)

@app.route('/character/<character_id>')
def getCharacter(character_id):
	character = models.Character.query.get(int(character_id))
	characterData = modelToDict(character)
	tvshows  = [{"id":str(relation.tvshow_id), "name":relation.tvshow.name} for relation in character.tvshows]
	comics = [{"id":str(relation.comic_id), "name":relation.comic.name} for relation in character.comics]
	characterData["shows"] = tvshows
	characterData['comics'] = comics
	return render_template('character.html', **characterData)

#json (public API)
@app.route('/comics/')
@app.route('/comics/<comic_id>')
def getComicData(comic_id=None):
	if comic_id == None :
		comics = models.Comic.query.all()
		comicsData = {'Comics':tuple(modelToDict(comic) for comic in comics)}
		#remove stuff
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
		showsData = {'Shows':tuple(modelToDict(show) for show in shows)}
		#remove stuff
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
		charactersData = {'Characters':tuple(modelToDict(character) for character in characters)}
		#remove stuff
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

def modelToDict(model):
	res = {key:value for key, value in model.__dict__.items() if not key.startswith('_') and not callable(key)}

	if 'picture' not in res or res['picture'] == "" :
		res['picture'] = imageNotFound

	return res

#run Flask open to all IPs on port 80(requires root access)
if __name__ == '__main__':
	#create_models.run ()
	app.run(host='0.0.0.0', port=80, debug=True)

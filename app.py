from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
import traceback

from config import app

import models
import create_models

import json

with open('Data.json') as json_data:
	data = json.load(json_data)

imageNotFound = "https://browshot.com/static/images/not-found.png"

#html
@app.route('/')
def get():
	return render_template('index.html')

@app.route('/directory/')
def getDirectory():
	return render_template('directory.html', **data)

@app.route('/about/')
def getAbout():
	return render_template('AboutUs.html')

@app.route('/comic/<comic_id>')
def getComic(comic_id):
	if data['Comics'][str(comic_id)]['picture'] == "" :
		data['Comics'][str(comic_id)]['picture'] = imageNotFound
	return render_template('comic.html', **data['Comics'][str(comic_id)])

@app.route('/show/<show_id>')
def getShow(show_id):
	if data['Shows'][str(show_id)]['picture'] == "" :
		data['Shows'][str(show_id)]['picture'] = imageNotFound
	return render_template('show.html', **data['Shows'][str(show_id)])

@app.route('/character/<character_id>')
def getCharacter(character_id):
	if data['Characters'][str(character_id)]['picture'] == "" :
		data['Characters'][str(character_id)]['picture'] = imageNotFound
	return render_template('character.html', **data['Characters'][str(character_id)])

#json
@app.route('/comics/')
@app.route('/comics/<comic_id>')
def getComicData(comic_id=None):
	if comic_id == None :
		return jsonify(**data['Comics'])
	elif comic_id in data['Comics'] :
		return jsonify(**data['Comics'][comic_id])
	else :
		return ""

@app.route('/shows/')
@app.route('/shows/<show_id>')
def getShowData(show_id=None):
	if show_id == None :
		return jsonify(**data['Shows'])
	elif show_id in data['Shows'] :
		return jsonify(**data['Shows'][show_id])
	else :
		return ""

@app.route('/characters/')
@app.route('/characters/<character_id>')
def getCharacterData(character_id=None):
	if character_id == None :
		return jsonify(**data['Characters'])
	elif character_id in data['Characters'] :
		return jsonify(**data['Characters'][character_id])
	else :
		return ""

#run Flask open to all IPs on port 80(requires root access)
if __name__ == '__main__':
	#create_models.run ()
	app.run(host='0.0.0.0', port=80, debug=True)

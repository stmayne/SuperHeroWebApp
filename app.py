from flask import Flask
from flask import render_template
from flask import request
import traceback

from config import app

from models import Characters
from models import Comics
from models import TvShows

@app.route('/')
def get():
    return render_template('index.html')

@app.route('/comic/<comic_id>')
def getComic(comic_id):
    return render_template('comic.html', comic_id=comic_id)

@app.route('/show/<show_id>')
def getShow(show_id):
    return render_template('show.html', show_id=show_id)

@app.route('/character/<character_id>')
def getCharacter(character_id):
    return render_template('character.html', character_id=character_id)

#run Flask open to all IPs on port 80(requires root access)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)

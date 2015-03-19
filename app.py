from flask import Flask
from flask import render_template
from flask import request
import traceback
app = Flask(__name__)

@app.route('/')
def get():
    return render_template('index.html')

@app.route('/comic/<comic_id>')
def getComic(comic_id):
    return render_template('comic.html', comic_id=comic_id)

@app.route('/tv_show/<tv_show_id>')
def getTVShow(tv_show_id):
    return render_template('tv_show.html', tv_show_id=tv_show_id)

@app.route('/character/<character_id>')
def getCharacter(character_id):
    return render_template('character.html', character_id=character_id)

#run Flask open to all IPs on port 80(requires root access)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from database import db_session

app = Flask(__name__)
#app.config['SQLACLHEMY_DATABASE_URI'] = 'postgresql://localhost/test'
#app.config['SQLALCHEMY_ECHO'] = True
#db = SQLAlchemy(app)
#db.create_all()

class Characters(db.Model):
	__tablename__ = "Characters"

	id = db.Column(db.Integer,primary_key = True)
	name = db.Column(db.String(80), unique=True)
	universe = db.Column(db.String(30))
	aliases = db.Column(db.String(150))
	alignment = db.Column(db.String(10))
	gender = db.Column(db.String(10))
	powers = db.Column(db.String(200))
	description = db.Column(db.String(500))
	picture = db.Column(db.String(100)) #Location?

	def __init__(self, name, unvierse,aliases,alignment,gender,powers, description, picture):
		self.name = name
		self.universe = universe
		self.aliases = aliases
		self.alignment = alignment
		self.gender = gender
		self.powers = powers
		self.description = description
		self.picture = picture
	def __repr__(self):
		return '<user %r>' % self.name

class Comics(db.Model):
	__tablename__ = "Comics"

	id = db.Column(db.Integer,primary_key = True)
	name = db.Column(db.String(80), unique=True)
	volume = db.Column(db.Integer)
	pubdate = db.Column(db.Date)
	universe = db.Column(db.String(30))
	description = db.Column(db.String(500))
	nuissues = db.Column(db.Integer)
	

	def __init__(self, name, volume,pubdate,universe,description,nuissues):
		self.name = name
		self.volume = volume
		self.pubdate = pubdate
		self.universe = universe
		self.description = description
		self.nuisses = nuisses
	def __repr__(self):
		return '<user %r>' % self.name

class TvShows(db.Model):
	__tablename__ = "TvShows"

	id = db.Column(db.Integer,primary_key = True)
	name = db.Column(db.String(80), unique=True)
	date = db.Column(db.String(100))
	universe = db.Column(db.String(30)))
	description = db.Column(db.String(500))
	nuseasons = db.Column(db.Integer)
	nuepisodes = db.Column(db.Integer)
	broadcast = db.Column(db.String(40))
	

	def __init__(self, name, date, universe, description, nuseasons, nuepisodes, broadcast):
		self.name = name
		self.date = date
		self.universe = universe
		self.description = description
		self.nuseasons = nuseasons
		self.nuepisodes = nuepisodes
		self.broadcast = broadcast
		
	def __repr__(self):
		return '<user %r>' % self.name
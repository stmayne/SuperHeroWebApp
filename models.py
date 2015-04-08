from config import db
"""
How to create a an association
http://docs.sqlalchemy.org/en/latest/orm/basic_relationships.html#many-to-many

# create parent, append a child via association
p = Characters()
a = comicsAssociation(description = <data>)
a.child() = Comics()
p.comics.append(a)

# iterate through child objects via association, including association
# attributes
for assoc in p.comics:
    print assoc.description
    print assoc.comic
"""

class CharacterTvShowXRef(db.Model):
	"""
	Association object for tvshows to characters
	"""
	__tablename__ = "CHARACTERS_TVSHOWS_XREF"
	character_id = db.Column(db.Integer,db.ForeignKey('CHARACTERS.id'),primary_key = True)
	tvshow_id = db.Column(db.Integer,db.ForeignKey('TVSHOWS.id'),primary_key = True)
	description = db.Column(db.String(200))
	tvshow = db.relationship("TvShow", backref = "CharacterTvShowXRef")

	def __init__ (self, character_id, tvshow_id, description) :
		self.character_id = character_id
		self.tvshow_id = tvshow_id
		self.description = description

class CharacterComicXRef(db.Model):
	"""
	Association object for tvshows to characters
	"""
	__tablename__ = "CHARACTERS_COMICS_XREF"
	character_id = db.Column(db.Integer,db.ForeignKey('CHARACTERS.id'),primary_key = True)
	comic_id = db.Column(db.Integer,db.ForeignKey('COMICS.id'),primary_key = True)
	description = db.Column(db.String(200))
	comic = db.relationship("Comic", backref = "CharacterComicXRef")

	def __init__ (self, character_id, comic_id, description) :
		self.character_id = character_id
		self.comic_id = comic_id
		self.description = description

class Character(db.Model):
	"""
	A model representing a superhero, villain, or other character
	"""
	__tablename__ = "CHARACTERS"

	id = db.Column(db.Integer,primary_key = True)
	name = db.Column(db.String(80), unique=True)
	universe = db.Column(db.String(30))
	aliases = db.Column(db.String(150))
	alignment = db.Column(db.String(10))
	gender = db.Column(db.String(10))
	powers = db.Column(db.String(200))
	description = db.Column(db.String(10000))
	picture = db.Column(db.String(100)) #Location?
	tvshows = db.relationship("CharacterTvShowXRef", backref = db.backref("Characters"))
	comics = db.relationship("CharacterComicXRef", backref = db.backref("Characters"))

	def __init__(self, name, universe, aliases, alignment, gender, powers, description, picture):
		"""
		Initializes a character model with the following arguments
		name the name of the character
		universe the universe the character exist in
		aliases any other names the character goes by
		alignment what side the character is on
		gender the gender of the character
		powers what special powers the character has
		description a description of the character
		picture a URL to the characters picture
		"""
		self.name = name
		self.universe = universe
		self.aliases = aliases
		self.alignment = alignment
		self.gender = gender
		self.powers = powers
		self.description = description
		self.picture = picture

	def __repr__(self):
		"""
		returns a string containing a printable representation of the character (i.e. it's name)
		"""
		return '<user %r>' % self.name

class Comic(db.Model):
	"""
	A model representing a comic
	"""
	__tablename__ = "COMICS"

	id = db.Column(db.Integer,primary_key = True)
	name = db.Column(db.String(80), unique=True)
	volume = db.Column(db.Integer)
	pubdate = db.Column(db.Date)
	universe = db.Column(db.String(30))
	description = db.Column(db.String(10000))
	nuissues = db.Column(db.Integer)
	

	def __init__(self, name, volume, pubdate, universe, description, nuissues):
		"""
		Initializes a comic model with the following arguments
		name the name of the comic
		volume the comic's volume number
		pubdate the date the comic was published
		universe the universe the comic takes place in
		description a description of the comic
		nuissues the number of issues
		"""
		self.name = name
		self.volume = volume
		self.pubdate = pubdate
		self.universe = universe
		self.description = description
		self.nuissues = nuissues
	def __repr__(self):
		"""
		returns a string containing a printable representation of the comic (i.e. it's name)
		"""
		return '<user %r>' % self.name

class TvShow(db.Model):
	"""
	A model representing a TV show
	"""
	__tablename__ = "TVSHOWS"

	id = db.Column(db.Integer,primary_key = True)
	name = db.Column(db.String(80), unique=True)
	date = db.Column(db.String(100))
	universe = db.Column(db.String(30))
	description = db.Column(db.String(10000))
	nuseasons = db.Column(db.Integer)
	nuepisodes = db.Column(db.Integer)
	broadcast = db.Column(db.String(40))
	

	def __init__(self, name, date, universe, description, nuseasons, nuepisodes, broadcast):
		"""
		Initializes a TV show model with the following arguments
		name the name of the show
		date when the show aired
		universe the universe the show takes place in
		description a description of the show
		nuseasons the number of seasons of the show
		nuepisodes the number of episodes of the show
		broadcast when the show was broadcast
		"""
		self.name = name
		self.date = date
		self.universe = universe
		self.description = description
		self.nuseasons = nuseasons
		self.nuepisodes = nuepisodes
		self.broadcast = broadcast
		
	def __repr__(self):
		"""
		returns a string containing a printable representation of the show (i.e. it's name)
		"""
		return '<user %r>' % self.name

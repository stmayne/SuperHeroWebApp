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
	tvshow = db.relationship("TvShow", backref = "characters")

	def __init__ (self, character_id, tvshow_id, description) :
		"""
		Initializes a CharacterTvShowXRef model with the following arguments
		character_id the id of the character
		tvshow_id the id of the show
		description an explaination of the relationship between the two
		"""
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
	comic = db.relationship("Comic", backref = "characters")

	def __init__ (self, character_id, comic_id, description) :
		"""
		Initializes a CharacterComicXRef model with the following arguments
		character_id the id of the character
		comic_id the id of the comic
		description an explaination of the relationship between the two
		"""
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
	aliases = db.Column(db.PickleType)
	alignment = db.Column(db.String(10))
	gender = db.Column(db.String(10))
	powers = db.Column(db.PickleType)
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
	volumes = db.Column(db.Integer)
	pubstart = db.Column(db.String(30))
	pubend = db.Column(db.String(30))
	universe = db.Column(db.String(30))
	description = db.Column(db.String(10000))
	issues = db.Column(db.Integer)
	picture = db.Column(db.String(100))
	

	def __init__(self, name, volumes, pubstart, pubend, universe, description, issues, picture):
		"""
		Initializes a comic model with the following arguments
		name the name of the comic
		volume the comic's volume number
		pubstart the date the comic was published
		pubend the date the comic stopped being published
		universe the universe the comic takes place in
		description a description of the comic
		issues the number of issues
		picture a URL to a picture of the comic
		"""
		self.name = name
		self.volumes = volumes
		self.pubstart = pubstart
		self.pubend = pubend
		self.universe = universe
		self.description = description
		self.issues = issues
		self.picture = picture
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
	startdate = db.Column(db.String(30))
	enddate = db.Column(db.String(30))
	universe = db.Column(db.String(30))
	description = db.Column(db.String(10000))
	seasons = db.Column(db.Integer)
	episodes = db.Column(db.Integer)
	broadcaster = db.Column(db.String(40))
	picture = db.Column(db.String(100))

	

	def __init__(self, name, startdate, enddate, universe, description, seasons, episodes, broadcaster, picture):
		"""
		Initializes a TV show model with the following arguments
		name the name of the show
		startdate when the show aired
		enddate when the show stopped airing
		universe the universe the show takes place in
		description a description of the show
		seasons the number of seasons of the show
		episodes the number of episodes of the show
		broadcaster the network the show was broadcast on
		picture a URL to a picture of the show
		"""
		self.name = name
		self.startdate = startdate
		self.enddate = enddate
		self.universe = universe
		self.description = description
		self.seasons = seasons
		self.episodes = episodes
		self.broadcaster = broadcaster
		self.picture = picture
		
	def __repr__(self):
		"""
		returns a string containing a printable representation of the show (i.e. it's name)
		"""
		return '<user %r>' % self.name

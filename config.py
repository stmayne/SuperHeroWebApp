from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app = Flask(__name__)
app.config['SQLACLHEMY_DATABASE_URI'] = 'postgresql://localhost/test'
app.config['SQLALCHEMY_ECHO'] = False
db = SQLAlchemy(app)
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/test'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost/test'
app.config['SQLALCHEMY_ECHO'] = False
db = SQLAlchemy(app)


import ConfigParser
import os
import inspect
import flask

app = flask.Flask(__name__)

from . import views

# get root directory
script_path = os.path.dirname(os.path.abspath(inspect.getframeinfo(inspect.currentframe()).filename)) + "\\"

# read the configuration file
config = ConfigParser.RawConfigParser()
config.read(script_path + "notepanel.conf")

# secret for session cookie encryption
app.secret_key = config.get("session", "secret")

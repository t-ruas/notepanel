
import ConfigParser
import os
import inspect
import flask

from notepanel import app

# get root directory
script_path = os.path.dirname(os.path.abspath(inspect.getframeinfo(inspect.currentframe()).filename)) + "\\"

# read the configuration file
config = ConfigParser.RawConfigParser()
config.read(script_path + "notepanel.conf")

@app.route("/", methods=["GET"])
def main():
    return flask.render_template("panel.html")

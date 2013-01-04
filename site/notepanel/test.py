import flask

from . import app

#import services
#from services.userservice import *

'''
@app.route("/login", methods=["POST"])
def login():
    username = flask.request.form["username"]
    password = flask.request.form["password"]
    app.logger.debug("username = %s and password = %s" % (username, password))
    if  username == "" or password == "":
        return flask.jsonify(identified=False)
    else:
        # TODO: db check
        if UserService().login(username, password):        
            flask.session["username"] = flask.request.form["username"]
            return flask.jsonify(
                identified=True,
                username=flask.session["username"],
                email=None,
                id=None,
                boards=None)
        else:
            return flask.jsonify(identified=False)

@app.route("/logout", methods=["GET"])
def logout():
    #UserService().logout(flask.session["username"])
    flask.session.pop("username", None)
    return flask.render_template("panel.html")
'''



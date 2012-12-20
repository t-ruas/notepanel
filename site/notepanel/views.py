
import flask

from . import app

@app.route("/login", methods=["POST"])
def login():
    if flask.request.form["username"] == "":
        return flask.jsonify(identified=False)
    else:
        # TODO: db check
        flask.session["username"] = flask.request.form["username"]
        return flask.jsonify(
            identified=True,
            username=flask.session["username"],
            email=None,
            id=None,
            boards=None)

@app.route("/logout", methods=["GET"])
def logout():
    flask.session.pop("username", None)
    return flask.jsonify(identified=False)

@app.route("/identify", methods=["GET"])
def identify():
    # TODO: db select
    if "username" in flask.session:
        return flask.jsonify(
            identified=True,
            username=flask.session["username"],
            email=None,
            id=None,
            boards=None)
    else:
        return flask.jsonify(identified=False)

@app.route("/", methods=["GET"])
def index():
    return flask.render_template("panel.html")

import flask

from . import app


@app.route("/", methods=["GET"])
def index():
    return flask.render_template("panel.html")
    
@app.route("/login", methods=["POST"])
def login():
    return flask.jsonify(identified=True)

@app.route("/logout", methods=["GET"])
def logout():
    flask.session.pop("username", None)
    return flask.render_template("panel.html")

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

@app.route("/test", methods=["GET"])
def test():
    import os
    myvar = app.env 
    return flask.render_template('test.html', myvar=myvar)
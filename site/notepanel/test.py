import flask

from . import app


@app.route("/", methods=["GET"])
def index():
    return flask.render_template("panel.html")

@app.route("/test", methods=["GET"])
def test():
    import os
    if 'MYSQLCONNSTR_APP' in os.environ:
        envvar = 'WeAreInThecloud'
    else:
        envvar = 'WeAreInLocal'
    return flask.render_template('test.html', myvar=envvar)
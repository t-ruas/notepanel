import flask
import os
import logging
from data.services import UserService
from data import db
from . import app
from . import settings
from . import log_monitor
from utils import azure_logging
from datetime import datetime

logger = logging.getLogger("notepanel.views")

@app.route("/", methods=["GET"])
def index():
    return flask.render_template("panel.html")

@app.route("/login", methods=["POST"])
def login():
    session = db.Session()
    user = UserService().log(session, flask.request.form["username"], flask.request.form["password"])
    if user is not None:
        logger.debug("login ok : {0}/{1}".format(user.name, user.id))
        user.last_seen_date = datetime.now()
        session.commit()
        return flask.jsonify(
            identified=True,
            id=user.id,
            email=user.email,
            login=user.name,
            boards=None)
    logger.debug("login ko : {0}".format(flask.request.form["username"]))
    return flask.jsonify(identified=False)

@app.route("/register", methods=["POST"])
def register():
    logger.debug("register start : {0}/{1}/{2}".format(flask.request.form["username"], flask.request.form["email"], flask.request.form["password"]))
    session = db.Session()
    user = UserService().add(session, flask.request.form["username"], flask.request.form["email"], flask.request.form["password"])
    session.commit()
    if user is not None:
        logger.debug("register ok : {0}/{1}".format(user.name, user.id))
        return flask.jsonify(
            identified=True,
            id=user.id,
            email=user.email,
            login=user.name,
            boards=None)
    logger.debug("register ko")
    return flask.jsonify(identified=False)

@app.route("/logout", methods=["GET"])
def logout():
    logger.debug("logout ok")
    flask.session.pop("id", None)
    return flask.render_template("panel.html")

@app.route("/identify", methods=["GET"])
def identify():
    if "id" in flask.session:
        session = db.Session()
        user = UserService().get(session, flask.session["id"])
        if not user is None:
            logger.debug("identify ok : {0}/{1}".format(user.name, user.id))
            return flask.jsonify(
                identified=True,
                id=user.id,
                email=user.email,
                login=user.name,
                boards=None)
        else:
            logger.debug("identify ko : {0}".format(flask.session["id"]))
    else:
        logger.debug("identify ko")
    return flask.jsonify(identified=False)



@app.route("/test", methods=["GET"])
def test():
    import os
    if 'WeAreInTheCloud' in os.environ:  
        myvar = 'cloud' #ConfigurationManager.getCloudEnvironment()
    else:
        myvar = 'local'
    return flask.render_template('test.html', myvar=myvar)


# ================================================================
# admin

@app.route("/admin/login/<password>", methods=["GET"])
def admin_login(password):
    if password == settings["adminpwd"]:
        flask.session['is_admin'] = True
        return flask.redirect('/admin')
    else:
        flask.session['is_admin'] = True
        return "Not authorized", 401

@app.route("/admin/logout", methods=["GET"])
def admin_logout():
    flask.session.pop('is_admin', None)
    return flask.redirect('/admin')

@app.route("/admin", methods=["GET"])
def admin():
    if is_admin():
        return flask.render_template('admin.html')
    else:
        return "Not authorized", 401

def is_admin():
    return 'is_admin' in flask.session and flask.session['is_admin'] == True


# ================================================================
# log management

@app.route("/logs", methods=["GET"])
def logs():
    if is_admin():
        return flask.render_template('logs.html', logs=azure_logging.get_logs())
    else:
        return "Not authorized", 401 

@app.route("/logs/clear", methods=["GET"])
def logs_clear():
    if is_admin():
        azure_logging.clear_logs()
        return flask.redirect('/admin')
    else:
        return "Not authorized", 401

@app.route("/logs/init", methods=["GET"])
def logs_init():
    if is_admin():
        azure_logging.init_storage()
        return flask.redirect('/logs')
    else:
        return "Not authorized", 401 


# ================================================================
# log files  management

@app.route("/logs/copy/all", methods=["GET"])
def logs_copy_all():
    if is_admin():
        log_monitor.add_directory(os.path.join(app.root_path, 'logs'))
        az_file_monitor.copy_all()
        return flask.redirect('/admin')
    else:
        return "Not authorized", 401

@app.route("/logs/file/<logger>", methods=["GET"])
def logs_file(logger):
    if is_admin():
        log_service = LogService(account_name=app.settings["azaccount"], account_key=app.settings["azkey"])
        raw_log = log_service.getLogFileContent(logger)
        raw_log = raw_log.replace("\r\n", "<br />")
        html_log = raw_log.replace("\n", "<br />")
        return flask.render_template('logs_file.html', name=logger, log=html_log)
    else:
        return "Not authorized", 401

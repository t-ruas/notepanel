import flask
import os
import logging
from datetime import datetime
from threading  import Lock
from time import time
from . import app
from . import settings
from . import log_monitor
from data.services import UserService, BoardService
from data.model import User, Board
from data import db
from utils import azure_logging

logger = logging.getLogger("notepanel.views")

board_version_cache = {}
board_version_cache_lock = Lock()

@app.route("/", methods=["GET"])
def index():
    return flask.render_template("panel.html")

@app.route("/user/login", methods=["POST"])
def user_login():
    session = db.Session()
    user = UserService().log(session, flask.request.form["username"], flask.request.form["password"])
    board = BoardService().get_default(db.Session(), user)
    if user is not None:
        logger.debug("login ok : {0}/{1}".format(user.name, user.id))
        user.last_seen_date = datetime.now()
        session.commit()
        logged_user = User(id=user.id, email=user.email, name=user.name)
        logger.debug("logged_user : {0}/{1}".format(logged_user.name, logged_user.id))
        return flask.jsonify(
            identified=True,
            user=logged_user.to_dic(),
            board=board.to_dic())
    logger.debug("login ko : {0}".format(flask.request.form["username"]))
    return flask.jsonify(identified=False)

@app.route("/user/register", methods=["POST"])
def user_register():
    logger.debug("register start : {0}/{1}/{2}".format(flask.request.form["username"], flask.request.form["email"], flask.request.form["password"]))
    session = db.Session()
    user = UserService().add(session, flask.request.form["username"], flask.request.form["email"], flask.request.form["password"])
    session.commit()
    # TODO board = BoardService().add(db.Session(), name, user)
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

@app.route("/user/logout", methods=["GET"])
def user_logout():
    logger.debug("logout ok")
    flask.session.pop("id", None)
    return flask.render_template("panel.html")

@app.route("/user/identify", methods=["GET"])
def user_identify():
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


@app.route("/board/create", methods=["POST"])
def board_create():
    board_name = flask.request.form["boardname"]
    creator_id = flask.session["id"]
    board = BoardService().add(db.Session(), name, creator_id)
    return flask.jsonify(board=board.to_dic())

@app.route("/board/poll?board_id=<int:board_id>&version=<int:version>", methods=["GET"])
def board_poll(id, version):
    if id not in board_version_cache:
        with board_version_cache_lock:
            if id not in board_version_cache:
                board_version_cache[id] = {current_version: version})
    if board_version_cache[id].current_version < version:
        logger.warning("board_poll invalid version {0}".format(version))
    while board_version_cache[id].current_version == version:
        time.sleep(1)
    with board_version_cache_lock:
            board_version_cache[id].current_version == version
    return "changed!"

@app.route("/note/move?board_id=<int:board_id>", methods=["POST"])
def note_move():
    # TODO :
    # db update to move the note, only if it's in the right place
    # increment board version
    #...?

    with board_version_cache_lock:
        if board.id not in board_version_cache:
            last_version = version + 1
            # Create the manager if it doesn't already exist
            board_version_cache[board.id] = {version: version, })
        else:
        
    

@app.route("/test", methods=["GET"])
def test():
    import os
    if 'WeAreInTheCloud' in os.environ:  
        myvar = 'cloud'
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

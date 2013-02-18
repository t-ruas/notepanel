import flask
import os
import logging
from datetime import datetime
from functools import wraps
from . import app
from . import settings
from . import log_monitor
from data.services import UserService, BoardService
from data.model import User, Board, Note
from data import db
from utils import azure_logging

logger = logging.getLogger("notepanel.views")

# ================================================================
# default
@app.route("/", methods=["GET"])
def index():
    return flask.render_template("panel.html", services_url=settings["services_url"])
    
# ================================================================
# user services
@app.route("/login", methods=["POST"])
def login():
    user = UserService().get_by_log(session, flask.request.form["username"], flask.request.form["password"])
    if user is not None:
        logged_user = user
        flask.session['user'] = logged_user
        return flask.jsonify(
            identified=True,
            user=logged_user.to_dic(),
            boards=None)
    return flask.jsonify(identified=False)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_logged():
            return "Not authorized", 401
        return f(*args, **kwargs)
    return decorated_function

def is_logged():
    return 'user' in flask.session

@app.route("/register", methods=["POST"])
def register():
    user = UserService().add(flask.request.form["username"], flask.request.form["email"], flask.request.form["password"])
    # TODO board = BoardService().add(db.Session(), name, user)
    if user is not None:
        return flask.jsonify(
            identified=True,
            user = user.to_dic(),
            boards=None)
    return flask.jsonify(identified=False)

@app.route("/logout", methods=["GET"])
def logout():
    flask.session.pop("user", None)
    return flask.render_template("panel.html")


# ================================================================
# board services
@app.route("/board/<id>/users", methods=["GET"])
@login_required
def board_users(id):
    board_service = BoardService()
    session = db.Session()
    users = board_service.get_users(session, id)
    json_users = [];
    for user in users:
        json_users.append(user.to_dic()) 
    return flask.jsonify(boardUsers=json_users)

@app.route("/board/<board_id>/users/add/<user_name>/<user_group>", methods=["GET"])
@login_required
def board_users_add(board_id, user_name, user_group):    
    #session = db.Session()
    board = BoardService().add_user(board_id=board_id, user_name=user_name, user_group=user_group)
    json_users = [];
    for user in board.users:
        json_users.append(user.to_dic()) 
    return flask.jsonify(boardUsers=json_users)
    

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

def admin_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_admin():
            return "Not authorized", 401
        return f(*args, **kwargs)
    return decorated_function

def is_admin():
    return 'is_admin' in flask.session and flask.session['is_admin'] == True
    
@app.route("/test", methods=["GET"])
def test():
    #if is_admin():
    return flask.render_template('test.html')
    #else:
    #    return "Not authorized", 401

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

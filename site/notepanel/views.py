import flask
import os
import logging
from datetime import datetime
from . import app
from . import settings
from . import log_monitor
from data.services import UserService, BoardService
from data.model import User, Board, Note
from data import db
from utils import azure_logging

logger = logging.getLogger("notepanel.views")

# ================================================================

@app.route("/", methods=["GET"])
def index():
    return flask.render_template("panel.html", services_url=settings["services_url"])

# ================================================================
# board services
@app.route("/board/<id>/users", methods=["GET"])
def board_users(id):
    board_service = BoardService()
    session = db.Session()
    users = board_service.get_users(session, id)
    json_users = [];
    for user in users:
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

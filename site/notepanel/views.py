import flask
import os

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
    if 'WeAreInTheCloud' in os.environ:  
        myvar = 'cloud' #ConfigurationManager.getCloudEnvironment()
    else:
        myvar = 'local'
    return flask.render_template('test.html', myvar=myvar)
    

@app.route("/admin/login/<password>", methods=["GET"])
def admin_login(password):
    if password == app.env_conf.getSetting('adminpwd'):
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
    

# log management
from notepanel.services.logservice import LogService

@app.route("/logs", methods=["GET"])
def logs():
    if is_admin():        
        log_service = LogService(account_name=app.env_conf.getSetting('azaccount'), account_key=app.env_conf.getSetting('azkey'), debug=True)      
        logs = log_service.getLogs()
        return flask.render_template('logs.html', logs=logs)
    else:
        return "Not authorized", 401 
        
@app.route("/logs/clear", methods=["GET"])
def logs_clear():
    if is_admin():
        log_service = LogService(account_name=app.env_conf.getSetting('azaccount'), account_key=app.env_conf.getSetting('azkey'), debug=True)
        log_service.clearLogs()
        return flask.redirect('/admin')
    else:
        return "Not authorized", 401

@app.route("/logs/init", methods=["GET"])
def logs_init():
    if is_admin():
        log_service = LogService(account_name=app.env_conf.getSetting('azaccount'), account_key=app.env_conf.getSetting('azkey'), debug=True)
        log_service.initLogs()
        return flask.redirect('/logs')
    else:
        return "Not authorized", 401 

# log files  management
from notepanel.utils.azurefilemonitor import AzureFileMonitor

@app.route("/logs/copy/all", methods=["GET"])
def logs_copy_all():
    if is_admin():
        az_file_monitor = AzureFileMonitor(app.env_conf.getSetting('azaccount'), app.env_conf.getSetting('azkey'), 'logs')
        if app.env == 'local':
            az_file_monitor.setProxy('localhost', '3127')
        az_file_monitor.addDirectory(os.path.join(app.root_path, 'logs'))
        az_file_monitor.copyAll()
        return flask.redirect('/admin')
    else:
        return "Not authorized", 401
        
@app.route("/logs/file/<logger>", methods=["GET"])
def logs_file(logger):
    if is_admin():
        log_service = LogService(account_name=app.env_conf.getSetting('azaccount'), account_key=app.env_conf.getSetting('azkey'), debug=True)
        raw_log = log_service.getLogFileContent(logger)        
        raw_log = raw_log.replace("\r\n", "<br />")
        html_log = raw_log.replace("\n", "<br />")
        return flask.render_template('logs_file.html', name=logger, log=html_log)
    else:
        return "Not authorized", 401
        

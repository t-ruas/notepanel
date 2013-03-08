import sys
import os
import inspect
import flask
import logging
from logging.handlers import TimedRotatingFileHandler

# ================================================================
# flask

app = flask.Flask(__name__)

# ================================================================
# get root directory

root_path = app.root_path + "\\"

# ================================================================
# set the environment

if "WeAreInTheCloud" in os.environ:
    env = os.environ["WeAreInTheCloud"]
else:
    env = "local"

# ================================================================
# configuration

settings = {}
settings_path = os.path.join(root_path, "settings.%s.py" % env)
print settings_path
execfile(settings_path, settings)

app.secret_key = settings['secret']

# ================================================================
# OpenId

from flask.ext.openid import OpenID
oid = OpenID(app, settings['open_id_storage_path'])

# ================================================================
# http call behind proxy management

if "proxy_host" in settings:
    import urllib2
    proxy_url = 'http://%s:%s' % (settings["proxy_host"], settings["proxy_port"])
    proxies = {"http":proxy_url, "https":proxy_url}
    proxy = urllib2.ProxyHandler(proxies) 
    opener = urllib2.build_opener(proxy)
    urllib2.install_opener(opener)


# ================================================================
# set path to packages for local environment

if "packages_path" in settings:
    packages_path = os.path.join(root_path, settings["packages_path"])
    print '****************************************' + packages_path
    sys.path.append(packages_path)

# ================================================================
# azure log file monitor

from utils import file_monitor
log_monitor = file_monitor.getAzureFileMonitor("log_monitor")
log_monitor.configure(settings["azaccount"], settings["azkey"], "logs")
if "proxy_host" in settings:
    log_monitor.set_proxy(settings["proxy_host"], settings["proxy_port"])
if "WeAreInTheCloud" in os.environ:
    log_monitor.add_directory(os.path.join(root_path, settings["logs_path"]))

# ================================================================
# azure log handler

from utils import azure_logging
azure_logging.configure(settings["azaccount"], settings["azkey"])
if "proxy_host" in settings:
    azure_logging.set_proxy(settings["proxy_host"], settings["proxy_port"])
if "WeAreInTheCloud" in os.environ:
if "WeAreInTheCloud" in os.environ:
    azure_logging.init_storage()
azure_log_handler = azure_logging.get_handler()
azure_log_handler.setLevel(logging.WARN)

# ================================================================
# file log handler

logs_path = os.path.join(root_path, settings["logs_path"])

# ensure logs dir exists

if not os.path.exists(logs_path):
    os.makedirs(logs_path)

file_log_handler = TimedRotatingFileHandler(filename=logs_path+"site.log", when="midnight", interval=1, backupCount=2, encoding=None, delay=False, utc=False)
file_log_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
file_log_handler.setLevel(logging.DEBUG)

# ================================================================
# log redirection

logger = logging.getLogger('sqlalchemy')
logger.setLevel(logging.ERROR)

if "WeAreInTheCloud" in os.environ:
    logger.addHandler(azure_log_handler)
logger.addHandler(file_log_handler)

logger = logging.getLogger("notepanel")
logger.setLevel(logging.DEBUG)

if "WeAreInTheCloud" in os.environ:
    logger.addHandler(azure_log_handler)
logger.addHandler(file_log_handler)

# ================================================================
# log to console for local environment
if env == 'local':
    # console log handler
    console_log_handler = logging.StreamHandler()
    console_log_handler.setLevel(logging.DEBUG)
    # redirection
    logger = logging.getLogger('sqlalchemy')
    logger.addHandler(console_log_handler)
    logger = logging.getLogger("notepanel")
    logger.addHandler(console_log_handler)

# ================================================================

try:

    logger.info("Application started")

    # ================================================================
    # database

    from data import db
    from data import mocker

    db.configure(settings["db"])

    mocker.empty_db()

    db.create_model()

    mocker.fill_db()

    # ================================================================

    import views

except Exception, e:
    logger.error(str(e))

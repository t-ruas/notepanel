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

# ================================================================
# secret for flask session cookie encryption

app.secret_key = settings["secret"]

# ================================================================
# set path to packages for local environment

if "packages_path" in settings:
    packages_path = os.path.join(root_path, settings["packages_path"])
    print packages_path
    sys.path.append(packages_path)

# ================================================================
# azure log handler

from utils import azure_logging

azure_logging.configure(settings["azaccount"], settings["azkey"])

if "proxy_host" in settings:
    azure_logging.set_proxy(settings["proxy_host"], settings["proxy_port"])

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

logger.addHandler(azure_log_handler)
logger.addHandler(file_log_handler)

logger = logging.getLogger("notepanel")
logger.setLevel(logging.DEBUG)

logger.addHandler(azure_log_handler)
logger.addHandler(file_log_handler)

# ================================================================

try:

    logger.info("Application started")

    # ================================================================
    # database

    from data import db

    db.configure(settings["db"])
    db.initialize("notepanel")

    import data.model

    db.create_model()

    # ================================================================

    import views

except Exception, e:
    logger.error(str(e))

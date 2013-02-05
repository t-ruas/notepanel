import sys
import os
import inspect
import logging
from logging.handlers import TimedRotatingFileHandler
from tornado.web import Application
from tornado.ioloop import IOLoop

# ================================================================
# get root directory

root_path = os.path.dirname(__file__)

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
# azure log file monitor

from utils import file_monitor
log_monitor = file_monitor.getAzureFileMonitor("log_monitor")
log_monitor.configure(settings["azaccount"], settings["azkey"], "logs")
log_monitor.add_directory(os.path.join(root_path, settings["logs_path"]))
if "proxy_host" in settings:
    log_monitor.set_proxy(settings["proxy_host"], settings["proxy_port"])

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
    import data.model
    from data import mocker

    db.configure(settings["db"])
    db.initialize("notepanel")

    mocker.empty_db()

    db.create_model()

    mocker.fill_db()

    # ================================================================

    from views import HomeHandler, AuthHandler, BoardPollHandler, BoardHandler

    appsettings = {
        "static_path": os.path.join(root_path, "static"),
        "cookie_secret": settings["secret"],
        "debug": True
    }

    app = Application([
        (r"/", HomeHandler),
        (r"/auth/(\w+)", AuthHandler),
        (r"/board/poll", BoardPollHandler),
        (r"/board/(\w+)", BoardHandler),
    ], **appsettings)

    app.listen(80)

    IOLoop.instance().start()

except Exception, e:
    logger.error(str(e))

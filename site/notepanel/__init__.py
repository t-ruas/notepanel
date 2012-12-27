import os
import inspect
import flask
from notepanel.utils.configuration import *

app = flask.Flask(__name__)

from . import views

# get root directory
root_path = os.path.dirname(os.path.abspath(inspect.getframeinfo(inspect.currentframe()).filename)) + "\\"
# init configuration
conf_manager = ConfigurationManager(root_path);
env_conf = conf_manager.getConfiguration()
# secret for session cookie encryption
app.secret_key = env_conf.getSetting('secret')
# connection string
from notepanel.services.serviceconfiguration import ServiceConfiguration
svc_conf = ServiceConfiguration()
svc_conf.mysqlenginestring = env_conf.getMySQLEngineString('APP')

app.envconf = env_conf

import sys
import os
import inspect
import flask
from notepanel.utils.configuration import *


app = flask.Flask(__name__)



# get root directory
root_path = app.root_path + "\\"
# init configuration
conf_manager = ConfigurationManager(app.root_path);
env_conf = conf_manager.getConfiguration()
app.envconf = env_conf
# secret for session cookie encryption
app.secret_key = env_conf.getSetting('secret')

# setting environment
env = 'local';
if ConfigurationManager.weAreInTheCloud():  
    env = ConfigurationManager.getCloudEnvironment()
#app.env = env

# setting path to packages for local environment
if env == 'local':
    sys.path.append(os.path.normpath(os.path.join(root_path, '..\\..\\site-packages')))
    
# retrieving connection string
from notepanel.services.serviceconfiguration import ServiceConfiguration
svc_conf = ServiceConfiguration()
svc_conf.mysqlenginestring = env_conf.getMySQLEngineString('APP')


#logs_path = root_path + '\\logs\\'

'''
import logging
from logging.handlers import TimedRotatingFileHandler, RotatingFileHandler
import logging.config
'''

#logging
#logging.config.fileConfig(app.root_path + '\\log.' + env + '.conf')

'''
# flask app logging
if ConfigurationManager.weAreInTheCloud():
    app_log_file_name = logs_path + 'flask.log'
    app_log_file_handler = TimedRotatingFileHandler(filename=app_log_file_name, when='midnight', interval=1, backupCount=2, encoding=None, delay=False, utc=False)
    app_log_file_handler.setLevel(logging.WARN)
    app.logger.addHandler(app_log_file_handler)
'''

'''
# sqlalchemy logging
from logging import getLogger
sqlalchemy_logger = logging.getLogger('sqlalchemy')
sqlalchemy_logger.setLevel(logging.INFO)    
sqlalchemy_log_file_name = logs_path + 'sqlalchemy.log'
sqlalchemy_log_file_handler = TimedRotatingFileHandler(filename=sqlalchemy_log_file_name, when='midnight', interval=1, backupCount=2, encoding=None, delay=False, utc=False)
sqlalchemy_log_file_handler.setLevel(logging.WARN)
#sqlalchemy_logger.handlers = []
#for h in sqlalchemy_logger.handlers:
#    print '**************************************************removing handler %s'%str(h)
sqlalchemy_logger.addHandler(sqlalchemy_log_file_handler)

# site logs file handler 
site_log_file_name = logs_path + 'site.log'
site_log_file_handler = TimedRotatingFileHandler(filename=site_log_file_name, when='midnight', interval=1, backupCount=2, encoding=None, delay=False, utc=False)
site_log_file_handler.setLevel(logging.INFO)
site_log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
site_log_file_handler.setFormatter(site_log_formatter)
# filtering on our logs
notepanel_site_log_filter = logging.Filter(name='notepanel.site')
ysance_utils_log_filter = logging.Filter(name='ysance.utils')
#site_log_file_handler.addFilter(notepanel_site_log_filter)
#site_log_file_handler.addFilter(ysance_utils_log_filter)

# site logging 
site_logger = logging.getLogger('notepanel.site')
site_logger.setLevel(logging.INFO)
site_logger.addHandler(site_log_file_handler)

# utils logging
utils_logger = logging.getLogger('ysance.utils')
utils_logger.setLevel(logging.INFO)
utils_logger.addHandler(site_log_file_handler)

'''
'''
from notepanel.utils.azurefilemonitor import *
log_monitor = AzureFileMonitor()
log_monitor.setTarget(env_conf.getSetting('azaccount'), env_conf.getSetting('azkey'), 'logs')
# using proxy only in local
if env == 'local':
    log_monitor.blob_service.set_proxy('localhost', '3127')
log_monitor.addFile(logs_path + 'site.log')
log_monitor.addFile(logs_path + 'sqlalchemy.log')
log_monitor.addFile(logs_path + 'flask.log')
log_monitor.copyAllFiles()
'''


#from . import views

# for test
from . import test


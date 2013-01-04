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
app.env_conf = env_conf
# secret for session cookie encryption
app.secret_key = env_conf.getSetting('secret')

# setting environment
env = 'local';
if ConfigurationManager.weAreInTheCloud():  
    env = ConfigurationManager.getCloudEnvironment()
app.env = env

# setting path to packages for local environment
if env == 'local':
    sys.path.append(os.path.normpath(os.path.join(root_path, '..\\..\\site-packages')))


import logging
from logging import getLogger
from notepanel.utils.log import LevelFilter

# site logging
site_logger = logging.getLogger('notepanel.site')
site_logger.setLevel(logging.INFO)
# site logs azure table handler
from notepanel.utils.azuretablehandler import AzureTableHandler
site_log_aztable_handler = AzureTableHandler(env_conf.getSetting('azaccount'), env_conf.getSetting('azkey'), 'logs')
site_log_aztable_handler.setLevel(logging.WARN)
site_log_aztable_handler.addFilter(LevelFilter(logging.WARN))
if env == 'local':
    site_log_aztable_handler.set_proxy('localhost', '3127')
site_logger.addHandler(site_log_aztable_handler)

try:
    
    # retrieving connection string
    from notepanel.services.serviceconfiguration import ServiceConfiguration
    svc_conf = ServiceConfiguration()
    svc_conf.mysqlenginestring = env_conf.getMySQLEngineString('APP')            
    
    import logging
    from logging.handlers import TimedRotatingFileHandler, RotatingFileHandler
        
    #import logging.config
    #logging.config.fileConfig(app.root_path + '\\log.' + env + '.conf')
    
    # ensure logs dir exists
    logs_path = os.path.join(root_path, 'logs\\')
    if not os.path.exists(logs_path):
        os.makedirs(logs_path)
    
    # flask app logging
    if ConfigurationManager.weAreInTheCloud():
        # flask app logs azure table handler
        flask_log_aztable_handler = AzureTableHandler(env_conf.getSetting('azaccount'), env_conf.getSetting('azkey'), 'logs')
        flask_log_aztable_handler.setLevel(logging.WARN)
        if env == 'local':
            site_log_aztable_handler.set_proxy('localhost', '3127')
        app.logger.addHandler(flask_log_aztable_handler)
        # site logs file handler
        app_log_file_name = logs_path + 'flask.log'
        app_log_file_handler = TimedRotatingFileHandler(filename=app_log_file_name, when='midnight', interval=1, backupCount=2, encoding=None, delay=False, utc=False)
        app_log_file_handler.setLevel(logging.INFO)
        app_log_file_handler.addFilter(LevelFilter(logging.INFO))
        app.logger.addHandler(app_log_file_handler)
        
    # sqlalchemy logging    
    sqlalchemy_logger = logging.getLogger('sqlalchemy')
    sqlalchemy_logger.setLevel(logging.INFO)
    # sqlalchemy logs file handler  
    sqlalchemy_log_file_name = logs_path + 'sqlalchemy.log'
    sqlalchemy_log_file_handler = TimedRotatingFileHandler(filename=sqlalchemy_log_file_name, when='midnight', interval=1, backupCount=2, encoding=None, delay=False, utc=False)
    sqlalchemy_log_file_handler.setLevel(logging.INFO)
    sqlalchemy_log_file_handler.addFilter(LevelFilter(logging.INFO))
    sqlalchemy_logger.addHandler(sqlalchemy_log_file_handler)
    
    # site logs file handler 
    site_log_file_name = logs_path + 'site.log'
    site_log_file_handler = TimedRotatingFileHandler(filename=site_log_file_name, when='midnight', interval=1, backupCount=2, encoding=None, delay=False, utc=False)
    site_log_file_handler.setLevel(logging.INFO)
    site_log_aztable_handler.addFilter(LevelFilter(logging.INFO))
    site_log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    site_log_file_handler.setFormatter(site_log_formatter)       
    site_logger.addHandler(site_log_file_handler)
    site_logger.info('Site logs file handler up')
    
    '''
    # filtering on our logs
    notepanel_site_log_filter = logging.Filter(name='notepanel.site')
    ysance_utils_log_filter = logging.Filter(name='ysance.utils')
    #site_log_file_handler.addFilter(notepanel_site_log_filter)
    #site_log_file_handler.addFilter(ysance_utils_log_filter)
    '''
    
    '''
    # utils logging
    utils_logger = logging.getLogger('ysance.utils')
    utils_logger.setLevel(logging.INFO)
    utils_logger.addHandler(site_log_file_handler)    
    '''
       

except Exception, e:
    site_logger.error(str(e))
    pass
    
      
#from . import views
# for test
from . import test


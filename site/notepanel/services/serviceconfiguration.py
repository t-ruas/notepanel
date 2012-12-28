from notepanel.utils.singleton import *

class ServiceConfiguration(object):
    
    __metaclass__ = Singleton   
    
    mysqlenginestring = ''
    logger_name = 'services'    
    
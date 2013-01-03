from notepanel.utils.singleton import Singleton

class ServiceConfiguration(object):
    
    __metaclass__ = Singleton
    
    mysqlenginestring = ''
    logger_name = 'services' 
    
    def __init__(self):
        pass
    
       
    
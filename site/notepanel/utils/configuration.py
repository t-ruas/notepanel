import os
import inspect
from abc import ABCMeta
import ConfigParser


class ConfigurationManager(object):
    
    config_file_dir_path = ''
    
    def __init__(self, config_dir_path):
        self.config_file_dir_path = config_dir_path

    def getConfigFilePath(self):
        return self.config_file_dir_path + "notepanel.conf"
    
    @staticmethod
    def weAreInTheCloud():        
        if "WeAreInTheCloud" in os.environ:
            return True
        else:
            return False
        
    def getConfiguration(self):
        if ConfigurationManager.weAreInTheCloud():
            return AzureConfiguration()
        else:
            return FileConfiguration(self.getConfigFilePath())
        

class Configuration(object):

    # __metaclass__ = Singleton
    __metaclass__ = ABCMeta
    
    IsCloud = False
       
    def __init__(self):
       #IsCloud = Configuration.WeAreInTheCloud()
       pass

    def getSetting(self, key):
        '''
        if self.IsCloud:
            return self.GetSettingFromEnv(key)
        else
            return self.GetSettingFromFile(key)        
        '''
        return self.getSetting(key)
    
    def getMySQLEngineString(self, connection_string_name):
        connection_string = self.getMySQLConnectionString(connection_string_name)
        connection_string_parts = connection_string.split(";")
        connection_elts = dict()
        for part in connection_string_parts:
            assignement_parts = part.split("=")            
            key = assignement_parts[0]
            value = assignement_parts[1]
            connection_elts[key] = value
        engine_string = "mysql://%s:%s@%s/%s" % (connection_elts['User Id'], connection_elts['Password'], connection_elts['Data Source'], connection_elts['Database'])
        return engine_string
        
    def getMySQLConnectionString(self, connection_string_name):
        return self.getMySQLConnectionString(connection_string_name)


class FileConfiguration(Configuration):

    configuration_file = ''

    def __init__(self, config_file):        
        self.configuration_file = config_file
    
    def getSetting(self, key):
        # read the configuration file
        config = ConfigParser.RawConfigParser()
        config.read(self.configuration_file)
        # TODO :  check presence of the key
        return config.get("environment", key)
            
    def getMySQLConnectionString(self, connection_string_name):
        config = ConfigParser.RawConfigParser()
        config.read(self.configuration_file)
        # TODO :  check presence of the key
        return config.get("db", connection_string_name)
        
    
class AzureConfiguration(Configuration):       
    
    def getSetting(self, key):
        if key in os.environ:
            return os.environ[key] 
        else:
            raise Exception("setting key %s not found" % key)
            
    def getMySQLConnectionString(self, connection_string_name):
        return self.GetSetting("MYSQLCONNSTR_" + connection_string_name)

# FileConfiguration implements Configuration
Configuration.register(FileConfiguration)
# AzureConfiguration implements Configuration
Configuration.register(AzureConfiguration)


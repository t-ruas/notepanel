import logging

#logger = logging.getLogger('utils')
#logger.info('We log utils')

class LevelFilter(object):  
    def __init__(self, level):
        self.__level = level

    def filter(self, logRecord):
        return logRecord.levelno <= self.__level
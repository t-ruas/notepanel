from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from serviceconfiguration import ServiceConfiguration

class BaseService(object):
    
    engine = None
    sessionclass = None
    
    def __init__(self):
        self.engine = self._getEngine()
        self.sessionclass = sessionmaker(bind=self.engine)
    
    def getUnitOfWork(self):
        if self.engine == None:
            self.engine = self._getEngine()
        if self.sessionclass == None:
            self.sessionclass = sessionmaker(bind=self.engine)
        unitofwork = self.sessionclass()
        return unitofwork
    
    def _getEngine(self):
        return create_engine(ServiceConfiguration().mysqlenginestring, echo=True)
        


    
    
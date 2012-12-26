from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class BaseService(object):
    
    
    engine = None
    sessionclass = None
    
    def __init__(self):
        self.engine = create_engine('mysql://root@localhost/notepanel', echo=True)
        self.sessionclass = sessionmaker(bind=self.engine)
    
    def getUnitOfWork(self):
        if self.engine == None:
            self.engine = create_engine('mysql://root@localhost/notepanel', echo=True)
        if self.sessionclass == None:
            self.sessionclass = sessionmaker(bind=self.engine)
        unitofwork = self.sessionclass()
        return unitofwork
        
    
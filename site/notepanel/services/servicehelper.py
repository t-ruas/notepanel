from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class ServiceHelper(object):
    
    engine = None
    sessionclass = None
    
    @staticmethod
    def getUnitOfWork():
        if ServiceHelper.engine == None:
            ServiceHelper.engine = create_engine('mysql://root@localhost/notepanel', echo=True)
        if ServiceHelper.sessionclass == None
            ServiceHelper.sessionclass = sessionmaker(bind=ServiceHelper.engine)
        unitofwork = ServiceHelper.sessionclass()
        return unitofwork
    
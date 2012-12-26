from notepanel.utils.singleton import *
from baseservice import BaseService
from notepanel.entities.model import Board, User

class UserService(BaseService):
    
    __metaclass__ = Singleton    
        
    def __init__(self):
        BaseService.__init__(self)        
       
    def login(self, login, password):
        session = self.getUnitOfWork();
        query = session.query(User).filter(User.login == login);
        user = query.first();
        if user == None:
            return False
        elif user.password == password:
            return True
        else:
            return False

    def logout(self, login):
        pass
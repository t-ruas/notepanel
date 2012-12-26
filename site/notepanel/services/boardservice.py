from utils.singleton import *
from baseservice import BaseService
from entities.model import Board, User

class BoardService(BaseService):
    
    __metaclass__ = Singleton
       
    def __init__(self):
        BaseService.__init__(self)

    def GetFirstBoard(self):
        session = self.getUnitOfWork();
        query = session.query(Board)
        board = query.first()
        return board




        
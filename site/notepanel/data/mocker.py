from . import db
from model import User, Board, Note
from sqlalchemy import func

def fill_db():
    session = db.Session()
    user1 = User(name='tr', password=func.md5('123'), email='bbb')
    session.add(user1)
    user2 = User(name='ft', password=func.md5('ysance'), email='ft@yopmail.com')
    session.add(user2)
    session.commit()
    board1 = Board(name='Board1')
    board1.users.append(user1)
    board1.users.append(user2)
    session.add(board1)
    session.commit()
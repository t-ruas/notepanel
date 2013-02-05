from . import db
from model import User, Board, Note
from sqlalchemy import func

def empty_db():
    # drop tables before recreating them with model
    db.engine.execute("DROP TABLE IF EXISTS board_user;")
    db.engine.execute("DROP TABLE IF EXISTS note;")
    db.engine.execute("DROP TABLE IF EXISTS board;")
    db.engine.execute("DROP TABLE IF EXISTS user;")

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

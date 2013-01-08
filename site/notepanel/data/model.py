from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, func
from db import Entity

class User(Entity):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String(100))
    name = Column(String(20))
    password = Column(String(32))
    last_seen_date = Column(DateTime, default=func.now())
    creation_date = Column(DateTime, default=func.now())

class Board(Entity):
    __tablename__ = "board"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    creation_date = Column(DateTime, default=func.now())

class Note(Entity):
    __tablename__ = "note"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    board_id = Column(Integer, ForeignKey("board.id"))
    text = Column(String(1000))
    x = Column(Integer)
    y = Column(Integer)
    color = Column(String(6))
    creation_date = Column(DateTime, default=func.now())

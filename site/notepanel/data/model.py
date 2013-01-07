from sqlalchemy import Column, Date, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, backref
from db import Entity

class User(Entity):

    __tablename__ = "user"

    usr_id = Column(Integer, primary_key=True)
    usr_email = Column(String(50))
    usr_login = Column(String(20))
    usr_password = Column(String(20))

    def __init__(self, usr_email, usr_password):
        self.usr_email = usr_email
        self.usr_password = usr_password

class Board(Entity):

    __tablename__ = "board"

    brd_id = Column(Integer, primary_key=True)
    brd_name = Column(String(50))

    def __init__(self, brd_name):
        self.brd_name = brd_name

class Note(Entity):

    __tablename__ = "note"

    nte_id = Column(Integer, primary_key=True)
    usr_id = Column(Integer, ForeignKey("user.usr_id"))
    brd_id = Column(Integer, ForeignKey("board.brd_id"))
    nte_text = Column(String(100))
    nte_x = Column(Integer)
    nte_y = Column(Integer)
    nte_color = Column(String(6))

    def __init__(self, usr_id, brd_id):
        self.usr_id = usr_id
        self.brd_id = usr_id

from sqlalchemy import Table, Column, DateTime, Integer, String, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.associationproxy import association_proxy
from db import Entity


class UserGroup:
    OWNER = 1 # creator of the board : allowed to modify the board, invite people, remove (?), export (?)
    ADMIN = 2 # allowed to modify and invite people
    CONTRIBUTOR = 3 # allowed to modify the board
    VIEWER = 4 # allowed to view the board

class BoardPrivacy:
    PRIVATE = 1 # only invited people are allowed to see it
    PUBLIC_ALTERABLE = 2 # everybody is allowed to modify it
    PUBLIC_READONLY = 3 # everybody is allowed to see it but only contributor, admin, and owner are allowed to modify if


class User(Entity):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String(100))
    name = Column(String(20))
    password = Column(String(32))
    last_seen_date = Column(DateTime, default=func.now())
    creation_date = Column(DateTime, default=func.now())
    edition_date = Column(DateTime, default=func.now())
    boards = relationship("Board", secondary="board_user", backref="users")
    user_group = UserGroup.VIEWER # not mapped because only used in a board context

    def __hash__(self):
        return self.id

    def to_dic(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "email": self.email, 
            "group": self.user_group
        }
    

class Board(Entity):
    __tablename__ = "board"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    privacy = Column(Integer, default=BoardPrivacy.PRIVATE)
    color = Column(String(7))
    creation_date = Column(DateTime, default=func.now())
    edition_date = Column(DateTime, default=func.now())
    notes = relationship("Note", backref="board")
        
    def __hash__(self):
        return self.id

    def to_dic(self):
        return {
            "id": self.id, 
            "name": self.name,
            "privacy": self.privacy,
            "color": self.color
        }


class BoardUser(Entity):
    __tablename__ = "board_user"
    board_id = Column(Integer, ForeignKey("board.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    user_group = Column(Integer , default=UserGroup.VIEWER)
    creation_date = Column(DateTime, default=func.now())
    

class Note(Entity):
    __tablename__ = "note"
    id = Column(Integer, primary_key=True)
    board_id = Column(Integer, ForeignKey("board.id"))
    text = Column(String(1000))
    width = Column(Integer)
    height = Column(Integer)
    x = Column(Integer)
    y = Column(Integer)
    z = Column(Integer) # z-position of the note compared to the other (highest on the top)
    color = Column(String(6))
    template = Column(String(20))
    access_level = Column(Integer, default=UserGroup.CONTRIBUTOR)
    creation_date = Column(DateTime, default=func.now())
    edition_date = Column(DateTime, default=func.now())

    def __hash__(self):
        return self.id

    def to_dic(self):
        return {
            "id": self.id,
            "board_id": self.board_id,
            "text": self.text,
            "width": self.width,
            "height": self.height,
            "x": self.x,
            "y": self.y,
            "z": self.z,
            "color": self.color,
            "template": self.template,
            "level": self.access_level
        }


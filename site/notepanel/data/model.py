from sqlalchemy import Table, Column, DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Entity

class BoardUser(Entity):
    __tablename__ = "board_user"
    board_id = Column(Integer, ForeignKey("board.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    creation_date = Column(DateTime, default=func.now())

class User(Entity):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String(100))
    name = Column(String(20))
    password = Column(String(32))
    last_seen_date = Column(DateTime, default=func.now())
    creation_date = Column(DateTime, default=func.now())
    edition_date = Column(DateTime, default=func.now())

    def __hash__(self):
        return self.id

    def to_dic(self):
        return {"id": self.id, "name": self.name, "email": self.email}

class Board(Entity):
    __tablename__ = "board"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    creation_date = Column(DateTime, default=func.now())
    edition_date = Column(DateTime, default=func.now())
    users = relationship("User", secondary="board_user", backref="boards")
    notes = relationship("Note", backref="board")

    def __hash__(self):
        return self.id

    def to_dic(self):
        return {"id": self.id, "name": self.name}

class Note(Entity):
    __tablename__ = "note"
    id = Column(Integer, primary_key=True)
    board_id = Column(Integer, ForeignKey("board.id"))
    text = Column(String(1000))
    x = Column(Integer)
    y = Column(Integer)
    z = Column(Integer)
    color = Column(String(6))
    creation_date = Column(DateTime, default=func.now())
    edition_date = Column(DateTime, default=func.now())

    def __hash__(self):
        return self.id

    def to_dic(self):
        return {
            "id": self.id,
            "board_id": self.board_id,
            "text": self.text,
            "x": self.x,
            "y": self.y,
            "z": self.z,
            "color": self.color
        }

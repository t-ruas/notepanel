from sqlalchemy import Table, Column, DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Entity


board_user_table = Table("board_user", Entity.metadata,
    Column("board_id", Integer, ForeignKey("board.id")),
    Column("user_id", Integer, ForeignKey("user.id"))
)


class User(Entity):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String(100))
    name = Column(String(20))
    password = Column(String(32))
    last_seen_date = Column(DateTime, default=func.now())
    creation_date = Column(DateTime, default=func.now())
    notes = {} # not mapped
    
    def __hash__(self):
        return self.id


class Board(Entity):
    __tablename__ = "board"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    creation_date = Column(DateTime, default=func.now())
    users = relationship("User",
                    secondary=board_user_table,
                    backref="boards")
    notes = {} # not mapped
    
    def __hash__(self):
        return self.id


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
    
    def __hash__(self):
        return self.id

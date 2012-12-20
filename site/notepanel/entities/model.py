from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy import ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship, backref

engine = create_engine('mysql://root@localhost', echo=True) # connect to server
#engine.execute("CREATE DATABASE NotePanel") #create db
engine.execute("USE NotePanel") # select new db

Base = declarative_base()

class User(Base):
    """"""
    __tablename__ = "user"
 
    id = Column(Integer, primary_key=True)
    email = Column(String(50))
    login = Column(String(20))
    password = Column(String(20))
 
    def __init__(self, email, password):
        """"""
        self.email = email
        self.password = password
        
class Board(Base):
    """"""
    __tablename__ = "board"
 
    id = Column(Integer, primary_key=True)
    name = Column(String(50))    
    
    def __init__(self, name):
        """"""
        self.name = name
        
class Note(Base):
    """"""
    __tablename__ = "note"
 
    id = Column(Integer, primary_key=True)
    userid = Column(Integer, ForeignKey("user.id"))
    boardid = Column(Integer, ForeignKey("board.id"))
    text = Column(String(100))
    x = Column(Integer)
    y = Column(Integer)
    c = Column(String(1)) #color
 
    def __init__(self, userid, boardid):
        """"""
        self.userid = userid
        self.boardid = boardid        

Base.metadata.create_all(engine)
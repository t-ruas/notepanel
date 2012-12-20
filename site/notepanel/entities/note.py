from sqlalchemy import ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship, backref
 
 
class Note(Base):
    """"""
    __tablename__ = "note"
 
    id = Column(Integer, primary_key=True)
    userid = Column(Integer, ForeignKey("user.id"))
    boardid = Column(Integer, ForeignKey("board.id"))
    text = Column(String)
    x = Column(Integer)
    y = Column(Integer)
    c = Column(String) #color
 
    def __init__(self, userid, boardid):
        """"""
        self.userid = userid
        self.boardid = boardid
           
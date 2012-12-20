from sqlalchemy import ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship, backref
 
 
class Board(Base):
    """"""
    __tablename__ = "board"
 
    id = Column(Integer, primary_key=True)
    name = Column(String)    
    
    def __init__(self, name):
        """"""
        self.name = name
           
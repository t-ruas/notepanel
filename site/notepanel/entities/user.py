from sqlalchemy import ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship, backref
 
 
class User(Base):
    """"""
    __tablename__ = "user"
 
    id = Column(Integer, primary_key=True)
    email = Column(String)
    login = Column(String)
    password = Column(String)
 
    def __init__(self, email, password):
        """"""
        self.email = email
        self.password = password
           
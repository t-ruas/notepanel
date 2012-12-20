from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from model import Board
 
engine = create_engine('mysql://root@localhost/notepanel', echo=True)
 
# create a Session
Session = sessionmaker(bind=engine)
session = Session()
 
first_board = Board("SecondBoard")
session.add(first_board)

session.commit()
 
# editing Album data
query = session.query(Board)
board = query.first()
session.commit()

print board.name
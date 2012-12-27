from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from entities.model import Board, User
from services.userservice import UserService
from services.boardservice import BoardService
 
'''
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
'''

script_path = os.path.dirname(os.path.abspath(inspect.getframeinfo(inspect.currentframe()).filename)) + "\\"
print script_path

#board = BoardService().GetFirstBoard()
#print board.name

if UserService().CheckUser('Freddy', 'ysance'):
    print "OK"
else:
    print "KO"



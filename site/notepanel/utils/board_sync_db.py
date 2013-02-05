from data import db
from data.services import BoardService

def get_updates(board_id, version)
    session = db.Session()
    return BoardService.get_updates(board_id, version)

def add_update(note):
    session = db.Session()
    BoardService.add_update(session, note):


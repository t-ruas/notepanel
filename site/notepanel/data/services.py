from datetime import datetime
from model import Board, User, BoardUser, Note, UserGroup
from . import db
from sqlalchemy import func, and_

class UserService(object):
    
    

    def get_by_log(self, session, name, password):
        user = session.query(User).\
            filter(and_(User.name == name, User.password == func.md5(password))).\
            first()
        if user is not None:
            user.last_seen_date = datetime.now()
            session.commit()
        return user

    def get_by_id(self, session, id):
        return session.query(User).\
            filter(User.id == id).\
            first()
            
    def get_by_name(self, session, name):
        return session.query(User).\
            filter(User.name == name).\
            first()

    def add(self, session, name, email, password):
        user = User(
            name=name,
            password=func.md5(password),
            email=email)
        session.add(user)
        session.commit()

    def remove(self, session, user_id):
        user = User(id=user_id)
        session.delete(user)
        session.commit()

class BoardService(object):
    
    session = db.Session()

    def get(self, session, board_id):
        board = session.query(Board).\
            filter(Board.id == board_id).\
            first()
        return board

    def add(self, session, creator_id, name):
        board = Board(name=name)
        creator = User(id=creator_id)
        board.users.append(creator)
        session.add(board)
        session.commit()

    def remove(self, session, board_id):
        board = Board(id=board_id)
        session.delete(board)
        session.commit()

    def get_default(self, session, user):
        return session.query(Board).\
            join(BoardUser).\
            filter(BoardUser.user_id == user.id).\
            first()

    def add_user(self, session, board, user_id):
        user = User(id=user_id)
        if not user in board.users:
            board.users.append(user)
            session.commit()
        return board
        
    def add_user(self, board_id, user_name, user_group):
        board = self.get(session=self.session, board_id=board_id)
        user = UserService().get_by_name(session=self.session, name=user_name)
        if user != None and not user in board.users:
            board_user = BoardUser(user_id=user.id, board_id=board_id, user_group=user_group)        
            self.session.add(board_user)
            self.session.commit()
        # TODO : else
        return board

    def remove_user(self, session, board, user_id):
        user = User(id=user_id)
        if user in board.users:
            board.users.remove(user)
            session.commit()
        return board
    
    def get_users(self, session, board_id):
        return session.query(User).\
            join(BoardUser).\
            filter(BoardUser.board_id == board_id).\
            all()

class NoteService(object):

    def add(self, session, board, note):
        user = User(id=user_id)
        if not user in board.users:
            board.users.append(user)
            session.commit()
        return board

    def edit():
        note.edition_date = datetime.now()

    def remove(self, session, id):
        note = Note(id=id)
        session.delete(note)
        session.commit()

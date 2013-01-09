from model import Board, User
from sqlalchemy import func, and_


class UserService(object):

    def log(self, session, name, password):
        user = session.query(User.id, User.email).\
            filter(and_(User.name == name, User.password == func.md5(password))).\
            first()
        if user is not None:
            user.name = name
        return user

    def get(self, session, id):
        user = session.query(User.name, User.email).\
            filter(User.id == id).\
            first()
        if user is not None:
            user.id = id
        return user

    def add(self, session, name, email, password):
        user = User(
            name=name,
            password=func.md5(password),
            email=email)
        session.add(user)
        return user
    
    def remove(self, session, user_id):
        user = User(id=user_id)
        session.delete(user)
        return user

class BoardService(object):

    def get(self, session, board_id):
        board = session.query(Board).\
            filter(Board.id == board_id).\
            first()
        return board
        
    def add(self, session, name,creator):  
        board = Board(name=name)
        board.users.add(creator)
        session.add(board)
        return board
        
    def remove(self, session, board_id):
        board = Board(id=board_id)
        session.delete(board)
        return board
    
    def add_user(self, session, board, user_id):
        user = User(id=user_id)
        if not user in board.users:
            board.users.add(user)
            session.commit()
        return board
        
    def remove_user(self, session, board, user_id):
        user = User(id=user_id)
        if user in board.users:
            board.users.remove(user)
            session.commit()
        return board

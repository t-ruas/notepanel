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

class BoardService(object):

    def Get_first_board(self, session):
        query = session.query(Board)
        board = query.first()
        return board

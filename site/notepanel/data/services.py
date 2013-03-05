from datetime import datetime
from model import Board, User, BoardUser, Note, UserGroup, BoardPrivacy
from serializer import JsonSerializer
from . import db
from sqlalchemy import func, and_


class UserService(object):
    
    session = db.Session()
    
    def get_by_log(self, name, password):
        user = self.session.query(User).\
            filter(and_(User.name == name, User.password == func.md5(password))).\
            first()
        return user

    def get_by_id(self, id):
        return self.session.query(User).\
            filter(User.id == id).\
            first()

    def get_by_name(self, name):
        return self.session.query(User).\
            filter(User.name == name).\
            first()

    def add(self, name, email, password):
        user = User(
            name=name,
            password=func.md5(password),
            email=email)
        self.session.add(user)
        self.session.commit()

    def remove(self, user_id):
        user = User(id=user_id)
        self.session.delete(user)
        self.session.commit()

class BoardService(object):
    
    session = db.Session()
    
    # retrieve a board
    def get(self, board_id):
        board = self.session.query(Board).\
            filter(Board.id == board_id).\
            first()
        self.session.commit()
        return board
    
    # get all boards of a user
    def getByUser(self, user_id):
        boards = self.session.query(Board).\
            join(BoardUser).\
            filter(BoardUser.user_id == user_id).\
            all()
        self.session.commit()
        return boards
        
    # get n last created  public boards
    def getPublic(self, limit):
        boards = self.session.query(Board).\
            filter(Board.privacy == BoardPrivacy.PUBLIC).\
            order_by(Board.creation_date.desc()).\
            limit(limit)
        self.session.commit()
        return boards
    
    # create board
    def add(self, creator_id, board_name, board_privacy):
        board = Board(name=board_name,privacy=board_privacy)
        self.session.add(board)
        self.session.commit()
        board_user = BoardUser(user_id=creator_id, board_id=board.id, user_group=UserGroup.OWNER)
        self.session.add(board_user)
        self.session.commit()
        return board
    
    # import board from file
    def import_board(self, creator_id, board_json):
        # TODO : check data format and integrity
        board = JsonSerializer().deserialize_board(board_json)
        notes = JsonSerializer().deserialize_notes(board_json)
        for note in notes:
            board.notes.append(note)
        self.session.add(board)
        self.session.commit()
        users = JsonSerializer().deserialize_users(board_json)
        for user in users:
            board_user = BoardUser(user_id=user.id, board_id=board.id, user_group=user.user_group)
            self.session.add(board_user)
        self.session.commit()
        return board      
    
    # export board to a file
    def export_board(self, board_id):
        board = self.get(board_id)
        return JsonSerializer().serialize(board)
    
    # delete board
    def remove(self, board_id):
        board = Board(id=board_id)
        self.session.delete(board)
        self.session.commit()

    def get_default(self, user):
        return self.session.query(Board).\
            join(BoardUser).\
            filter(BoardUser.user_id == user.id).\
            first()
    
    # add a user to a board
    def add_user(self, board_id, user_name, user_group):
        board = self.get(board_id=board_id)
        user = UserService().get_by_name(name=user_name)
        if user != None and not user in board.users:
            board_user = BoardUser(user_id=user.id, board_id=board_id, user_group=user_group)        
            self.session.add(board_user)
            self.session.commit()
        # TODO : else
        return board
    
    # remove a user from a board
    def remove_user(self, board, user_id):
        user = User(id=user_id)
        if user in board.users:
            board.users.remove(user)
            self.session.commit()
        return board
    
    # retrieve the users of a board
    def get_users(self, board_id):
        users_array = self.session.query(User.id, User.name, User.email, BoardUser.user_group).\
            join(BoardUser).\
            filter(BoardUser.board_id == board_id).\
            all()
        users = []
        for u in users_array:
            user = User(id=u.id, name=u.name, email=u.email)
            user.user_group = u.user_group
            users.append(user)
        return users


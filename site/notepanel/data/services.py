from datetime import datetime
from model import Board, User, BoardUser, Note
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

    def remove_user(self, session, board, user_id):
        user = User(id=user_id)
        if user in board.users:
            board.users.remove(user)
            session.commit()
        return board

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

    # Return all the updates on a board that occured after the given version
    #def get_updates(self, session, id, version):
    #    updates = session.query(Note).\
    #        filter(Note.board_id == id && Note.board_version > version)
    #    return updates

    # Increment the board's version and add a note update
    #def add_update(self, session, note):
    #    pass

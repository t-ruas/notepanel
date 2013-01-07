from model import Board, User

class UserService(object):

    def login(self, session, login, password):
        query = session.query(User).filter(User.login == login)
        user = query.first()
        if user == None:
            return False
        elif user.password == password:
            return True
        else:
            return False

    def logout(self, login):
        pass

class BoardService(object):

    def Get_first_board(self, session):
        query = session.query(Board)
        board = query.first()
        return board

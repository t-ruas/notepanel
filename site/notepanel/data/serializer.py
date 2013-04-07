import pickle
import json
from  model import Board, User, BoardUser, Note


class StringSerializer(object):
    
    def serialize(self, board):
        return pickle.dumps(board)
    
    def deserialize(self, string):
        return pickle.loads(string)




class JsonSerializer(object):
    
    def serialize(self, board):
        board_export = board.to_export()
        users_export = []
        for user in board.users:
            users_export.append(user.to_export())
        board_export['users'] = users_export
        notes_export = []
        for note in board.notes:
			notes_export.append(note.to_export())
        board_export['notes'] = notes_export
        return json.dumps(board_export)
    
    def string_to_array(self, string):
        return json.loads(string)
    
    def deserialize_board(self, string):
        board_export = self.string_to_array(string)
        board = Board()
        board.from_export(board_export)        
        return board
    
    def deserialize_users(self, string):
        board_export = self.string_to_array(string)
        users_export = board_export['users']
        users = []
        for user_export in users_export:
            user = User()
            user.from_export(user_export)
            users.append(user)
        return users
        
    def deserialize_notes(self, string):
        board_export = self.string_to_array(string)
        notes_export = board_export['notes']
        notes = []
        for note_export in notes_export:
            note = Note()
            note.from_export(note_export)
            notes.append(note)
        return notes

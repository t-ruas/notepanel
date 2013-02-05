import os
import logging
from datetime import datetime
from time import sleep
from tornado.web import RequestHandler, asynchronous
from tornado.escape import json_encode
from . import settings
from . import log_monitor
from data.services import UserService, BoardService
from data.model import User, Board, Note
from data import db
from utils import azure_logging
from utils import board_sync_mem as board_sync

logger = logging.getLogger("notepanel.views")

# ================================================================

class BaseHandler(RequestHandler):
    def get_current_user(self):
        value = self.get_secure_cookie("notepanel_user")
        if value is None: return None
        else: return int(value)
    def set_current_user(self, id):
        if id is None: self.clear_cookie("notepanel_user")
        else: self.set_secure_cookie("notepanel_user", str(id))

class HomeHandler(BaseHandler):
    def get(self):
        logger.info("home")
        self.render("templates/panel.html")

class AuthHandler(BaseHandler):
    def get(self, action):

        if action == "logout":
            logger.debug("logout ok")
            self.set_current_user(None)
            self.render("templates/panel.html")

        elif action == "identify":
            if self.current_user:
                session = db.Session()
                user = UserService().get_by_id(session, self.current_user)
                if not user is None:
                    logger.debug("identify ok : {0}/{1}".format(user.name, user.id))
                    self.write(json_encode({
                        "identified": True,
                        "id": user.id,
                        "email": user.email,
                        "login": user.name,
                        "boards": None}))
                else:
                    logger.debug("identify ko : {0}".format(flask.session["id"]))
                    self.write(json_encode({"identified": False}))
            else:
                logger.debug("identify ko")
                self.write(json_encode({"identified": False}))

    def post(self, action):

        if action == "register":
            logger.debug("register start : {0}/{1}/{2}".format(self.get_argument("username"), self.get_argument("email"), self.get_argument("password")))
            session = db.Session()
            user = UserService().add(session, self.get_argument("username"), self.get_argument("email"), self.get_argument("password"))
            if user is not None:
                logger.debug("register ok : {0}/{1}".format(user.name, user.id))
                self.write(json_encode({
                    "identified": True,
                    "id": user.id,
                    "email": user.email,
                    "login": user.name,
                    "boards": None}))
            else:
                logger.debug("register ko")
                self.write(json_encode({"identified": False}))

        elif action == "login":
            session = db.Session()
            user = UserService().get_by_log(session, self.get_argument("username"), self.get_argument("password"))
            if user is not None:
                self.set_current_user(user.id)
                logger.debug("login ok : {0}/{1}".format(user.name, user.id))
                board = BoardService().get_default(db.Session(), user)
                self.write(json_encode({
                    "identified": True,
                    "user": user.to_dic(),
                    "board": board.to_dic()}))
            else:
                logger.debug("login ko : {0}".format(self.get_argument("username")))
                self.write(json_encode({"identified": False}))

class BoardHandler(BaseHandler):

    def get(self, action):
        pass

    def post(self, action):
        if action == "edit":
            logger.debug("edition requested for note {0}".format(self.get_argument("id")))
            note = Note(
                id=int(self.get_argument("id")),
                board_id=self.get_argument("board_id"),
                text=self.get_argument("text"),
                x=int(self.get_argument("x")),
                y=int(self.get_argument("y")),
                color=self.get_argument("color"))
            board_sync.update(note.board_id, note)
            self.write(json_encode({"id": note.id}))

class BoardPollHandler(BaseHandler):

    @asynchronous
    def get(self):
        updates = board_sync.get_updates(self.get_argument("board_id"), self.get_argument("version"))
        if len(updates) > 0:
            self.send_updates(updates)
        else:
            board_sync.clients[self.current_user] = self

    def send_updates(self, update):
        del board_sync.clients[self.current_user]
        self.finish(json_encode([update]))

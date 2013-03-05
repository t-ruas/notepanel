import json
from flask.sessions import SecureCookieSessionInterface, SecureCookieSession

class FlaskJsonSession(SecureCookieSession):
    serialization_method = json

class FlaskJsonSessionInterface(SecureCookieSessionInterface):
    session_class = FlaskJsonSession

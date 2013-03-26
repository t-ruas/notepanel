from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine

Session = None
Entity = declarative_base()
engine = None

def configure(connection_string):
    global engine, Session
    engine_string = get_mysql_engine_string(connection_string)
    engine = create_engine(engine_string, convert_unicode=True, encoding='utf8', echo=True)
    Session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def get_mysql_engine_string(connection_string):
    connection_string_parts = connection_string.split(";")
    connection_elts = dict()
    for part in connection_string_parts:
        assignement_parts = part.split("=")
        key = assignement_parts[0]
        value = assignement_parts[1]
        connection_elts[key] = value
    engine_string = "mysql://%s:%s@%s/%s" % (connection_elts['User Id'], connection_elts['Password'], connection_elts['Data Source'], connection_elts['Database'])
    return engine_string

def create_model():
    Entity.metadata.create_all(engine)

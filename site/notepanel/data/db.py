from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine

Session = None
Entity = declarative_base()
engine = None

def configure(connection_string):
    global engine, Session
    engine = create_engine(connection_string, echo=True)
    Session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def create_model():
    Entity.metadata.create_all(engine)

def initialize(dbname):
    engine.execute("CREATE DATABASE IF NOT EXISTS %s;" % dbname)
    engine.execute("USE %s;" % dbname)

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# If URL starts with postgresql://, rewrite to postgresql+psycopg:// for psycopg3 compatibility
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("sqlite:///."):
    # Resolve relative SQLite path relative to the backend directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_file = DATABASE_URL.replace("sqlite:///.", "", 1).lstrip("/\\")
    abs_db_path = os.path.join(base_dir, db_file)
    DATABASE_URL = f"sqlite:///{abs_db_path.replace('\\', '/')}"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for models
Base = declarative_base()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

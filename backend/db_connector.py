import os
import MySQLdb
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())  # Load .env 

def connect_to_database(
    host=None,
    user=None,
    passwd=None,
    db=None,
    port=3306,
    config: dict = None,
    url=None
):
    if url:
        import pymysql
        from sqlalchemy.engine import make_url
        # Parse connection string
        parsed = make_url(url)
        return MySQLdb.connect(
            host=parsed.host,
            user=parsed.username,
            passwd=parsed.password,
            db=parsed.database,
            port=parsed.port or 3306
        )

    if config:
        host = config.get("host")
        user = config.get("user")
        passwd = config.get("passwd")
        db = config.get("db")
        port = config.get("port", 3306)

    # Use .env or use passed in values
    host = host or os.getenv("DB_HOST", "localhost")
    user = user or os.getenv("DB_USER")
    passwd = passwd or os.getenv("DB_PASSWORD")
    db = db or os.getenv("DB_NAME")
    port = int(port or os.getenv("DB_PORT", 3306))

    if not all([host, user, passwd, db]):
        raise ValueError("Missing required DB connection parameters.")

    return MySQLdb.connect(host=host, user=user, passwd=passwd, db=db, port=port)

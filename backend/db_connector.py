import os
import pymysql
from sqlalchemy.engine import make_url
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

def connect_to_database(config=None, url=None):
    if url:
        parsed = make_url(url)
        return pymysql.connect(
            host=parsed.host,
            user=parsed.username,
            password=parsed.password,
            database=parsed.database,
            port=parsed.port or 3306
        )

    # Fallback to config/dotenv
    host = config.get("host") if config else os.getenv("DB_HOST", "localhost")
    user = config.get("user") if config else os.getenv("DB_USER")
    password = config.get("passwd") if config else os.getenv("DB_PASSWORD")
    database = config.get("db") if config else os.getenv("DB_NAME")
    port = int(config.get("port") if config else os.getenv("DB_PORT", 3306))

    if not all([host, user, password, database]):
        raise ValueError("Missing required DB connection parameters.")

    return pymysql.connect(
        host=host, user=user, password=password, database=database, port=port
    )

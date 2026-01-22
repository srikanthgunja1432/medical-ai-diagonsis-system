import pytest
import mongomock
from unittest.mock import patch
from src import create_app, Config
from src.database import get_db

class TestConfig(Config):
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/test_db'
    JWT_SECRET_KEY = 'test-secret-key'
    MONGO_DB_NAME = 'test_db'

@pytest.fixture
def app():
    # Patch MongoClient where it is used
    with patch('src.database.MongoClient', side_effect=mongomock.MongoClient) as mock_client:
        app = create_app(TestConfig)
        
        # Create context
        with app.app_context():
            yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture
def db(app):
    return get_db()

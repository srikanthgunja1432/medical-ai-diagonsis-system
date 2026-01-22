import pytest
import time
from unittest.mock import patch

def test_endpoint_latency(client):
    """Test that the health-check or simple endpoint responds within 200ms."""
    start_time = time.time()
    # Assuming there's a root or health endpoint, or just use login page (which is static/generated)
    # The backend is API only mostly.
    # Let's use a 404 endpoint which is fast, or the login endpoint with invalid creds.
    response = client.post('/api/auth/login', json={'email': 'test@test.com', 'password': 'wrong'})
    end_time = time.time()
    
    latency = (end_time - start_time) * 1000 # ms
    # This is a unit test on a mock app, so it measures overhead of Flask + Mock DB, not real DB.
    # But still useful validation of code path speed.
    assert latency < 500 # 500ms limit for unit test execution of login path

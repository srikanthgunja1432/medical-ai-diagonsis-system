import pytest
import json
from src.models.user import User

def test_auth_routes(client):
    """Test user registration and login."""
    # Register
    register_data = {
        "email": "patient@test.com",
        "password": "password123",
        "role": "patient",
        "security_question": "Pet?",
        "security_answer": "Dog",
        "firstName": "Test",
        "lastName": "Patient"
    }
    
    response = client.post('/api/auth/register', 
                          data=json.dumps(register_data),
                          content_type='application/json')
    assert response.status_code == 201
    
    # Login
    login_data = {
        "email": "patient@test.com",
        "password": "password123"
    }
    response = client.post('/api/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    return data['access_token']

def test_appointment_booking_flow(client, app):
    """Test full booking flow."""
    # 1. Register logic is handled in test_auth_routes, but we need fresh data here
    # or we can use a fixture. Let's just create a user quickly.
    
    res_reg = client.post('/api/auth/register', 
               data=json.dumps({
                   "email": "patient2@test.com",
                   "password": "password123",
                   "role": "patient",
                   "firstName": "P2", "lastName": "Test",
                   "security_question": "Q", "security_answer": "A"
               }), content_type='application/json')
    assert res_reg.status_code == 201, f"Registration failed: {res_reg.data}"
               
    # Login Patient
    res = client.post('/api/auth/login', 
                     data=json.dumps({"email": "patient2@test.com", "password": "password123"}),
                     content_type='application/json')
    assert res.status_code == 200, f"Login failed: {res.data}"
    token = json.loads(res.data)['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Register Doctor (Need a doctor to book with)
    # The system might require doctor registration or use existing ones.
    # We can create a doctor via model for simplicity or route.
    from src.models.doctor import Doctor
    # Directly creating doctor via model to bypass verification flow complexities if any
    with app.app_context():
        # Clean previous
        from src.database import get_db, DOCTORS_COLLECTION
        db = get_db()
        # Create dummy doctor
        doc_data = {
            "name": "Test Doctor",
            "email": "doc@test.com",
            "specialty": "General",
            "rating": 5.0
        }
        res_doc = db[DOCTORS_COLLECTION].insert_one(doc_data)
        doctor_id = str(res_doc.inserted_id)

    # 2. Book Appointment
    booking_data = {
        "doctorId": doctor_id,
        "doctorName": "Test Doctor",
        "date": "2025-12-31",
        "time": "10:00 AM",
        "symptoms": "Cough"
    }
    
    response = client.post('/api/appointments',
                          headers=headers,
                          data=json.dumps(booking_data),
                          content_type='application/json')
                          
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'pending'
    assert data['doctorName'] == "Test Doctor"

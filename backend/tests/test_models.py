import pytest
from datetime import datetime
from src.models.user import User
from src.models.appointment import Appointment
from src.models.schedule import Schedule

def test_user_creation_and_auth(app):
    """Test user creation and authentication."""
    email = "test@example.com"
    password = "securepassword"
    role = "patient"
    
    # Create user
    user = User.create(email, password, role)
    assert user['email'] == email
    assert user['role'] == role
    assert user['password'] != password  # Should be hashed
    
    # Authenticate
    found_user = User.find_by_email(email)
    assert found_user is not None
    assert User.check_password(found_user, password) is True
    assert User.check_password(found_user, "wrongpassword") is False

def test_appointment_lifecycle(app):
    """Test appointment creation and status updates."""
    patient_id = "507f1f77bcf86cd799439011"
    doctor_id = "507f1f77bcf86cd799439012"
    date = "2025-01-01"
    time = "10:00 AM"
    
    # Create appointment
    appt = Appointment.create(patient_id, doctor_id, "Dr. Smith", date, time)
    assert appt['status'] == 'pending'
    
    # Update status
    updated = Appointment.update_status(str(appt['_id']), 'confirmed')
    assert updated['status'] == 'confirmed'

def test_schedule_slots(app):
    """Test schedule slot generation."""
    doctor_id = "507f1f77bcf86cd799439012"
    
    # Setup schedule for Monday
    weekly_schedule = {
        "monday": {"start": "09:00", "end": "11:00", "enabled": True}
    }
    Schedule.create_or_update(doctor_id, weekly_schedule)
    
    # Test getting slots for a Monday (e.g., 2025-01-06 is a Monday)
    date_str = "2025-01-06"
    slots = Schedule.get_available_slots(doctor_id, date_str)
    
    # Expected slots: 9:00, 9:30, 10:00, 10:30 (assuming 30 min duration)
    # Note: Logic generates slots strictly < end_time
    assert "9:00 AM" in slots
    assert "10:30 AM" in slots
    assert "11:00 AM" not in slots
    assert len(slots) == 4

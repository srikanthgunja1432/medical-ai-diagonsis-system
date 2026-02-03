from stream_chat import StreamChat
import os
from datetime import datetime, timedelta
from ..database import get_db, APPOINTMENTS_COLLECTION
from bson import ObjectId

class VideoCallService:
    def __init__(self):
        self.api_key = os.environ.get('GETSTREAM_API_KEY')
        self.api_secret = os.environ.get('GETSTREAM_API_SECRET')
        self.client = None
        if self.api_key and self.api_secret:
            try:
                self.client = StreamChat(api_key=self.api_key, api_secret=self.api_secret)
            except Exception as e:
                print(f"Error initializing StreamChat: {e}")

    def generate_user_token(self, user_id: str, user_name: str = None, role: str = 'patient'):
        """Generate GetStream token for video call authentication"""
        if not self.client:
            return None

        # Token expires in 24 hours
        exp = int((datetime.utcnow() + timedelta(hours=24)).timestamp())

        # Create dictionary for token data
        token_data = {
            'user_id': user_id,
            'exp': exp,
            'role': 'admin' if role == 'doctor' else 'user' # Doctors get admin privileges in chat/calls
        }

        if user_name:
            token_data['name'] = user_name

        # Create token
        token = self.client.create_token(user_id, exp=exp)

        # Update user in Stream (optional but good for syncing names)
        try:
            self.client.update_user({
                "id": user_id,
                "role": 'admin' if role == 'doctor' else 'user',
                "name": user_name or user_id
            })
        except Exception as e:
            print(f"Error updating user in Stream: {e}")

        return token

    def create_call_id(self, appointment_id: str) -> str:
        """Generate call ID from appointment ID"""
        return f"appointment_{appointment_id}"

    def validate_call_access(self, user_id: str, appointment_id: str, role: str) -> dict:
        """
        Validate user can access the video call.
        Returns appointment details if valid, None otherwise.
        """
        db = get_db()
        try:
            appt_oid = ObjectId(appointment_id)
        except:
            return None

        appointment = db[APPOINTMENTS_COLLECTION].find_one({'_id': appt_oid})

        if not appointment:
            return None

        # Check if user is participant
        is_patient = str(appointment.get('patient_id')) == user_id
        is_doctor = str(appointment.get('doctor_id')) == user_id

        if not (is_patient or is_doctor):
            return None

        # Check appointment status - allow pending or confirmed for now
        # Ideally only confirmed, but for testing pending might be useful
        if appointment.get('status') not in ['confirmed', 'pending', 'in_progress']:
            return None

        return appointment

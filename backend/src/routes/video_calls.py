from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.video_call_service import VideoCallService
from ..models.patient import Patient
from ..models.doctor import Doctor
from ..models.appointment import Appointment
import json
import os
from datetime import datetime

video_calls_bp = Blueprint('video_calls', __name__)
video_service = VideoCallService()

def get_current_user():
    """Parse JWT identity and return user dict."""
    identity = get_jwt_identity()
    if isinstance(identity, str):
        return json.loads(identity)
    return identity

@video_calls_bp.route('/token', methods=['POST'])
@jwt_required()
def generate_token():
    """Generate a token for the current user to connect to GetStream"""
    current_user = get_current_user()
    user_id = current_user['id']
    role = current_user['role']

    # Get user details for token metadata
    user_name = "User"
    if role == 'patient':
        patient = Patient.find_by_user_id(user_id)
        if patient:
            user_name = f"{patient.get('firstName', '')} {patient.get('lastName', '')}".strip()
    elif role == 'doctor':
        doctor = Doctor.find_by_user_id(user_id)
        if doctor:
            user_name = doctor.get('name', '')

    token = video_service.generate_user_token(user_id, user_name, role)

    if not token:
        return jsonify({'error': 'Failed to generate token. Service not configured.'}), 503

    return jsonify({
        'token': token,
        'api_key': os.environ.get('GETSTREAM_API_KEY'),
        'user_id': user_id,
        'user_name': user_name
    })

@video_calls_bp.route('/call/<appointment_id>', methods=['POST'])
@jwt_required()
def create_call(appointment_id):
    """Initialize/Join a video call for an appointment"""
    current_user = get_current_user()
    user_id = current_user['id']
    role = current_user['role']

    # Validate appointment and permissions
    appointment = video_service.validate_call_access(user_id, appointment_id, role)

    if not appointment:
        return jsonify({'error': 'Unauthorized or invalid appointment'}), 403

    # Generate call ID
    call_id = video_service.create_call_id(appointment_id)

    # Generate token for this user
    user_name = "User"
    if role == 'patient':
        patient = Patient.find_by_user_id(user_id)
        if patient:
            user_name = f"{patient.get('firstName', '')} {patient.get('lastName', '')}".strip()
    elif role == 'doctor':
        doctor = Doctor.find_by_user_id(user_id)
        if doctor:
            user_name = doctor.get('name', '')

    token = video_service.generate_user_token(user_id, user_name, role)

    # If doctor is joining, we can optionally mark appointment as "in_progress"
    # if it was confirmed
    if role == 'doctor' and appointment.get('status') == 'confirmed':
        Appointment.update_status(appointment_id, 'in_progress')
        # We could also record call start time here
        Appointment.update(appointment_id, {'call_started_at': datetime.utcnow()})

    return jsonify({
        'call_id': call_id,
        'token': token,
        'api_key': os.environ.get('GETSTREAM_API_KEY'),
        'user_id': user_id,
        'user_name': user_name,
        'appointment': Appointment.to_dict(appointment)
    })

@video_calls_bp.route('/call/<appointment_id>/end', methods=['POST'])
@jwt_required()
def end_call(appointment_id):
    """End a video call"""
    current_user = get_current_user()
    user_id = current_user['id']
    role = current_user['role']

    # Validate access
    appointment = video_service.validate_call_access(user_id, appointment_id, role)

    if not appointment:
        return jsonify({'error': 'Unauthorized or invalid appointment'}), 403

    data = request.get_json() or {}
    duration = data.get('duration', 0)

    # Update appointment metadata
    updates = {
        'call_ended_at': datetime.utcnow(),
    }

    if duration:
        updates['call_duration'] = duration

    # Only update status to completed if doctor ends it?
    # Or let the "Finish Consultation" button handle that.
    # For now just log the call end.

    Appointment.update(appointment_id, updates)

    return jsonify({'message': 'Call ended logged successfully'})

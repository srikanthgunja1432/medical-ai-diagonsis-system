from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.doctor import Doctor
import json

doctors_bp = Blueprint('doctors', __name__)

def get_current_user():
    """Parse JWT identity and return user dict."""
    identity = get_jwt_identity()
    if isinstance(identity, str):
        return json.loads(identity)
    return identity

@doctors_bp.route('/', methods=['GET'])
def get_doctors():
    doctors = Doctor.find_all()
    return jsonify([Doctor.to_dict(doc) for doc in doctors])

@doctors_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_doctor_profile():
    """Get current doctor's profile."""
    current_user = get_current_user()
    if current_user['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor = Doctor.find_by_user_id(current_user['id'])
    if doctor:
        return jsonify(Doctor.to_dict(doctor))
    return jsonify({'error': 'Doctor profile not found'}), 404

@doctors_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_doctor_profile():
    """Update current doctor's profile."""
    current_user = get_current_user()
    if current_user['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor = Doctor.find_by_user_id(current_user['id'])
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    data = request.get_json()
    updated = Doctor.update(str(doctor['_id']), data)
    if updated:
        return jsonify({'message': 'Profile updated', 'profile': Doctor.to_dict(updated)})
    return jsonify({'error': 'Failed to update profile'}), 500

@doctors_bp.route('/<doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctor = Doctor.find_by_id(doctor_id)
    if doctor:
        return jsonify(Doctor.to_dict(doctor))
    return jsonify({'error': 'Doctor not found'}), 404

@doctors_bp.route('/', methods=['POST'])
@jwt_required()
def create_doctor():
    data = request.get_json()
    doctor = Doctor.create(
        user_id=data.get('user_id'),
        name=data['name'],
        specialty=data['specialty'],
        location=data['location'],
        availability=data.get('availability', []),
        rating=data.get('rating', 0.0),
        image=data.get('image', '')
    )
    return jsonify(Doctor.to_dict(doctor)), 201

@doctors_bp.route('/<doctor_id>', methods=['PUT'])
@jwt_required()
def update_doctor(doctor_id):
    data = request.get_json()
    doctor = Doctor.update(doctor_id, data)
    if doctor:
        return jsonify(Doctor.to_dict(doctor))
    return jsonify({'error': 'Doctor not found'}), 404

@doctors_bp.route('/<doctor_id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(doctor_id):
    result = Doctor.delete(doctor_id)
    if result.deleted_count > 0:
        return jsonify({'message': 'Doctor deleted successfully'})
    return jsonify({'error': 'Doctor not found'}), 404


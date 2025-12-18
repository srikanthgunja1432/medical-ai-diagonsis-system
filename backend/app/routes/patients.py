from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from ..models.patient import Patient
from ..models.medical_record import MedicalRecord
import json

patients_bp = Blueprint('patients', __name__)

def get_current_user():
    """Parse JWT identity and return user dict."""
    identity = get_jwt_identity()
    if isinstance(identity, str):
        return json.loads(identity)
    return identity

@patients_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_current_user()
    user_id = current_user['id']
    
    patient = Patient.find_by_user_id(user_id)
    if patient:
        return jsonify(Patient.to_dict(patient))
    return jsonify({'error': 'Patient profile not found'}), 404

@patients_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_current_user()
    user_id = current_user['id']
    data = request.get_json()
    
    patient = Patient.update_by_user_id(user_id, data)
    if patient:
        return jsonify({
            'message': 'Profile updated successfully', 
            'profile': Patient.to_dict(patient)
        })
    return jsonify({'error': 'Patient profile not found'}), 404

@patients_bp.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    current_user = get_current_user()
    user_id = current_user['id']
    
    records = MedicalRecord.find_by_patient_user_id(user_id)
    return jsonify([MedicalRecord.to_dict(rec) for rec in records])

@patients_bp.route('/records', methods=['POST'])
@jwt_required()
def create_record():
    current_user = get_current_user()
    user_id = current_user['id']
    data = request.get_json()
    
    # Get patient to find patient_id
    patient = Patient.find_by_user_id(user_id)
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    record = MedicalRecord.create(
        patient_id=patient['_id'],
        date=data['date'],
        record_type=data['type'],
        doctor=data['doctor'],
        description=data['description'],
        result=data.get('result', ''),
        notes=data.get('notes', '')
    )
    return jsonify(MedicalRecord.to_dict(record)), 201

@patients_bp.route('/records/<record_id>', methods=['PUT'])
@jwt_required()
def update_record(record_id):
    data = request.get_json()
    record = MedicalRecord.update(record_id, data)
    if record:
        return jsonify(MedicalRecord.to_dict(record))
    return jsonify({'error': 'Record not found'}), 404

@patients_bp.route('/records/<record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    result = MedicalRecord.delete(record_id)
    if result.deleted_count > 0:
        return jsonify({'message': 'Record deleted successfully'})
    return jsonify({'error': 'Record not found'}), 404

@patients_bp.route('/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient_by_id(patient_id):
    """Get patient details by user ID - for doctors to view patient info."""
    current_user = get_current_user()
    
    # Allow doctors to view patient details
    if current_user['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.find_by_user_id(patient_id)
    if patient:
        return jsonify(Patient.to_dict(patient))
    return jsonify({'error': 'Patient not found'}), 404


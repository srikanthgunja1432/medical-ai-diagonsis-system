from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..models.user import User
from ..models.patient import Patient
import json

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.find_by_email(email)
    if not user or not User.check_password(user, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Create identity as JSON string containing user info
    identity = json.dumps({'id': str(user['_id']), 'role': user['role']})
    access_token = create_access_token(identity=identity)
    return jsonify({
        'access_token': access_token, 
        'role': user['role'], 
        'id': str(user['_id'])
    })


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'patient')
    
    # Check if user already exists
    if User.find_by_email(email):
        return jsonify({'error': 'User already exists'}), 400
    
    # Create user
    user = User.create(email, password, role)
    
    # If patient, create patient profile
    if role == 'patient':
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        Patient.create(
            user_id=user['_id'],
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=data.get('phone', ''),
            address=data.get('address', '')
        )
    
    return jsonify({'message': 'User registered successfully', 'id': str(user['_id'])}), 201

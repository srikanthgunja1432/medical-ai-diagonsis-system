from flask import Blueprint, request, jsonify
import time

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/triage', methods=['POST'])
def triage():
    data = request.get_json()
    symptoms = data.get('symptoms', '').lower()
    
    # Mock AI Logic
    time.sleep(1) # Simulate processing delay
    
    suggestions = []
    if 'head' in symptoms or 'dizzy' in symptoms:
        suggestions = ['Neurology', 'General Practice']
    elif 'skin' in symptoms or 'rash' in symptoms or 'itch' in symptoms:
        suggestions = ['Dermatology']
    elif 'heart' in symptoms or 'chest' in symptoms:
        suggestions = ['Cardiology', 'Emergency']
    else:
        suggestions = ['General Practice']
        
    return jsonify({
        'symptoms': symptoms,
        'suggested_specialties': suggestions,
        'disclaimer': 'This is an AI-generated suggestion. Please consult a professional.'
    })

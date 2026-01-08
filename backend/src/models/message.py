from bson import ObjectId
from datetime import datetime
from ..database import get_db

MESSAGES_COLLECTION = 'messages'

class Message:
    """Chat Message model for doctor-patient communication."""
    
    @staticmethod
    def create(appointment_id, sender_id, sender_role, content):
        """Create a new chat message."""
        db = get_db()
        message_data = {
            'appointment_id': ObjectId(appointment_id) if isinstance(appointment_id, str) else appointment_id,
            'sender_id': ObjectId(sender_id) if isinstance(sender_id, str) else sender_id,
            'sender_role': sender_role,  # 'doctor' or 'patient'
            'content': content,
            'created_at': datetime.utcnow(),
            'read': False
        }
        result = db[MESSAGES_COLLECTION].insert_one(message_data)
        message_data['_id'] = result.inserted_id
        return message_data
    
    @staticmethod
    def find_by_appointment(appointment_id):
        """Get all messages for an appointment."""
        db = get_db()
        if isinstance(appointment_id, str):
            appointment_id = ObjectId(appointment_id)
        return list(db[MESSAGES_COLLECTION].find(
            {'appointment_id': appointment_id}
        ).sort('created_at', 1))
    
    @staticmethod
    def mark_as_read(appointment_id, reader_role):
        """Mark all messages as read for a reader."""
        db = get_db()
        if isinstance(appointment_id, str):
            appointment_id = ObjectId(appointment_id)
        # Mark messages from the other role as read
        other_role = 'patient' if reader_role == 'doctor' else 'doctor'
        db[MESSAGES_COLLECTION].update_many(
            {'appointment_id': appointment_id, 'sender_role': other_role},
            {'$set': {'read': True}}
        )
    
    @staticmethod
    def get_unread_count(appointment_id, reader_role):
        """Get count of unread messages."""
        db = get_db()
        if isinstance(appointment_id, str):
            appointment_id = ObjectId(appointment_id)
        other_role = 'patient' if reader_role == 'doctor' else 'doctor'
        return db[MESSAGES_COLLECTION].count_documents({
            'appointment_id': appointment_id,
            'sender_role': other_role,
            'read': False
        })
    
    @staticmethod
    def to_dict(message):
        """Convert message to dictionary."""
        return {
            'id': str(message['_id']),
            'appointmentId': str(message['appointment_id']),
            'senderId': str(message['sender_id']),
            'senderRole': message['sender_role'],
            'content': message['content'],
            'createdAt': message['created_at'].isoformat() if message.get('created_at') else None,
            'read': message.get('read', False)
        }

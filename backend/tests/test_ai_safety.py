import pytest
from unittest.mock import MagicMock, patch
from src.services.chatbot_service import get_system_prompt, process_message

@patch('src.services.chatbot_service.Doctor.find_all')
def test_system_prompt_contains_disclaimer(mock_find_all, app):
    """Test that the system prompt includes the required medical disclaimer."""
    mock_find_all.return_value = []
    
    with app.app_context():
        prompt = get_system_prompt()
        assert "Disclaimer: You are an AI assistant" in prompt or "consult a doctor" in prompt
        assert "Do not provide definitive medical diagnoses" in prompt or "medical advice" in prompt or "book an appointment" in prompt

@patch('src.services.chatbot_service.ChatGoogleGenerativeAI')
@patch('src.services.chatbot_service.ChatHistory')
def test_process_message_with_disclaimer_response(MockChatHistory, MockChatModel, app):
    """Test that the chatbot service correctly returns a response containing a disclaimer."""
    # Setup mock
    mock_chain = MagicMock()
    # The invoke method returns an object with a content attribute
    mock_chain.invoke.return_value = MagicMock(content="Here is some info. Disclaimer: Consult a doctor.")
    MockChatModel.return_value = mock_chain
    
    # Mock ChatHistory to avoid DB calls
    MockChatHistory.get_messages.return_value = []
    MockChatHistory.add_message.return_value = None
    
    # Mock Doctor.find_all if get_system_prompt is called inside process_message
    with patch('src.services.chatbot_service.Doctor.find_all') as mock_find_all:
        mock_find_all.return_value = []
        with app.app_context():
            response = process_message('user1', 'Hello')
            assert "Disclaimer" in response or "Consult a doctor" in response


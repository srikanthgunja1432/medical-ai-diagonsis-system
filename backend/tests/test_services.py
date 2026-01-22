import pytest
from unittest.mock import patch, MagicMock
from src.services.chatbot_service import process_message
from src.models.chat_history import ChatHistory

def test_process_message(app):
    """Test chatbot message processing with mocked LLM."""
    user_id = "507f1f77bcf86cd799439011"
    user_message = "I have a headache."
    ai_response_text = "I recommend seeing a GP."
    
    # Mock the LLM response
    mock_llm_response = MagicMock()
    mock_llm_response.content = ai_response_text
    
    # Patch the ChatGoogleGenerativeAI creation to return a mock
    with patch('src.services.chatbot_service.ChatGoogleGenerativeAI') as MockLLM:
        mock_instance = MockLLM.return_value
        mock_instance.invoke.return_value = mock_llm_response
        
        # Call the service
        response = process_message(user_id, user_message)
        
        # Verify response
        assert response == ai_response_text
        
        # Verify LLM was called
        mock_instance.invoke.assert_called_once()
        
        # Verify history was saved
        history = ChatHistory.get_messages(user_id)
        assert len(history) == 2
        assert history[0]['role'] == 'user'
        assert history[0]['content'] == user_message
        assert history[1]['role'] == 'assistant'
        assert history[1]['content'] == ai_response_text

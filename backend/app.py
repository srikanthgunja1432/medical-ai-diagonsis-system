from src import create_app

app = create_app()

# Import socketio after create_app since it initializes the socketio instance
from src.routes.video_call import socketio

if __name__ == '__main__':
    # Use socketio.run() for WebSocket support
    # eventlet is used as the async mode for better performance
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

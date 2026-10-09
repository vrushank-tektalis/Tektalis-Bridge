from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Room ID to list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # User ID to list of WebSockets (for direct notifications)
        self.user_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str = None, user_id: str = None):
        await websocket.accept()
        if room_id:
            if room_id not in self.active_connections:
                self.active_connections[room_id] = []
            self.active_connections[room_id].append(websocket)
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str = None, user_id: str = None):
        if room_id and room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

    async def send_to_user(self, user_id: str, message: str):
        await self.send_personal_message(message, user_id)

manager = ConnectionManager()
connection_manager = manager



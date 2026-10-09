from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.websockets.manager import manager
from app.services.chat_service import chat_service
from jose import jwt, JWTError
from app.core.config import settings
from app.db.database import get_db
from bson import ObjectId
import json

router = APIRouter()

async def get_user_from_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        return user_id
    except JWTError:
        return None

@router.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, token: str):
    user_id = await get_user_from_token(token)
    if not user_id:
        await websocket.close(code=1008)
        return

    # Verify user is a member of the room
    db = get_db()
    room = await db.chat_rooms.find_one({"room_id": room_id, "members": user_id})
    if not room:
        await websocket.close(code=1008)
        return

    # Fetch sender name
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    sender_name = user.get("full_name", "User") if user else "User"

    await manager.connect(websocket, room_id=room_id, user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                content = payload.get("content", data)
                message_type = payload.get("message_type", "text")
            except (json.JSONDecodeError, TypeError):
                content = data
                message_type = "text"

            # Save message to DB
            msg = await chat_service.send_message(
                room_id=room_id,
                sender_id=user_id,
                sender_name=sender_name,
                content=content,
                message_type=message_type,
            )
            # Broadcast serialized message
            broadcast_payload = json.dumps({
                "type": "message",
                "data": {
                    "message_id": msg.get("message_id"),
                    "room_id": room_id,
                    "sender_id": user_id,
                    "sender_name": sender_name,
                    "content": content,
                    "message_type": message_type,
                    "created_at": msg["created_at"].isoformat() if msg.get("created_at") else None,
                }
            })
            await manager.broadcast_to_room(broadcast_payload, room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id=room_id, user_id=user_id)

@router.websocket("/ws/notifications")
async def notifications_endpoint(websocket: WebSocket, token: str):
    user_id = await get_user_from_token(token)
    if not user_id:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Notifications are generally one-way, but allow ping-pong if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id=user_id)

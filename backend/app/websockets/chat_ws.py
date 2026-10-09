from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.websockets.manager import manager
from jose import jwt, JWTError
from app.core.config import settings
from app.db.database import get_db
from bson import ObjectId

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

    await manager.connect(websocket, room_id=room_id, user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming chat message (save to DB, broadcast)
            await manager.broadcast_to_room(f"{user_id}: {data}", room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id=room_id, user_id=user_id)
        await manager.broadcast_to_room(f"User left", room_id)

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

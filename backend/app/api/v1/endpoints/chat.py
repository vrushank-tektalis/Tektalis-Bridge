from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.services.chat_service import chat_service
from app.schemas.message import MessageCreate

router = APIRouter()


@router.get("/rooms")
async def get_rooms(current_user=Depends(get_current_user)):
    return await chat_service.get_user_rooms(str(current_user["_id"]))


@router.get("/rooms/{room_id}/messages")
async def get_messages(room_id: str, skip: int = 0, limit: int = 50, current_user=Depends(get_current_user)):
    return await chat_service.get_room_messages(room_id, str(current_user["_id"]), skip=skip, limit=limit)


@router.post("/rooms/{room_id}/messages", status_code=201)
async def send_message(room_id: str, data: MessageCreate, current_user=Depends(get_current_user)):
    """REST fallback for sending messages (WebSocket preferred)."""
    room = await chat_service.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")
    if str(current_user["_id"]) not in room.get("members", []):
        raise HTTPException(status_code=403, detail="You are not a member of this chat room")
    msg = await chat_service.send_message(
        room_id=room_id,
        sender_id=str(current_user["_id"]),
        sender_name=current_user.get("full_name", "User"),
        content=data.content,
        message_type=data.message_type,
    )
    return msg

from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user, require_admin
from app.services.ai_service import ai_service
from app.schemas.ai_request import AIAnalyzeRequest
from app.db.database import get_db
from bson import ObjectId
import uuid
from datetime import datetime

router = APIRouter()


@router.post("/analyze-project")
async def analyze_project(data: AIAnalyzeRequest, current_user=Depends(get_current_user)):
    if current_user["role"] not in ["CLIENT", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only clients and admins can analyze projects")

    user_id = str(current_user["_id"])
    request_id = str(uuid.uuid4())

    # Store the request
    db = get_db()
    await db.ai_requests.insert_one({
        "request_id": request_id,
        "client_id": user_id,
        "original_description": data.description,
        "status": "PENDING",
        "ai_response": None,
        "created_at": datetime.utcnow(),
        "completed_at": None,
    })

    # Call AI
    try:
        result = await ai_service.analyze_project(data.description)
        await db.ai_requests.update_one(
            {"request_id": request_id},
            {"$set": {"status": "COMPLETED", "ai_response": result.model_dump(), "completed_at": datetime.utcnow()}}
        )
        return {"request_id": request_id, "status": "COMPLETED", "requirements": result}
    except Exception as e:
        await db.ai_requests.update_one(
            {"request_id": request_id},
            {"$set": {"status": "FAILED", "error": str(e), "completed_at": datetime.utcnow()}}
        )
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@router.get("/requests/{request_id}")
async def get_ai_request(request_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    req = await db.ai_requests.find_one({"request_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="AI request not found")
    if current_user["role"] != "ADMIN" and req.get("client_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    req["id"] = str(req["_id"])
    del req["_id"]
    return req

from app.db.database import get_db

async def generate_id(prefix: str) -> str:
    """Generate human-readable IDs like PRJ-001, DEV-001, TSK-001"""
    db = get_db()
    result = await db.id_counters.find_one_and_update(
        {"prefix": prefix},
        {"$inc": {"count": 1}},
        upsert=True,
        return_document=True
    )
    count = result.get("count", 1)
    return f"{prefix}-{count:04d}"

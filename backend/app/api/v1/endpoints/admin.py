from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user, require_admin
from app.db.database import get_db

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(current_user=Depends(require_admin)):
    db = get_db()
    total_clients = await db.users.count_documents({"role": "CLIENT", "is_deleted": False})
    total_developers = await db.users.count_documents({"role": "DEVELOPER", "is_deleted": False})
    total_projects = await db.projects.count_documents({"is_deleted": False})
    active_projects = await db.projects.count_documents({"status": "ACTIVE", "is_deleted": False})
    completed_projects = await db.projects.count_documents({"status": "COMPLETED", "is_deleted": False})
    in_development = await db.projects.count_documents({"current_stage": "DEVELOPMENT", "is_deleted": False})
    in_testing = await db.projects.count_documents({"current_stage": "TESTING", "is_deleted": False})
    in_deployment = await db.projects.count_documents({"current_stage": "DEPLOYMENT", "is_deleted": False})
    open_bugs = await db.bugs.count_documents({
        "status": {"$in": ["OPEN", "ASSIGNED", "IN_PROGRESS", "REOPENED"]},
        "is_deleted": False
    })
    pending_requests = await db.developer_requests.count_documents({"status": "PENDING", "is_deleted": False})

    # Recent projects
    recent_projects_cursor = db.projects.find({"is_deleted": False}).sort("created_at", -1).limit(5)
    recent_projects = await recent_projects_cursor.to_list(length=5)
    for p in recent_projects:
        p["id"] = str(p["_id"])
        del p["_id"]

    # Pending requests
    pending_reqs_cursor = db.developer_requests.find({"status": "PENDING", "is_deleted": False}).sort("created_at", -1).limit(5)
    pending_reqs = await pending_reqs_cursor.to_list(length=5)
    for r in pending_reqs:
        r["id"] = str(r["_id"])
        del r["_id"]

    return {
        "stats": {
            "total_clients": total_clients,
            "total_developers": total_developers,
            "total_projects": total_projects,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "in_development": in_development,
            "in_testing": in_testing,
            "in_deployment": in_deployment,
            "open_bugs": open_bugs,
            "pending_requests": pending_requests,
        },
        "recent_projects": recent_projects,
        "pending_requests": pending_reqs,
    }


@router.get("/analytics")
async def admin_analytics(current_user=Depends(require_admin)):
    db = get_db()

    # Projects by status
    status_pipeline = [
        {"$match": {"is_deleted": False}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_data = await db.projects.aggregate(status_pipeline).to_list(length=None)
    projects_by_status = [{"name": item["_id"], "value": item["count"]} for item in status_data]

    # Projects by stage
    stage_pipeline = [
        {"$match": {"is_deleted": False}},
        {"$group": {"_id": "$current_stage", "count": {"$sum": 1}}}
    ]
    stage_data = await db.projects.aggregate(stage_pipeline).to_list(length=None)
    projects_by_stage = [{"stage": item["_id"], "count": item["count"]} for item in stage_data]

    # Developers per project (utilization)
    dev_pipeline = [
        {"$match": {"is_deleted": False}},
        {"$project": {"assigned_developers": 1}},
        {"$unwind": "$assigned_developers"},
        {"$group": {"_id": "$assigned_developers", "project_count": {"$sum": 1}}}
    ]
    dev_data = await db.projects.aggregate(dev_pipeline).to_list(length=None)
    # Enrich with developer names
    from bson import ObjectId
    developer_utilization = []
    for item in dev_data:
        user = await db.users.find_one({"_id": ObjectId(item["_id"])})
        name = user.get("full_name", item["_id"]) if user else item["_id"]
        developer_utilization.append({"name": name, "projects": item["project_count"]})

    # Projects per client
    client_pipeline = [
        {"$match": {"is_deleted": False}},
        {"$group": {"_id": "$client_id", "count": {"$sum": 1}}}
    ]
    client_data = await db.projects.aggregate(client_pipeline).to_list(length=None)
    projects_per_client = []
    for item in client_data:
        user = await db.users.find_one({"_id": ObjectId(item["_id"])})
        name = user.get("full_name", item["_id"]) if user else item["_id"]
        projects_per_client.append({"name": name, "projects": item["count"]})

    # Bugs by severity
    bug_pipeline = [
        {"$match": {"is_deleted": False}},
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
    ]
    bug_data = await db.bugs.aggregate(bug_pipeline).to_list(length=None)
    bugs_by_severity = [{"name": item["_id"], "value": item["count"]} for item in bug_data]

    return {
        "projects_by_status": projects_by_status,
        "projects_by_stage": projects_by_stage,
        "developer_utilization": developer_utilization,
        "projects_per_client": projects_per_client,
        "bugs_by_severity": bugs_by_severity,
    }

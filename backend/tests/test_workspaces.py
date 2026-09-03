import io
import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["database"] == "ok"


@pytest.mark.asyncio
async def test_create_and_get_workspace(client):
    # 1. Create workspace
    payload = {
        "name": "CHEM 201 - Organic Chemistry",
        "course_code": "CHEM 201",
        "description": "Midterm and final exam preparation materials."
    }
    create_res = await client.post("/api/workspaces", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["name"] == payload["name"]
    assert created_data["course_code"] == payload["course_code"]
    ws_id = created_data["id"]

    # 2. List workspaces
    list_res = await client.get("/api/workspaces")
    assert list_res.status_code == 200
    workspaces = list_res.json()
    assert len(workspaces) >= 1
    assert any(w["id"] == ws_id for w in workspaces)

    # 3. Get workspace by id
    get_res = await client.get(f"/api/workspaces/{ws_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == ws_id


@pytest.mark.asyncio
async def test_upload_file_to_workspace(client):
    # Create workspace
    create_res = await client.post("/api/workspaces", json={"name": "PHY 101"})
    ws_id = create_res.json()["id"]

    # Upload mock past questions text file
    file_content = (
        "Question 1: State and explain Newton's First Law of Motion. [5 marks]\n\n"
        "Question 2: Derive the equation for kinetic energy from first principles. [10 marks]\n\n"
        "Question 3: A projectile is launched at 45 degrees. Calculate its maximum height. [15 marks]\n"
    ).encode("utf-8")

    files = {
        "file": ("2022_physics_past_questions.txt", io.BytesIO(file_content), "text/plain")
    }
    data = {
        "upload_type": "past_questions",
        "inferred_year": "2022"
    }

    upload_res = await client.post(f"/api/workspaces/{ws_id}/uploads", data=data, files=files)
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    assert upload_data["file_name"] == "2022_physics_past_questions.txt"
    assert upload_data["upload_type"] == "past_questions"
    assert upload_data["inferred_year"] == "2022"

    # List uploads
    list_uploads_res = await client.get(f"/api/workspaces/{ws_id}/uploads")
    assert list_uploads_res.status_code == 200
    assert len(list_uploads_res.json()) == 1

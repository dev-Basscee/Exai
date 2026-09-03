import asyncio
import io
import pytest


@pytest.mark.asyncio
async def test_end_to_end_prediction_pipeline(client):
    # 1. Create a workspace
    ws_res = await client.post("/api/workspaces", json={
        "name": "PHYS 101 - General Physics",
        "course_code": "PHYS 101",
        "description": "Mechanics and Waves"
    })
    assert ws_res.status_code == 201
    ws_id = ws_res.json()["id"]

    # 2. Upload Year 2021 Past Questions
    pq_2021 = (
        "Question 1: State and explain Newton's First Law of Motion. [5 marks]\n\n"
        "Question 2: Define simple harmonic motion and write down its governing differential equation. [10 marks]\n\n"
        "Question 3: Calculate the escape velocity from the surface of the Earth. [15 marks]\n"
    ).encode("utf-8")

    await client.post(
        f"/api/workspaces/{ws_id}/uploads",
        data={"upload_type": "past_questions", "inferred_year": "2021"},
        files={"file": ("physics_exam_2021.txt", io.BytesIO(pq_2021), "text/plain")}
    )

    # 3. Upload Year 2023 Past Questions (repeated Newton's First Law + SHM)
    pq_2023 = (
        "Question 1: Explain Newton's First Law of Motion with two everyday practical examples. [6 marks]\n\n"
        "Question 2: State the definition of Simple Harmonic Motion (SHM). [5 marks]\n\n"
        "Question 3: Derive Bernoulli's equation for steady, incompressible fluid flow. [20 marks]\n"
    ).encode("utf-8")

    await client.post(
        f"/api/workspaces/{ws_id}/uploads",
        data={"upload_type": "past_questions", "inferred_year": "2023"},
        files={"file": ("physics_exam_2023.txt", io.BytesIO(pq_2023), "text/plain")}
    )

    # 4. Upload Lecture Notes (Study Material for RAG)
    lecture_notes = (
        "CHAPTER 1: LAWS OF MOTION\n\n"
        "Newton's First Law states that every object will remain at rest or in uniform motion "
        "in a straight line unless compelled to change its state by the action of an external force. "
        "This is also known as the Law of Inertia. Key examples include a passenger lunging forward "
        "when a car brakes abruptly.\n\n"
        "CHAPTER 2: OSCILLATIONS\n\n"
        "Simple Harmonic Motion (SHM) is a repetitive back-and-forth movement through a central equilibrium position. "
        "The restoring force is directly proportional to displacement and acts in the opposite direction: F = -kx. "
        "The governing differential equation is d^2x/dt^2 + omega^2 * x = 0.\n"
    ).encode("utf-8")

    await client.post(
        f"/api/workspaces/{ws_id}/uploads",
        data={"upload_type": "study_material"},
        files={"file": ("physics_lecture_notes.txt", io.BytesIO(lecture_notes), "text/plain")}
    )

    # 5. Trigger Processing Pipeline
    process_res = await client.post(f"/api/workspaces/{ws_id}/process")
    assert process_res.status_code == 202
    job_id = process_res.json()["id"]

    # 6. Poll for completion (should complete rapidly with MockLLMProvider)
    for _ in range(20):
        await asyncio.sleep(0.5)
        status_res = await client.get(f"/api/workspaces/{ws_id}/status")
        assert status_res.status_code == 200
        job_data = status_res.json()
        if job_data["status"] in ["completed", "failed"]:
            break

    assert job_data["status"] == "completed", f"Job failed: {job_data.get('error_message')}"
    assert job_data["progress_percentage"] == 100

    # 7. Verify Predictions
    preds_res = await client.get(f"/api/workspaces/{ws_id}/predictions?sort_by=recommended")
    assert preds_res.status_code == 200
    predictions = preds_res.json()
    assert len(predictions) >= 3

    # Check recurrence detection: Newton's First law or SHM should have frequency_count >= 2
    recurrent = [p for p in predictions if p["frequency_count"] >= 2]
    assert len(recurrent) >= 1, "Expected at least one recurrent question cluster across 2021 and 2023"

    # Check that explanation is generated
    first_pred = predictions[0]
    assert first_pred["explanation"] is not None
    assert len(first_pred["explanation"]["explanation_text"]) > 50

    # 8. Test user feedback (US-6: Mark as hard & reviewed)
    fb_res = await client.patch(
        f"/api/predictions/{first_pred['id']}/feedback",
        json={"marked_hard": True, "marked_reviewed": True, "notes": "Need to memorize derivation"}
    )
    assert fb_res.status_code == 200
    fb_data = fb_res.json()
    assert fb_data["marked_hard"] is True
    assert fb_data["marked_reviewed"] is True

    # 9. Verify detail view
    detail_res = await client.get(f"/api/predictions/{first_pred['id']}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["variants"]) >= 1
    assert detail_data["feedback"]["marked_hard"] is True

import io
import pytest


@pytest.mark.asyncio
async def test_predictions_filtering_and_feedback(client):
    # Create workspace
    ws_res = await client.post("/api/workspaces", json={"name": "BIO 101 - Introductory Biology"})
    ws_id = ws_res.json()["id"]

    # Upload Past questions
    pq_data = (
        "Question 1: Describe the process of photosynthesis in C3 plants. [10 marks]\n\n"
        "Question 2: Explain the stages of mitosis with diagrams. [15 marks]\n\n"
        "Question 3: Discuss Mendelian genetics and the law of segregation. [12 marks]\n"
    ).encode("utf-8")

    await client.post(
        f"/api/workspaces/{ws_id}/uploads",
        data={"upload_type": "past_questions", "inferred_year": "2023"},
        files={"file": ("bio_2023.txt", io.BytesIO(pq_data), "text/plain")}
    )

    # Process
    proc_res = await client.post(f"/api/workspaces/{ws_id}/process")
    assert proc_res.status_code == 202

    # Get predictions
    preds_res = await client.get(f"/api/workspaces/{ws_id}/predictions?sort_by=difficulty_high")
    assert preds_res.status_code == 200
    preds = preds_res.json()
    assert len(preds) == 3

    # Check sorting: highest difficulty first
    assert preds[0]["difficulty_score"] >= preds[1]["difficulty_score"] >= preds[2]["difficulty_score"]

    # Mark first prediction as hard
    target_id = preds[0]["id"]
    patch_res = await client.patch(f"/api/predictions/{target_id}/feedback", json={"marked_hard": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["marked_hard"] is True

    # Filter with hard_only=True
    hard_res = await client.get(f"/api/workspaces/{ws_id}/predictions?hard_only=true")
    assert hard_res.status_code == 200
    hard_preds = hard_res.json()
    assert len(hard_preds) == 1
    assert hard_preds[0]["id"] == target_id

    # Test regenerating explanation
    regen_res = await client.post(
        f"/api/predictions/{target_id}/generate-explanation",
        json={"force_regenerate": True, "custom_instructions": "Include mnemonic devices"}
    )
    assert regen_res.status_code == 200
    assert regen_res.json()["cluster_id"] == target_id
    assert len(regen_res.json()["explanation_text"]) > 20

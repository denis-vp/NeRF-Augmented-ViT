import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.mark.parametrize("model_name,expected_status", [
    ("base_vitb", 200),
    ("non_existent_model", 400),
])
def test_select_model(model_name, expected_status):
    response = client.post("/depth-anything-v2/select", json={"model_name": model_name})
    assert response.status_code == expected_status

def test_current_model():
    response = client.get("/depth-anything-v2/current")
    assert response.status_code == 200
    assert "status" in response.json()

def test_predict_depth_valid():
    with open("tests/assets/depth_img.png", "rb") as f:
        response = client.post("/depth-anything-v2/predict", files={"file": ("depth_img.png", f, "image/png")})
    assert response.status_code == 200

@pytest.mark.parametrize("file_payload,expected_status", [
    ({}, (400, 422)),
    ({"file": ("fake.txt", open("tests/assets/fake.txt", "rb"), "text/plain")}, (400, 422)),
])
def test_predict_depth_invalid_cases(file_payload, expected_status):
    response = client.post("/depth-anything-v2/predict", files=file_payload)
    assert response.status_code in expected_status
    if "file" in file_payload:
        file_payload["file"][1].close()

@pytest.mark.parametrize("model_name,expected_status", [
    ("base", 200),
    ("non_existent_model", 400),
])
def test_select_roma(model_name, expected_status):
    response = client.post("/tiny-roma/select", json={"model_name": model_name})
    assert response.status_code == expected_status

def test_current_roma_model():
    response = client.get("/tiny-roma/current")
    assert response.status_code == 200
    assert "status" in response.json()

def test_predict_roma_valid():
    with open("tests/assets/roma_imgA.png", "rb") as f1, open("tests/assets/roma_imgB.png", "rb") as f2:
        response = client.post("/tiny-roma/predict", files={
            "file1": ("roma_imgA.png", f1, "image/png"),
            "file2": ("roma_imgB.png", f2, "image/png")
        })
    assert response.status_code == 200

@pytest.mark.parametrize("files,expected_status", [
    ({"file1": ("roma_imgA.png", open("tests/assets/roma_imgA.png", "rb"), "image/png")}, (400, 422)),
    ({
         "file1": ("fake.txt", open("tests/assets/fake.txt", "rb"), "text/plain"),
         "file2": ("fake.txt", open("tests/assets/fake.txt", "rb"), "text/plain")
     }, (400, 422)),
])
def test_predict_roma_invalid_cases(files, expected_status):
    response = client.post("/tiny-roma/predict", files=files)
    assert response.status_code in expected_status
    for file in files.values():
        file[1].close()

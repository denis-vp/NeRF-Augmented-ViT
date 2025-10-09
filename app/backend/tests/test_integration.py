import numpy as np
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from main import app
import io
from PIL import Image
import src.routes.depth_route as depth_route
import src.routes.roma_route as roma_route

client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_depth_model(monkeypatch):
    mock_manager = MagicMock()
    mock_manager.select_model.return_value = {"model_name": "mock_model"}
    mock_manager.get_spec.return_value = {"model_name": "mock_model"}
    mock_manager.predict.return_value = np.array([[0.1] * 3] * 3)

    monkeypatch.setattr(depth_route, "depth_manager", mock_manager)


@pytest.fixture(autouse=True)
def mock_roma_model(monkeypatch):
    mock_manager = MagicMock()
    mock_manager.select_model.return_value = {"model_name": "mock_model"}
    mock_manager.get_spec.return_value = {"model_name": "mock_model"}
    mock_manager.predict.return_value = {
        "kptsA": [[10, 20]], "kptsB": [[15, 25]],
        "F": None, "matches": [], "certainty": [],
        "H_A": 100, "W_A": 100, "H_B": 100, "W_B": 100
    }

    monkeypatch.setattr(roma_route, "roma_manager", mock_manager)


def test_depth_select_model():
    res = client.post("/depth-anything-v2/select", json={"model_name": "mock_model"})
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_depth_predict_with_mock_image():
    import io
    from PIL import Image
    img = Image.new("RGB", (100, 100), color="white")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    res = client.post("/depth-anything-v2/predict", files={"file": ("test.png", img_bytes, "image/png")})
    assert res.status_code == 200


def test_roma_select_model():
    res = client.post("/tiny-roma/select", json={"model_name": "mock_model"})
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_roma_predict_with_mock_images():
    img1 = Image.new("RGB", (10, 10), color="blue")
    img2 = Image.new("RGB", (10, 10), color="green")
    b1 = io.BytesIO();
    b2 = io.BytesIO()
    img1.save(b1, format="JPEG");
    img2.save(b2, format="JPEG")
    b1.seek(0);
    b2.seek(0)

    res = client.post("/tiny-roma/predict", files={
        "file1": ("a.jpg", b1, "image/jpeg"),
        "file2": ("b.jpg", b2, "image/jpeg")
    })
    assert res.status_code == 200

import pytest

from src.config import DEPTH_CHECKPOINT_DIR
from src.model_mangers.depth_manager import DepthManager

import src.model_mangers.depth_manager as dm


@pytest.fixture
def depth_manager():
    return DepthManager()


def test_load_model_valid(monkeypatch, depth_manager):
    monkeypatch.setitem(
        dm.DEPTH_MODELS,
        "base_vitb_simulated",
        {
            'checkpoint': DEPTH_CHECKPOINT_DIR / 'depth_anything_v2_vitb.pth',
            'encoder': 'vitb'
        }
    )

    try:
        depth_manager._load_model("base_vitb_simulated")
    except Exception:
        pytest.fail("Unexpected error when loading valid model")


def test_load_model_invalid_encoder(monkeypatch, depth_manager):
    monkeypatch.setitem(dm.DEPTH_MODELS, "fake_model", {"encoder": "not_an_encoder"})

    with pytest.raises(ValueError) as e:
        depth_manager._load_model("fake_model")
    assert "Unsupported encoder type" in str(e.value)


def test_load_model_missing_model(monkeypatch, depth_manager):
    monkeypatch.setattr(dm, "DEPTH_MODELS", {})

    with pytest.raises(ValueError):
        depth_manager._load_model("missing_model")

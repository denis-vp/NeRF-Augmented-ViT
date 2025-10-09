import pytest

from src.config import ROMA_CHECKPOINT_DIR
from src.model_mangers.roma_manager import RomaManager

import src.model_mangers.roma_manager as rm
from unittest.mock import MagicMock

@pytest.fixture
def roma_manager():
    return RomaManager()

def test_load_model_valid(monkeypatch, roma_manager):
    monkeypatch.setitem(
        rm.ROMA_MODELS,
        "base_simulated",
        {
            'checkpoint': ROMA_CHECKPOINT_DIR / 'tiny_roma_v1_outdoor.pth',
        }
    )

    try:
        roma_manager._load_model("base_simulated")
    except Exception:
        pytest.fail("Unexpected error during valid ROMA model loading")

def test_load_model_invalid_name(monkeypatch, roma_manager):
    monkeypatch.setattr(rm, "ROMA_MODELS", {})

    with pytest.raises(ValueError) as e:
        roma_manager._load_model("non_existent")
    assert "not found in ROMA_MODELS" in str(e.value)

def test_load_model_bad_checkpoint(monkeypatch, roma_manager):
    mock_ckpt = MagicMock()
    mock_ckpt.is_file.return_value = False
    monkeypatch.setitem(rm.ROMA_MODELS, "base", {"checkpoint": mock_ckpt})

    with pytest.raises(ValueError) as e:
        roma_manager._load_model("base")
    assert "checkpoint" in str(e.value).lower()

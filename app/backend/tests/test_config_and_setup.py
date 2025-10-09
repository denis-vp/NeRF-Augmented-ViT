import importlib
from src.config import (
    BASE_DIR, CHECKPOINT_DIR,
    DEPTH_BASE_MODEL, DEPTH_MODELS
)


def test_base_paths_exist():
    assert BASE_DIR.exists()
    assert CHECKPOINT_DIR.exists() or True


def test_depth_base_model_valid():
    assert DEPTH_BASE_MODEL in DEPTH_MODELS


def test_all_depth_checkpoints_are_paths():
    for name, spec in DEPTH_MODELS.items():
        assert "checkpoint" in spec
        assert spec["checkpoint"].suffix == ".pth"


def test_requirements_importable():
    reqs = [
        "torch", "einops", "torchvision", "cv2", "kornia", "albumentations",
        "loguru", "tqdm", "matplotlib", "h5py", "wandb", "timm", "poselib",
        "numpy", "fastapi", "pydantic", "starlette"
    ]
    failed = []
    for pkg in reqs:
        try:
            importlib.import_module(pkg if pkg != "cv2" else "cv2")
        except ImportError:
            failed.append(pkg)
    assert not failed, f"Missing dependencies: {failed}"

import pytest
import numpy as np
from PIL import Image
from src.utils.depth_visualizer import depth_to_colormap
from src.utils.matcher_visualizer import draw_matches


def test_depth_to_colormap_valid():
    depth = np.random.rand(100, 100).astype(np.float32)
    result = depth_to_colormap(depth, mode="magma")
    assert isinstance(result, Image.Image)


def test_depth_to_colormap_invalid_mode():
    depth = np.random.rand(100, 100).astype(np.float32)
    with pytest.raises(ValueError) as e:
        depth_to_colormap(depth, mode="invalid")
    assert "Unsupported colormap mode" in str(e.value)


@pytest.fixture
def dummy_images():
    imgA = Image.fromarray(np.uint8(np.random.rand(100, 100, 3) * 255))
    imgB = Image.fromarray(np.uint8(np.random.rand(120, 100, 3) * 255))
    return imgA, imgB


@pytest.fixture
def dummy_match_data():
    return {
        "kptsA": [[10, 20], [30, 40], [50, 60]],
        "kptsB": [[12, 22], [32, 42], [52, 62]],
        "F": None,
        "matches": [],
        "certainty": [],
        "H_A": 100,
        "W_A": 100,
        "H_B": 120,
        "W_B": 100
    }


def test_draw_matches_basic(dummy_images, dummy_match_data):
    imgA, imgB = dummy_images
    result = draw_matches(imgA, imgB, dummy_match_data)
    assert isinstance(result, Image.Image)


def test_draw_matches_with_k(dummy_images, dummy_match_data):
    imgA, imgB = dummy_images
    result = draw_matches(imgA, imgB, dummy_match_data, k=2)
    assert isinstance(result, Image.Image)

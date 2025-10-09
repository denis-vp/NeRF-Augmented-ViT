from pathlib import Path
import torch

BASE_DIR = Path(__file__).resolve().parent.parent
CHECKPOINT_DIR = BASE_DIR / "checkpoints"

ROMA_CHECKPOINT_DIR = CHECKPOINT_DIR / "tiny_RoMa"
DEPTH_CHECKPOINT_DIR = CHECKPOINT_DIR / "Depth-Anything-V2"

DEPTH_BASE_MODEL = 'base_vitb'
DEPTH_MODELS = {
    'base_vitl': {
        'checkpoint': DEPTH_CHECKPOINT_DIR / 'depth_anything_v2_vitl.pth',
        'encoder': 'vitl'
    },
    'base_vitb': {
        'checkpoint': DEPTH_CHECKPOINT_DIR / 'depth_anything_v2_vitb.pth',
        'encoder': 'vitb'
    },
    '0097_vitb': {
        'checkpoint': DEPTH_CHECKPOINT_DIR / '0097_best_vitb_ep118.pth',
        'encoder': 'vitb'
    },
    '0097_vitl': {
        'checkpoint': DEPTH_CHECKPOINT_DIR / '0097_best_vitl_ep018.pth',
        'encoder': 'vitl'
    },
    'fire': {
        'checkpoint': DEPTH_CHECKPOINT_DIR / 'fire_best_vitb_ep036.pth',
        'encoder': 'vitb'
    },
    'fire_nerf': {
        'checkpoint': DEPTH_CHECKPOINT_DIR / 'fire_nerf_best_vitb_ep030.pth',
        'encoder': 'vitb'
    }
}

ROMA_BASE_MODEL = 'base'
ROMA_MODELS = {
    'base': {
        'checkpoint': ROMA_CHECKPOINT_DIR / 'tiny_roma_v1_outdoor.pth',
    },
    '0080': {
        'checkpoint': ROMA_CHECKPOINT_DIR / '0080_tiny_roma_ep100.pth',
    },
    'fire': {
        'checkpoint': ROMA_CHECKPOINT_DIR / 'fire_tiny_roma_ep100.pth',
    },
    'fire_nerf': {
        'checkpoint': ROMA_CHECKPOINT_DIR / 'fire_nerf_tiny_roma_ep100.pth',
    }
}

if torch.cuda.is_available():
    DEVICE = "cuda"
elif torch.backends.mps.is_available():
    DEVICE = "mps"
else:
    DEVICE = "cpu"

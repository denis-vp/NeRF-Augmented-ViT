from abc import ABC

import cv2
import numpy as np
import torch

from src.config import DEPTH_BASE_MODEL, DEVICE, DEPTH_MODELS
from src.model_mangers.model_manager import ModelManager
from src.third_party.depth_anything_v2.dpt import DepthAnythingV2


class DepthManager(ModelManager, ABC):
    def __init__(self, base_model: str = DEPTH_BASE_MODEL):
        super().__init__("depth_anything", base_model)

    def _load_model(self, model_name: str, device=DEVICE):
        """
        Load the specified Depth-Anything-V2 model and its configuration.
        :param model_name: str, name of the model to load
        :param device: str, device to run the model on (default: DEVICE)
        :return: None
        """
        cfgs = {
            'vits': {'encoder': 'vits', 'features': 64, 'out_channels': [48, 96, 192, 384]},
            'vitb': {'encoder': 'vitb', 'features': 128, 'out_channels': [96, 192, 384, 768]},
            'vitl': {'encoder': 'vitl', 'features': 256, 'out_channels': [256, 512, 1024, 1024]},
            'vitg': {'encoder': 'vitg', 'features': 384, 'out_channels': [1536, 1536, 1536, 1536]}
        }

        if model_name not in DEPTH_MODELS:
            raise ValueError(f"Model '{model_name}' not found in DEPTH_MODELS")

        encoder = DEPTH_MODELS[model_name]['encoder']
        if encoder not in cfgs:
            raise ValueError(f"Unsupported encoder type: {encoder}")

        if self._current_model is None:
            self._current_model = DepthAnythingV2(**cfgs[encoder])
        else:
            current_encoder = DEPTH_MODELS[self._current_spec['model_name']]['encoder']
            if encoder != current_encoder:
                self._current_model = DepthAnythingV2(**cfgs[encoder])

        ckpt = DEPTH_MODELS[model_name]['checkpoint']
        if not ckpt.is_file():
            raise ValueError(f"Checkpoint '{ckpt}' not found")

        state_dict = torch.load(ckpt, map_location=device)
        self._current_model.load_state_dict(state_dict)

    def predict(self, image_bytes: bytes, normalize: bool = True, device=DEVICE):
        """
        Predict the depth map from the input image bytes.
        :param image_bytes: bytes, raw image data
        :param normalize: bool, whether to normalize the depth map
        :param device: str, device to run the model on (default: DEVICE)
        :return: np.ndarray, depth map
        """
        with self._lock:
            img = DepthManager.__preprocess(image_bytes)
            with torch.no_grad():
                depth = self._current_model.infer_image(img)
                if isinstance(depth, torch.Tensor):
                    depth = depth.cpu().numpy()
            return DepthManager.__postprocess(depth) if normalize else depth

    @staticmethod
    def __preprocess(image_bytes: bytes) -> np.ndarray:
        """
        Preprocess the input image bytes into a format suitable for depth estimation.
        :param image_bytes: bytes, raw image data
        :return: np.ndarray, preprocessed image
        """
        arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Cannot decode image")
        return img

    @staticmethod
    def __postprocess(depth: np.ndarray) -> np.ndarray:
        """
        Postprocess the depth map to normalize it.
        :param depth: np.ndarray, raw depth map
        :return: np.ndarray, normalized depth map
        """
        d = depth.astype(np.float32).copy()
        d -= d.min()
        d /= (d.max() + 1e-8)
        return d

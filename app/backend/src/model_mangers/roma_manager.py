from abc import ABC
from typing import TypedDict

import cv2
import numpy as np
import torch

from src.config import ROMA_MODELS, DEVICE, ROMA_BASE_MODEL
from src.model_mangers.model_manager import ModelManager
from src.third_party.romatch import tiny_roma_v1_outdoor


class RomaPrediction(TypedDict):
    F: list[list[float]] | None
    kptsA: list[list[float]]
    kptsB: list[list[float]]
    matches: list[list[float]]
    certainty: list[float]
    H_A: int
    W_A: int
    H_B: int
    W_B: int


class RomaManager(ModelManager, ABC):
    def __init__(self, base_model: str = ROMA_BASE_MODEL):
        super().__init__("tiny_roma", base_model)

    def _load_model(self, model_name: str, device=DEVICE):
        """
        Load the specified Tiny RoMa model and its configuration.
        :param model_name: str, name of the model to load
        :param device: str, device to run the model on (default: DEVICE)
        :return: None
        """
        if self._current_model is None:
            self._current_model = tiny_roma_v1_outdoor(device=device)

        if model_name not in ROMA_MODELS:
            raise ValueError(f"Model '{model_name}' not found in ROMA_MODELS")

        ckpt = ROMA_MODELS[model_name]['checkpoint']
        if not ckpt.is_file():
            raise ValueError(f"Checkpoint '{ckpt}' not found")

        state_dict = torch.load(ckpt, map_location=device)
        self._current_model.load_state_dict(state_dict)

    def predict(self, imA_path: str, imB_path: str, device=DEVICE) -> RomaPrediction:
        """
        Predict the fundamental matrix and keypoints matches between two images.
        :param imA_path: str, path to the first image
        :param imB_path: str, path to the second image
        :param device: str, device to run the model on (default: DEVICE)
        :return: RomaPrediction, a dictionary containing the fundamental matrix, keypoints, matches, and image dimensions
        """
        with self._lock:
            imA, H_A, W_A = RomaManager.__preprocess(imA_path)
            imB, H_B, W_B = RomaManager.__preprocess(imB_path)

            with torch.no_grad():
                warp, certainty = self._current_model.match(imA_path, imB_path)
                matches, certainty = self._current_model.sample(warp, certainty)
                kptsA, kptsB = self._current_model.to_pixel_coordinates(matches, H_A, W_A, H_B, W_B)

            F, mask = cv2.findFundamentalMat(
                kptsA.cpu().numpy(), kptsB.cpu().numpy(), ransacReprojThreshold=0.2,
                method=cv2.USAC_MAGSAC, confidence=0.999999, maxIters=10000
            )

            return {
                "F": F.tolist() if F is not None else None,
                "kptsA": kptsA[mask.ravel() == 1].cpu().numpy().tolist(),
                "kptsB": kptsB[mask.ravel() == 1].cpu().numpy().tolist(),
                "matches": matches[mask.ravel() == 1].cpu().numpy().tolist(),
                "certainty": certainty[mask.ravel() == 1].cpu().numpy().tolist(),
                "H_A": H_A,
                "W_A": W_A,
                "H_B": H_B,
                "W_B": W_B
            }

    @staticmethod
    def __preprocess(image_path: str) -> tuple[np.ndarray, int, int]:
        """
        Preprocess the image by reading it from the given path.
        :param image_path: str, path to the image file
        :return: tuple[np.ndarray, int, int], the image as a numpy array and its height and width
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Cannot read image from {image_path}")
        h, w = img.shape[:2]
        return img, h, w

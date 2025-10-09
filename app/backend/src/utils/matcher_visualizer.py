import numpy as np
import cv2
from PIL import Image

from src.model_mangers.roma_manager import RomaPrediction

def draw_matches(imgA: Image, imgB: Image, match_data: RomaPrediction, k: int = None) -> Image:
    """
    Draws matches between two images based on keypoints and matches data.
    :param imgA: PIL Image, first image
    :param imgB: PIL Image, second image
    :param match_data: RomaPrediction, contains keypoints and matches data
    :param k: int, number of matches to draw (if None, all matches are drawn)
    :return: PIL Image, image with matches drawn
    """
    kptsA = match_data["kptsA"]
    kptsB = match_data["kptsB"]

    if k is not None:
        kptsA = kptsA[:k]
        kptsB = kptsB[:k]

    imgA_cv = np.array(imgA.convert("RGB"))
    imgB_cv = np.array(imgB.convert("RGB"))

    max_height = max(imgA_cv.shape[0], imgB_cv.shape[0])
    if imgA_cv.shape[0] < max_height:
        imgA_cv = cv2.copyMakeBorder(imgA_cv, 0, max_height - imgA_cv.shape[0], 0, 0, cv2.BORDER_CONSTANT, value=0)
    if imgB_cv.shape[0] < max_height:
        imgB_cv = cv2.copyMakeBorder(imgB_cv, 0, max_height - imgB_cv.shape[0], 0, 0, cv2.BORDER_CONSTANT, value=0)

    canvas = np.hstack((imgA_cv, imgB_cv))

    offset = imgA_cv.shape[1]

    for ptA, ptB in zip(kptsA, kptsB):
        pt1 = tuple(np.round(ptA).astype(int))
        pt2 = tuple(np.round(ptB).astype(int) + np.array([offset, 0]))
        cv2.line(canvas, pt1, pt2, color=(0, 255, 0), thickness=1)
        cv2.circle(canvas, pt1, 2, (255, 0, 0), -1)
        cv2.circle(canvas, pt2, 2, (0, 0, 255), -1)

    return Image.fromarray(canvas)
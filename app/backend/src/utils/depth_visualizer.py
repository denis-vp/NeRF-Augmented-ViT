import cv2
import numpy as np
from PIL import Image

colormaps = {
    'magma': cv2.COLORMAP_MAGMA,
    'inferno': cv2.COLORMAP_INFERNO,
    'plasma': cv2.COLORMAP_PLASMA,
    'jet': cv2.COLORMAP_JET,
    'bone': cv2.COLORMAP_BONE,
    'hot': cv2.COLORMAP_HOT,
}

def depth_to_colormap(depth: np.ndarray, mode: str = 'magma') -> Image.Image:
    """
    Convert a depth map to a colorized image using OpenCV colormaps.
    :param depth: np.ndarray, depth map to be colorized
    :param mode: str, colormap mode to use (default: 'magma')
    :return: Image.Image, colorized depth map
    """
    if mode not in colormaps:
        raise ValueError(f"Unsupported colormap mode: {mode}")

    depth_img = (depth * 255).astype(np.uint8)
    colorized = cv2.applyColorMap(depth_img, colormaps[mode])
    return Image.fromarray(cv2.cvtColor(colorized, cv2.COLOR_BGR2RGB))

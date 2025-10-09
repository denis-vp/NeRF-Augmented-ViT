import os
import zipfile
import shutil
import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm
from torchvision.transforms import Compose, ColorJitter, GaussianBlur, ToTensor

INPUT_DIR  = Path(r"")
OUTPUT_DIR = Path(r"")
DEPTH_SAVE = 'both'  # one of: 'png', 'npy', 'both'

# Depth loader + cleaner
def load_and_clean_depth(path):
    dr = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if dr is None:
        raise RuntimeError(f"Can't load depth: {path}")
    
    # flatten to a single float32 channel + alpha mask
    if dr.ndim == 2:
        depth = dr.astype(np.float32); alpha = (depth>0).astype(np.uint8)
    elif dr.shape[2]==4:
        depth = dr[...,0].astype(np.float32); alpha = dr[...,3]
    else:
        depth = dr[...,0].astype(np.float32); alpha = (depth>0).astype(np.uint8)

    depth = np.where(alpha>0, depth, 0.0)
    depth = cv2.medianBlur(depth, 5)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7,7))
    depth = cv2.morphologyEx(depth, cv2.MORPH_CLOSE, k)
    depth = np.where(depth<1e-6,1e-6, depth)
    m = float(depth.max() or 1.0)
    return (depth/m).astype(np.float32)

rgb_augment = Compose([
        ColorJitter(0.2, 0.2, 0.2, 0.1),
        GaussianBlur(kernel_size=3, sigma=(0.1, 2.0))
    ])

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# iterate all .zip under INPUT_DIR
for zip_path in sorted(INPUT_DIR.glob("*.zip")):
    scene = zip_path.stem
    extract_dir = INPUT_DIR/scene

    if not extract_dir.exists():
        extract_dir.mkdir()
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(extract_dir)

    out_img = OUTPUT_DIR/scene/"images"
    out_dep = OUTPUT_DIR/scene/"depths"
    out_img.mkdir(parents=True, exist_ok=True)
    out_dep.mkdir(parents=True, exist_ok=True)

    # Process every .color.png under extract_dir/images
    img_dir = extract_dir/"images"
    for rgb_path in tqdm(sorted(img_dir.glob("*.color.png")), desc=f"Augment {scene}"):
        base = rgb_path.name[:-len(".color.png")]
        frame_id = base

        # RGB augmentation
        img_bgr = cv2.imread(str(rgb_path), cv2.IMREAD_COLOR)
        img_rgb = img_bgr[...,::-1].astype(np.float32)/255.0
        tensor  = ToTensor()(img_rgb).unsqueeze(0)
        aug_t   = rgb_augment(tensor).squeeze(0)
        aug_np  = aug_t.permute(1,2,0).numpy()
        aug_bgr = (np.clip(aug_np*255,0,255).astype(np.uint8))[...,::-1]
        cv2.imwrite(str(out_img/f"{frame_id}.color.png"), aug_bgr)

        # Depth cleaning & saving
        depth_path = extract_dir/"depths"/f"{base}.depth.png"
        if depth_path.exists():
            depth = load_and_clean_depth(depth_path)
            # multiplicative noise + dropout
            depth *= np.random.uniform(0.98,1.02)
            mask   = (np.random.rand(*depth.shape)>0.02).astype(np.float32)
            depth *= mask

            if DEPTH_SAVE in ('npy','both'):
                np.save(str(out_dep/f"{frame_id}.depth.npy"), depth)

            if DEPTH_SAVE in ('png','both'):
                d16 = (depth*65535).clip(0,65535).astype(np.uint16)
                cv2.imwrite(str(out_dep/f"{frame_id}.depth.png"), d16)
        else:
            tqdm.write(f"[WARN] Missing depth for {base}")

        # # Pose Copy
        # pose_path = extract_dir/"poses"/f"{base}.pose.txt"
        # if pose_path.exists():
        #     shutil.copy(str(pose_path), str(out_dep.parent/f"{base}.pose.txt"))
        # else:
        #     tqdm.write(f"[WARN] Missing pose for {base}")

print("All scenes processed.")

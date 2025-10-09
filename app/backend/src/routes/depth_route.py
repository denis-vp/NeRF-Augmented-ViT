from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import numpy as np
import cv2

from src.model_mangers.depth_manager import DepthManager

depth_router = APIRouter(prefix="/depth-anything-v2", tags=["model-depth"])


class DepthSelect(BaseModel):
    model_name: str


depth_manager = DepthManager()


@depth_router.post("/select")
async def select_model(req: DepthSelect):
    try:
        spec = depth_manager.select_model(req.model_name)
        return {"status": "ok", "current": spec}
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@depth_router.get("/current")
async def current_model():
    try:
        spec = depth_manager.get_spec()
        if spec["model_name"] is None:
            return {"status": "none"}
        return {"status": "ok", "current": spec}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@depth_router.post("/predict")
async def predict_depth(file: UploadFile = File(...)):
    try:
        data = await file.read()
        arr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image")
        depth_map = depth_manager.predict(data, normalize=True)
        return JSONResponse({
            "height": depth_map.shape[0],
            "width": depth_map.shape[1],
            "depth": depth_map.tolist()
        })
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

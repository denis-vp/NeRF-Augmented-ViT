import os
import tempfile

from PIL import Image
from fastapi import APIRouter, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from src.model_mangers.roma_manager import RomaManager

roma_router = APIRouter(prefix="/tiny-roma", tags=["model-roma"])


class RomaSelect(BaseModel):
    model_name: str


roma_manager = RomaManager()


@roma_router.post("/select")
async def select_model(req: RomaSelect):
    try:
        spec = roma_manager.select_model(req.model_name)
        return {"status": "ok", "current": spec}
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@roma_router.get("/current")
async def current_model():
    try:
        spec = roma_manager.get_spec()
        if spec["model_name"] is None:
            return {"status": "none"}
        return {"status": "ok", "current": spec}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@roma_router.post("/predict")
async def predict_roma(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    path1 = path2 = None
    try:
        try:
            img1 = Image.open(file1.file).convert("RGB")
            img2 = Image.open(file2.file).convert("RGB")
        except Exception:
            raise ValueError("Invalid image(s)")

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f1, \
                tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f2:
            img1.save(f1.name, format="JPEG")
            img2.save(f2.name, format="JPEG")
            path1, path2 = f1.name, f2.name

        match_data = roma_manager.predict(path1, path2)
        return JSONResponse(match_data)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if path1 and os.path.exists(path1):
            os.remove(path1)
        if path2 and os.path.exists(path2):
            os.remove(path2)
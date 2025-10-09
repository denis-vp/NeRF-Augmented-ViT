from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from src.routes.depth_route import depth_router
from src.routes.roma_route import roma_router

app = FastAPI(
    title="NeRF-Augmented ViT Training API",
    description="Swap models and run inference on demand",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(depth_router)
app.include_router(roma_router)

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app import schemas, config
from app.routers import media

app = FastAPI(title="CTRL+Snap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        config.FRONTEND_ORIGIN,
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ctrlsnap.rypl.my.id",
        "https://photomatics-photobooth-production.up.railway.app",
        "*",  # allow all — tighten in production if needed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───
app.include_router(media.router, prefix="/api/media", tags=["media"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CTRL+Snap API"}

# Session history is stored directly in the browser's cookies/localStorage.
# Backend is stateless and no longer requires local database table storage.

@app.post("/api/ai/remove-background")
def ai_remove_background(req: schemas.UploadImageRequest):
    """
    Stub endpoint for future AI background removal integration.
    Currently returns the original image.
    """
    return {
        "status": "not_implemented_yet",
        "image": req.image
    }


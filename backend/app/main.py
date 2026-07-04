from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app import schemas, config

app = FastAPI(title="Photomatics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_ORIGIN, "https://localhost:3000", "http://localhost:5173", "*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Photomatics API"}

# Session history is now stored directly in the browser's cookies/localStorage.
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

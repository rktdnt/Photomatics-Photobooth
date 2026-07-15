"""
media.py — GIF / Live Photo generator untuk CTRL+Snap

Menerima daftar frame foto (base64 JPEG/PNG), menghasilkan GIF animasi
loop dengan efek ping-pong (maju → mundur) agar terasa seperti Apple Live Photo.

POST /api/media/gif
    Body: { "frames": ["data:image/jpeg;base64,...", ...], "fps": 8, "width": 480, "ping_pong": true }
    Response: { "gif_base64": "data:image/gif;base64,...", "frame_count": N, "duration_ms": N }
"""

from __future__ import annotations

import base64
import io
import re
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

router = APIRouter()


# ─────────────────────────── Schemas ───────────────────────────

class GifRequest(BaseModel):
    frames: List[str] = Field(
        ...,
        description="List of base64-encoded image frames (data URI or raw base64).",
        min_length=1,
    )
    fps: int = Field(
        default=8,
        ge=1,
        le=30,
        description="Frames per second for the output GIF (1–30). Default 8.",
    )
    width: int = Field(
        default=480,
        ge=120,
        le=1920,
        description="Output GIF width in pixels. Height is scaled proportionally.",
    )
    ping_pong: bool = Field(
        default=True,
        description="If true, appends reversed frames (maju→mundur) for a smooth loop.",
    )
    quality: int = Field(
        default=85,
        ge=10,
        le=100,
        description="JPEG quality for each frame before GIF conversion (10–100).",
    )


class GifResponse(BaseModel):
    gif_base64: str = Field(description="Complete data URI: data:image/gif;base64,...")
    frame_count: int = Field(description="Total frames in the GIF (after ping-pong).")
    duration_ms: int = Field(description="Duration of each frame in milliseconds.")
    width: int
    height: int


# ─────────────────────────── Helpers ───────────────────────────

_DATA_URI_RE = re.compile(r"^data:[^;]+;base64,(.+)$", re.DOTALL)


def _decode_frame(raw: str) -> Image.Image:
    """Decode a base64 data URI or raw base64 string into a PIL Image."""
    m = _DATA_URI_RE.match(raw.strip())
    b64_data = m.group(1) if m else raw.strip()
    try:
        img_bytes = base64.b64decode(b64_data)
    except Exception:
        raise ValueError("Invalid base64 data in frame.")
    return Image.open(io.BytesIO(img_bytes)).convert("RGB")


def _resize_frame(img: Image.Image, target_width: int) -> Image.Image:
    """Resize keeping aspect ratio."""
    w, h = img.size
    if w == target_width:
        return img
    scale = target_width / w
    new_h = int(h * scale)
    return img.resize((target_width, new_h), Image.LANCZOS)


def _image_to_gif_palette(img: Image.Image, quality: int) -> Image.Image:
    """
    Convert an RGB image to an optimised palette (P mode) for GIF.
    We first compress to JPEG to reduce noise, then quantize.
    """
    # Slight JPEG round-trip to smooth gradients → reduces dithering artefacts
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    img = Image.open(buf).convert("RGB")
    # Quantise to 256 colours with Lanczos dithering
    return img.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)


def _build_gif(
    pil_frames: List[Image.Image],
    frame_duration_ms: int,
    ping_pong: bool,
    width: int,
    quality: int,
) -> tuple[bytes, int, int, int]:
    """
    Build an animated GIF from PIL frames.
    Returns (gif_bytes, actual_frame_count, width, height).
    """
    resized = [_resize_frame(f, width) for f in pil_frames]
    if ping_pong and len(resized) > 1:
        # maju + mundur (tanpa duplikasi frame pertama & terakhir)
        resized = resized + list(reversed(resized[1:-1]))

    palette_frames = [_image_to_gif_palette(f, quality) for f in resized]

    buf = io.BytesIO()
    first = palette_frames[0]
    first.save(
        buf,
        format="GIF",
        save_all=True,
        append_images=palette_frames[1:],
        loop=0,                      # loop selamanya
        duration=frame_duration_ms,
        optimize=True,
        disposal=2,
    )

    gif_bytes = buf.getvalue()
    h = resized[0].size[1] if resized else 0
    return gif_bytes, len(palette_frames), resized[0].size[0], h


# ─────────────────────────── Endpoint ───────────────────────────

@router.post(
    "/gif",
    response_model=GifResponse,
    summary="Buat GIF animasi dari beberapa frame foto (efek Live Photo)",
    description="""
Kirim 2–10 frame foto sebagai base64 (data URI atau raw base64).
Backend menghasilkan GIF animasi loop dengan efek **ping-pong** (maju lalu mundur)
sehingga hasilnya terasa seperti Apple Live Photo yang smooth.

- `fps`: kecepatan animasi (default 8 fps → 125 ms/frame)
- `width`: lebar output GIF dalam piksel (default 480 px)
- `ping_pong`: aktifkan efek maju-mundur (default true)
- `quality`: kualitas JPEG tiap frame sebelum dikonversi ke palette GIF (default 85)
""",
)
async def create_gif(request: GifRequest) -> GifResponse:
    if not PIL_AVAILABLE:
        raise HTTPException(
            status_code=501,
            detail="Pillow tidak terinstall di server. Jalankan `pip install Pillow` dan restart.",
        )

    if len(request.frames) < 1:
        raise HTTPException(status_code=422, detail="Minimal 1 frame diperlukan.")
    if len(request.frames) > 20:
        raise HTTPException(status_code=422, detail="Maksimal 20 frame per request.")

    # Decode semua frame
    pil_frames: List[Image.Image] = []
    for i, raw in enumerate(request.frames):
        try:
            pil_frames.append(_decode_frame(raw))
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Frame #{i+1} tidak valid: {exc}")

    frame_duration_ms = max(1, round(1000 / request.fps))

    try:
        gif_bytes, frame_count, out_w, out_h = _build_gif(
            pil_frames=pil_frames,
            frame_duration_ms=frame_duration_ms,
            ping_pong=request.ping_pong,
            width=request.width,
            quality=request.quality,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gagal membuat GIF: {exc}")

    gif_b64 = "data:image/gif;base64," + base64.b64encode(gif_bytes).decode()

    return GifResponse(
        gif_base64=gif_b64,
        frame_count=frame_count,
        duration_ms=frame_duration_ms,
        width=out_w,
        height=out_h,
    )

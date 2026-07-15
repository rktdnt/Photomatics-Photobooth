from fastapi import APIRouter
from pydantic import BaseModel
import base64
import io
import re
from PIL import Image

router = APIRouter()

class AIResponse(BaseModel):
    status: str
    message: str
    image_url: str

_DATA_URI_RE = re.compile(r"^data:[^;]+;base64,(.+)$", re.DOTALL)

@router.post("/remove-background", response_model=AIResponse)
def remove_background(image_base64: str):
    """
    Menghapus background studio (warna mendekati putih / krem terang) 
    menjadi transparan (PNG) menggunakan Pillow.
    """
    try:
        m = _DATA_URI_RE.match(image_base64.strip())
        b64_data = m.group(1) if m else image_base64.strip()
        img_bytes = base64.b64decode(b64_data)
        
        img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        # Ambang batas deteksi warna putih/krem studio (thresholding)
        for item in datas:
            # item: (r, g, b, a)
            r, g, b, a = item
            # Jika warna pixel mendekati putih/krem studio (r > 200, g > 195, b > 185)
            # Hapus dengan mengubah opacity (alpha) menjadi 0 (transparent)
            if r > 190 and g > 185 and b > 175:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        
        # Simpan kembali sebagai PNG Base64
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        encoded_png = base64.b64encode(buf.getvalue()).decode("utf-8")
        
        return AIResponse(
            status="success",
            message="Background removed successfully.",
            image_url=f"data:image/png;base64,{encoded_png}"
        )
    except Exception as e:
        return AIResponse(
            status="error",
            message=f"Failed to remove background: {str(e)}",
            image_url=image_base64 # fallback
        )


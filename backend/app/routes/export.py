from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from io import BytesIO
from pydantic import BaseModel

from app.core.pdf_generator import generate_resume_pdf

router = APIRouter()


class ExportRequest(BaseModel):
    resume_data: dict
    optimized_bullets: list[dict] = []
    filename: str = "resume"


@router.post("/export")
def export_pdf(req: ExportRequest):
    pdf_bytes = generate_resume_pdf(req.resume_data, req.optimized_bullets)
    safe_name = req.filename.replace(" ", "_").strip("./")
    disposition = f"attachment; filename={safe_name}_optimized.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": disposition},
    )

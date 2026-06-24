import os
import tempfile

from fastapi import APIRouter, Form, HTTPException, UploadFile

from app.core.ats_scorer import calculate_ats_score
from app.core.jd_parser import parse_jd
from app.core.keyword_analyzer import analyze_keywords
from app.core.resume_parser import parse_resume

router = APIRouter()


@router.post("/analyze")
async def analyze(
    file: UploadFile,
    jd_text: str = Form(...),
):
    allowed_suffixes = {".pdf", ".docx", ".txt"}
    filename = file.filename or "resume.txt"
    suffix = os.path.splitext(filename)[1].lower()

    if suffix not in allowed_suffixes:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Upload a PDF, DOCX, or TXT file.",
        )

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        resume_data = parse_resume(tmp_path, filename)
        jd_data = parse_jd(jd_text)
        ats_score = calculate_ats_score(resume_data, jd_data)
        keyword_analysis = analyze_keywords(resume_data, jd_data)

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return {
        "resume_data": resume_data,
        "jd_data": jd_data,
        "ats_score": ats_score,
        "keyword_analysis": keyword_analysis,
    }

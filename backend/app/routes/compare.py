from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.multi_jd_analyzer import compare_jds

router = APIRouter()


class CompareRequest(BaseModel):
    jd_texts: list[str]


class CompareResponse(BaseModel):
    universal_keywords: list[str]
    common_keywords: list[str]
    unique_per_jd: list[list[str]]
    overlap_matrix: list[list[float]]
    recommendation: str
    jd_count: int


@router.post("/compare", response_model=CompareResponse)
def compare(req: CompareRequest):
    if len(req.jd_texts) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 job descriptions are required for comparison.",
        )
    return compare_jds(req.jd_texts)

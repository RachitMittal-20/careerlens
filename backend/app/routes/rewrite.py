from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.rewriter import rewrite_bullets

router = APIRouter()


class RewriteRequest(BaseModel):
    bullets: list[str]
    jd_keywords: list[str]
    role_title: str


class RewriteResult(BaseModel):
    original: str
    rewritten: str
    keywords_added: list[str]


class RewriteResponse(BaseModel):
    rewrites: list[RewriteResult]


@router.post("/rewrite", response_model=RewriteResponse)
def rewrite(req: RewriteRequest):
    if not req.bullets:
        raise HTTPException(status_code=400, detail="bullets list cannot be empty.")
    rewrites = rewrite_bullets(req.bullets, req.jd_keywords, req.role_title)
    return RewriteResponse(rewrites=rewrites)

# Pydantic schemas will be added here

from pydantic import BaseModel


class SectionData(BaseModel):
    summary: str = ""
    skills: str = ""
    experience: str = ""
    education: str = ""
    projects: str = ""


class ResumeData(BaseModel):
    raw_text: str
    sections: SectionData
    word_count: int
    filename: str


class JDData(BaseModel):
    all_keywords: list[str]
    technical_skills: list[str]
    soft_skills: list[str]
    experience_requirements: list[str]
    education_requirements: list[str]
    top_keyphrases: list[str]


class ATSScore(BaseModel):
    score: int
    grade: str
    technical_score: float
    skills_score: float
    experience_score: float
    education_score: float
    matched_count: int
    total_keywords: int
    feedback: str


class MatchedKeyword(BaseModel):
    keyword: str
    category: str


class MissingKeyword(BaseModel):
    keyword: str
    category: str
    priority: str


class PartialKeyword(BaseModel):
    keyword: str
    category: str
    resume_match: str


class BonusKeyword(BaseModel):
    keyword: str


class KeywordAnalysis(BaseModel):
    matched: list[MatchedKeyword]
    missing: list[MissingKeyword]
    partial: list[PartialKeyword]
    bonus: list[BonusKeyword]
    match_rate: float


class AnalyzeResponse(BaseModel):
    resume_data: ResumeData
    jd_data: JDData
    ats_score: ATSScore
    keyword_analysis: KeywordAnalysis


# --- Rewrite schemas ---

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


# --- Export schemas ---

class ExportRequest(BaseModel):
    resume_data: dict
    optimized_bullets: list[dict] = []
    filename: str = "resume"


# --- Compare schemas ---

class CompareRequest(BaseModel):
    jd_texts: list[str]


class CompareResponse(BaseModel):
    universal_keywords: list[str]
    common_keywords: list[str]
    unique_per_jd: list[list[str]]
    overlap_matrix: list[list[float]]
    recommendation: str
    jd_count: int

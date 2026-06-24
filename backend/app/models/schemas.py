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

import re
from functools import lru_cache
from typing import Optional

# ---------------------------------------------------------------------------
# KeyBERT singleton
# ---------------------------------------------------------------------------

_kw_model = None


def _get_kw_model():
    global _kw_model
    if _kw_model is None:
        from keybert import KeyBERT
        _kw_model = KeyBERT(model="sentence-transformers/all-MiniLM-L6-v2")
    return _kw_model


# ---------------------------------------------------------------------------
# Rule-based patterns
# ---------------------------------------------------------------------------

_TECH_SKILLS = [
    "python", "javascript", "typescript", "react", "vue", "angular", "node",
    "fastapi", "django", "flask", "sql", "postgresql", "mysql", "mongodb",
    "redis", "docker", "kubernetes", "aws", "gcp", "azure", "git",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "rest", "graphql", "microservices",
    "agile", "scrum", "linux", "bash", "ci/cd", "devops",
]

_SOFT_SKILLS = [
    "communication", "leadership", "teamwork", "collaboration",
    "problem-solving", "problem solving", "analytical", "critical thinking",
    "time management", "adaptability", "creativity", "interpersonal",
]

_EXPERIENCE_PATTERN = re.compile(
    r"\b(\d+\+?\s*(?:to|-)\s*\d*\+?\s*years?|\d+\+?\s*years?)\b",
    re.IGNORECASE,
)

_EDUCATION_PATTERN = re.compile(
    r"\b(bachelor'?s?|master'?s?|phd|ph\.d|degree|b\.tech|b\.e|m\.tech|m\.s|mba)\b",
    re.IGNORECASE,
)


def _find_rule_based(text: str, terms: list[str]) -> list[str]:
    found = []
    lower = text.lower()
    for term in terms:
        # Use word-boundary matching; handle special chars like ci/cd
        escaped = re.escape(term)
        if re.search(r"(?<!\w)" + escaped + r"(?!\w)", lower):
            found.append(term)
    return found


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_jd(jd_text: str) -> dict:
    technical_skills = _find_rule_based(jd_text, _TECH_SKILLS)
    soft_skills = _find_rule_based(jd_text, _SOFT_SKILLS)

    experience_requirements = [
        m.group(0) for m in _EXPERIENCE_PATTERN.finditer(jd_text)
    ]
    education_requirements = list({
        m.group(0).lower() for m in _EDUCATION_PATTERN.finditer(jd_text)
    })

    # KeyBERT extraction
    kw_model = _get_kw_model()
    raw_keyphrases = kw_model.extract_keywords(
        jd_text,
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        top_n=15,
    )
    top_keyphrases = [phrase for phrase, _ in raw_keyphrases]

    all_keywords = list({
        *technical_skills,
        *soft_skills,
        *top_keyphrases,
    })

    return {
        "all_keywords": all_keywords,
        "technical_skills": technical_skills,
        "soft_skills": soft_skills,
        "experience_requirements": experience_requirements,
        "education_requirements": education_requirements,
        "top_keyphrases": top_keyphrases,
    }

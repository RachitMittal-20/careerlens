import re
import string


def _normalize(text: str) -> str:
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    return text


def _match_keyword(keyword: str, normalized_resume: str) -> float:
    """Return 1.0 (exact), 0.5 (partial), or 0.0 (none)."""
    norm_kw = _normalize(keyword)
    if norm_kw in normalized_resume:
        return 1.0
    words = norm_kw.split()
    if len(words) > 1 and all(w in normalized_resume for w in words):
        return 0.5
    return 0.0


def _category_match_rate(keywords: list[str], normalized_resume: str) -> float:
    if not keywords:
        return 1.0  # nothing required → full credit
    scores = [_match_keyword(kw, normalized_resume) for kw in keywords]
    return sum(1.0 for s in scores if s > 0) / len(scores)


_GRADES = [
    (85, "A", "Excellent match! Your resume is well-optimized for this role."),
    (70, "B", "Good match. A few keyword additions could push you to the top."),
    (55, "C", "Average match. Consider adding more relevant keywords from the JD."),
    (40, "D", "Below average. Significant keyword gaps need to be addressed."),
    (0,  "F", "Poor match. This role may require different skills than your resume shows."),
]


def calculate_ats_score(resume_data: dict, jd_data: dict) -> dict:
    normalized_resume = _normalize(resume_data["raw_text"])

    all_keywords: list[str] = jd_data["all_keywords"]
    technical_skills: list[str] = jd_data["technical_skills"]
    experience_reqs: list[str] = jd_data["experience_requirements"]
    education_reqs: list[str] = jd_data["education_requirements"]

    # Keyword match counts
    match_weights = [_match_keyword(kw, normalized_resume) for kw in all_keywords]
    matched_count = sum(1 for w in match_weights if w > 0)
    total_keywords = len(all_keywords)

    skills_score = (sum(match_weights) / total_keywords) if total_keywords else 1.0
    technical_score = _category_match_rate(technical_skills, normalized_resume)

    experience_score = (
        1.0 if any(_match_keyword(r, normalized_resume) > 0 for r in experience_reqs)
        else 0.5
    ) if experience_reqs else 0.5

    education_score = (
        1.0 if any(_match_keyword(r, normalized_resume) > 0 for r in education_reqs)
        else 0.5
    ) if education_reqs else 0.5

    raw = (
        technical_score * 0.4
        + skills_score   * 0.3
        + experience_score * 0.2
        + education_score  * 0.1
    ) * 100

    score = max(0, min(100, round(raw)))

    grade, feedback = "F", _GRADES[-1][2]
    for threshold, g, msg in _GRADES:
        if score >= threshold:
            grade, feedback = g, msg
            break

    return {
        "score": score,
        "grade": grade,
        "technical_score": round(technical_score, 4),
        "skills_score": round(skills_score, 4),
        "experience_score": round(experience_score, 4),
        "education_score": round(education_score, 4),
        "matched_count": matched_count,
        "total_keywords": total_keywords,
        "feedback": feedback,
    }

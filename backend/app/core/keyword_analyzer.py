import re
import string


def _normalize(text: str) -> str:
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    return text


def _words_in_text(text: str) -> set[str]:
    return set(text.split())


def _exact_match(keyword: str, normalized_resume: str) -> bool:
    return _normalize(keyword) in normalized_resume


def _partial_match(keyword: str, normalized_resume: str) -> tuple[bool, str]:
    """Return (matched, found_words_string)."""
    words = _normalize(keyword).split()
    if len(words) <= 1:
        return False, ""
    found = [w for w in words if w in normalized_resume]
    if found and len(found) < len(words):
        return True, " ".join(found)
    if len(found) == len(words):
        # All words found individually — counts as partial for multi-word terms
        # only when exact phrase wasn't found (caller checks exact first)
        return True, " ".join(found)
    return False, ""


def _get_category(keyword: str, jd_data: dict) -> str:
    if keyword in jd_data.get("technical_skills", []):
        return "technical"
    if keyword in jd_data.get("soft_skills", []):
        return "soft"
    if keyword in jd_data.get("experience_requirements", []):
        return "experience"
    if keyword in jd_data.get("education_requirements", []):
        return "education"
    return "general"


def analyze_keywords(resume_data: dict, jd_data: dict) -> dict:
    normalized_resume = _normalize(resume_data["raw_text"])
    all_keywords: list[str] = jd_data["all_keywords"]
    top_keyphrases: set[str] = set(jd_data.get("top_keyphrases", []))
    technical_skills: set[str] = set(jd_data.get("technical_skills", []))

    matched = []
    missing = []
    partial = []

    for kw in all_keywords:
        category = _get_category(kw, jd_data)

        if _exact_match(kw, normalized_resume):
            matched.append({"keyword": kw, "category": category})
            continue

        is_partial, found_str = _partial_match(kw, normalized_resume)
        if is_partial:
            partial.append({
                "keyword": kw,
                "category": category,
                "resume_match": found_str,
            })
            continue

        # Determine priority for missing keyword
        if kw in top_keyphrases and kw in technical_skills:
            priority = "high"
        elif kw in top_keyphrases:
            priority = "high"
        elif kw in technical_skills:
            priority = "medium"
        else:
            priority = "low"

        missing.append({"keyword": kw, "category": category, "priority": priority})

    # Bonus keywords: terms in resume skills section not in JD keywords
    jd_kw_set = {_normalize(k) for k in all_keywords}
    skills_text = resume_data.get("sections", {}).get("skills", "")
    bonus_words = [
        w for w in _normalize(skills_text).split()
        if len(w) > 2 and w not in jd_kw_set
    ]
    # Deduplicate while preserving order
    seen: set[str] = set()
    bonus = []
    for w in bonus_words:
        if w not in seen:
            seen.add(w)
            bonus.append({"keyword": w})

    total = len(all_keywords)
    match_rate = round(len(matched) / total, 4) if total else 0.0

    return {
        "matched": matched,
        "missing": missing,
        "partial": partial,
        "bonus": bonus,
        "match_rate": match_rate,
    }

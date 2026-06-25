from app.core.jd_parser import parse_jd


def compare_jds(jd_texts: list[str]) -> dict:
    parsed = [parse_jd(text) for text in jd_texts]
    keyword_sets = [set(p["all_keywords"]) for p in parsed]

    # Universal: present in every JD
    universal_set = keyword_sets[0].copy()
    for s in keyword_sets[1:]:
        universal_set &= s
    universal = sorted(universal_set)

    # Common: present in 2+ but not all
    common_set: set[str] = set()
    for i, s in enumerate(keyword_sets):
        for kw in s:
            if kw not in universal_set:
                count = sum(1 for other in keyword_sets if kw in other)
                if count >= 2:
                    common_set.add(kw)
    common = sorted(common_set)

    # Unique per JD
    unique_per_jd = [
        sorted(s - universal_set - common_set) for s in keyword_sets
    ]

    # Pairwise overlap matrix
    n = len(keyword_sets)
    overlap_matrix: list[list[float]] = []
    for i in range(n):
        row: list[float] = []
        for j in range(n):
            union = keyword_sets[i] | keyword_sets[j]
            inter = keyword_sets[i] & keyword_sets[j]
            row.append(round(len(inter) / len(union), 4) if union else 0.0)
        overlap_matrix.append(row)

    if universal:
        sample = ", ".join(universal[:8])
        recommendation = (
            f"Focus on these {len(universal)} skill(s) that appear across all "
            f"job descriptions: {sample}"
        )
    else:
        top_common = common[:8]
        sample = ", ".join(top_common) if top_common else "the role-specific skills above"
        recommendation = (
            f"No skills are universal across all JDs. Prioritise these common "
            f"skills found in multiple listings: {sample}"
        )

    return {
        "universal_keywords": universal,
        "common_keywords": common,
        "unique_per_jd": unique_per_jd,
        "overlap_matrix": overlap_matrix,
        "recommendation": recommendation,
        "jd_count": n,
    }

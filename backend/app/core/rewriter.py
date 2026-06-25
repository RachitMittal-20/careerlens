from app.config import settings

_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        from langchain_groq import ChatGroq
        _llm = ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=settings.GROQ_API_KEY,
        )
    return _llm


_SYSTEM_PROMPT = (
    "You are an expert resume writer. Rewrite the given resume bullet point to be more impactful.\n"
    "Rules:\n"
    "1. Start with a strong action verb (Engineered, Developed, Architected, Led, Optimized, "
    "Implemented, Designed, Built, Reduced, Increased)\n"
    "2. Naturally incorporate 1-2 relevant keywords from the job description where they fit\n"
    "3. Add quantifiable metrics where possible — use placeholders like [X%] or [N users] if unknown\n"
    "4. Keep it to one line, under 150 characters\n"
    "5. Return ONLY the rewritten bullet point, nothing else. No explanations, no quotes."
)


def rewrite_bullets(
    bullets: list[str],
    jd_keywords: list[str],
    role_title: str,
) -> list[dict]:
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = _get_llm()
    results = []

    for bullet in bullets:
        user_content = (
            f"Job title: {role_title}\n"
            f"Job keywords: {', '.join(jd_keywords[:10])}\n"
            f"Original bullet: {bullet}"
        )
        try:
            response = llm.invoke([
                SystemMessage(content=_SYSTEM_PROMPT),
                HumanMessage(content=user_content),
            ])
            rewritten = response.content.strip()
        except Exception:
            rewritten = bullet

        lower_rewritten = rewritten.lower()
        keywords_added = [kw for kw in jd_keywords if kw.lower() in lower_rewritten]

        results.append({
            "original": bullet,
            "rewritten": rewritten,
            "keywords_added": keywords_added,
        })

    return results

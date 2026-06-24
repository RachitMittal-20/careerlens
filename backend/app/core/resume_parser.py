import re
from pathlib import Path


def _extract_text_pdf(file_path: str) -> str:
    import PyPDF2
    text_parts = []
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n".join(text_parts)


def _extract_text_docx(file_path: str) -> str:
    from docx import Document
    doc = Document(file_path)
    return "\n".join(para.text for para in doc.paragraphs)


def _extract_text_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


_SECTION_PATTERNS = {
    "summary": r"(?:summary|objective|professional\s+summary|career\s+objective)",
    "skills": r"(?:skills|technical\s+skills|core\s+competencies|technologies)",
    "experience": r"(?:experience|work\s+experience|professional\s+experience|employment)",
    "education": r"(?:education|academic\s+background|qualifications)",
    "projects": r"(?:projects|personal\s+projects|academic\s+projects|key\s+projects)",
}

# Order in which sections should appear when splitting (controls priority)
_SECTION_ORDER = ["summary", "skills", "experience", "education", "projects"]


def _parse_sections(text: str) -> dict:
    # Build a combined pattern that captures which header was matched
    header_re = re.compile(
        r"^[ \t]*(" + "|".join(_SECTION_PATTERNS.values()) + r")[ \t]*:?[ \t]*$",
        re.IGNORECASE | re.MULTILINE,
    )

    # Map each matched span to its canonical section name
    matches = []
    for m in header_re.finditer(text):
        header_text = m.group(1).strip().lower()
        for section, pattern in _SECTION_PATTERNS.items():
            if re.fullmatch(pattern, header_text, re.IGNORECASE):
                matches.append((m.start(), m.end(), section))
                break

    sections = {s: "" for s in _SECTION_ORDER}

    for i, (start, end, section) in enumerate(matches):
        next_start = matches[i + 1][0] if i + 1 < len(matches) else len(text)
        sections[section] = text[end:next_start].strip()

    return sections


def parse_resume(file_path: str, filename: str) -> dict:
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        raw_text = _extract_text_pdf(file_path)
    elif suffix == ".docx":
        raw_text = _extract_text_docx(file_path)
    else:
        raw_text = _extract_text_txt(file_path)

    sections = _parse_sections(raw_text)

    return {
        "raw_text": raw_text,
        "sections": sections,
        "word_count": len(raw_text.split()),
        "filename": filename,
    }

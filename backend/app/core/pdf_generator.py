import re
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_name(raw_text: str) -> str:
    for line in raw_text.strip().splitlines():
        line = line.strip()
        if line and len(line.split()) <= 5 and not re.search(r"[@|/\\]", line):
            return line
    return "Your Name"


def _extract_contact(raw_text: str) -> str:
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}", raw_text)
    phone_match = re.search(r"[\+\(]?\d[\d\s\-\(\)]{7,}\d", raw_text)
    parts = []
    if email_match:
        parts.append(email_match.group())
    if phone_match:
        parts.append(phone_match.group().strip())
    return "  |  ".join(parts) if parts else "email@example.com  |  +91-XXXXXXXXXX"


def _split_bullets(text: str) -> list[str]:
    """Return non-empty lines as individual bullet strings."""
    lines = []
    for line in text.strip().splitlines():
        line = line.strip().lstrip("•-–* ")
        if line:
            lines.append(line)
    return lines


# ---------------------------------------------------------------------------
# PDF rendering helpers
# ---------------------------------------------------------------------------

MARGIN = 72          # 1 inch in points
LINE_HEIGHT = 14     # pt between body lines
SECTION_GAP = 12     # pt between sections
BULLET_INDENT = 15   # pt hanging indent for bullet lines
PAGE_W, PAGE_H = A4


def _new_canvas(buf: BytesIO) -> canvas.Canvas:
    c = canvas.Canvas(buf, pagesize=A4)
    c.setTitle("Optimized Resume")
    c.setAuthor("CareerLens")
    return c


def _draw_hline(c: canvas.Canvas, y: float, width: float = PAGE_W - 2 * MARGIN) -> None:
    c.setLineWidth(0.5)
    c.line(MARGIN, y, MARGIN + width, y)


def _draw_section_header(c: canvas.Canvas, title: str, y: float) -> float:
    """Draw bold uppercase section title + thin underline. Returns new y."""
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN, y, title.upper())
    y -= 3
    _draw_hline(c, y)
    return y - 6


def _wrap_text(text: str, font: str, size: int, max_width: float) -> list[str]:
    """Naive word-wrap: split into lines that fit within max_width."""
    from reportlab.pdfbase.pdfmetrics import stringWidth

    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [""]


def _draw_wrapped(
    c: canvas.Canvas,
    text: str,
    y: float,
    font: str = "Helvetica",
    size: int = 10,
    indent: float = 0,
    bullet: bool = False,
) -> float:
    """Draw word-wrapped text, returning the new y position."""
    max_w = PAGE_W - 2 * MARGIN - indent
    prefix = "• " if bullet else ""
    full_text = prefix + text if bullet else text
    # For bullet continuation lines, increase indent to align past the bullet
    hang = BULLET_INDENT if bullet else 0

    lines = _wrap_text(full_text, font, size, max_w)
    c.setFont(font, size)
    for i, line in enumerate(lines):
        x = MARGIN + indent + (hang if i > 0 else 0)
        c.drawString(x, y, line)
        y -= LINE_HEIGHT
    return y


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

SECTION_ORDER = ["summary", "experience", "skills", "education", "projects"]
SECTION_LABELS = {
    "summary": "Summary",
    "experience": "Experience",
    "skills": "Skills",
    "education": "Education",
    "projects": "Projects",
}


def generate_resume_pdf(
    resume_data: dict,
    optimized_bullets: list[dict] | None = None,
) -> bytes:
    optimized_bullets = optimized_bullets or []

    # Build lookup: original bullet text → rewritten text
    bullet_rewrites: dict[str, str] = {
        b["original"].strip(): b["rewritten"].strip()
        for b in optimized_bullets
        if b.get("rewritten")
    }

    raw_text: str = resume_data.get("raw_text", "")
    sections: dict = resume_data.get("sections", {})

    buf = BytesIO()
    c = _new_canvas(buf)
    y = PAGE_H - MARGIN

    # --- Header ---
    name = _extract_name(raw_text)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(PAGE_W / 2, y, name)
    y -= 20

    contact = _extract_contact(raw_text)
    c.setFont("Helvetica", 10)
    c.drawCentredString(PAGE_W / 2, y, contact)
    y -= 8

    _draw_hline(c, y)
    y -= SECTION_GAP

    # --- Sections ---
    for key in SECTION_ORDER:
        content = sections.get(key, "").strip()
        if not content:
            continue

        y = _draw_section_header(c, SECTION_LABELS[key], y)

        bullets = _split_bullets(content)

        if key == "experience" and bullet_rewrites:
            replaced = []
            for b in bullets:
                replaced.append(bullet_rewrites.get(b, b))
            bullets = replaced

        for bullet in bullets:
            # Check page overflow — leave 40pt buffer before bottom margin
            if y < MARGIN + 40:
                c.showPage()
                y = PAGE_H - MARGIN

            y = _draw_wrapped(
                c, bullet, y,
                font="Helvetica", size=10,
                indent=0, bullet=True,
            )

        y -= SECTION_GAP

    c.save()
    return buf.getvalue()

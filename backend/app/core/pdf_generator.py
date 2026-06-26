import re
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate


SECTION_ORDER = ["summary", "experience", "skills", "education", "projects"]
SECTION_LABELS = {
    "summary":    "SUMMARY",
    "experience": "EXPERIENCE",
    "skills":     "SKILLS",
    "education":  "EDUCATION",
    "projects":   "PROJECTS",
}


def generate_resume_pdf(
    resume_data: dict,
    optimized_bullets: list[dict] | None = None,
) -> bytes:
    optimized_bullets = optimized_bullets or []

    bullet_lookup: dict[str, str] = {
        b["original"].strip(): b["rewritten"].strip()
        for b in optimized_bullets
        if b.get("rewritten")
    }

    raw_text: str = resume_data.get("raw_text", "")
    sections: dict = resume_data.get("sections", {})

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50, leftMargin=50,
        topMargin=50, bottomMargin=50,
    )

    getSampleStyleSheet()  # initialise default styles

    name_style = ParagraphStyle(
        "Name", fontSize=18, fontName="Helvetica-Bold",
        alignment=1, spaceAfter=4,
    )
    contact_style = ParagraphStyle(
        "Contact", fontSize=9, fontName="Helvetica",
        alignment=1, spaceAfter=2,
        textColor=colors.HexColor("#555555"),
    )
    section_style = ParagraphStyle(
        "Section", fontSize=11, fontName="Helvetica-Bold",
        spaceBefore=14, spaceAfter=4,
        textColor=colors.HexColor("#111111"),
    )
    body_style = ParagraphStyle(
        "Body", fontSize=10, fontName="Helvetica",
        spaceAfter=3, leading=14,
    )
    bullet_style = ParagraphStyle(
        "Bullet", fontSize=10, fontName="Helvetica",
        spaceAfter=2, leading=13,
        leftIndent=15, firstLineIndent=-10,
    )

    story = []

    # --- Name ---
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    name = lines[0] if lines else "Your Name"
    story.append(Paragraph(name, name_style))

    # --- Contact line ---
    email_m = re.search(r"[\w.\+-]+@[\w\.-]+\.\w+", raw_text)
    phone_m = re.search(r"[\+\(]?\d[\d\s\-\(\)]{7,}\d", raw_text)
    url_m   = re.search(r"https?://[^\s]+", raw_text[:600])

    contact_parts = []
    if email_m:
        contact_parts.append(email_m.group())
    if phone_m:
        contact_parts.append(phone_m.group().strip())
    if url_m:
        contact_parts.append(url_m.group())

    if contact_parts:
        story.append(Paragraph("  |  ".join(contact_parts), contact_style))

    story.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor("#cccccc"), spaceAfter=8,
    ))

    # --- Sections ---
    has_sections = any(sections.get(k, "").strip() for k in SECTION_ORDER)

    if has_sections:
        for key in SECTION_ORDER:
            content = sections.get(key, "").strip()
            if not content:
                continue

            story.append(Paragraph(SECTION_LABELS[key], section_style))
            story.append(HRFlowable(
                width="100%", thickness=0.5,
                color=colors.HexColor("#dddddd"), spaceAfter=4,
            ))

            for line in content.splitlines():
                line = line.strip()
                if not line:
                    continue
                # Skip if the line is just the section header echoed in content
                if line.upper() in SECTION_LABELS.values():
                    continue

                is_bullet = line.startswith(("•", "-", "*", "·"))
                if is_bullet:
                    text = line.lstrip("•-*· ").strip()
                    text = bullet_lookup.get(text, text)
                    story.append(Paragraph(f"• {text}", bullet_style))
                else:
                    story.append(Paragraph(line, body_style))
    else:
        # Fall back to rendering raw text when sections weren't detected
        story.append(Paragraph("RESUME", section_style))
        story.append(HRFlowable(
            width="100%", thickness=0.5,
            color=colors.HexColor("#dddddd"), spaceAfter=4,
        ))
        for line in raw_text.splitlines():
            line = line.strip()
            if line and line != name:
                story.append(Paragraph(line, body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

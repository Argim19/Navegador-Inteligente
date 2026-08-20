import re
import uuid
from pathlib import Path
from typing import List, Dict, Any, Tuple
from bs4 import BeautifulSoup
from backend.config import settings
from backend.models import DocumentChunk, DocumentItem

def parse_html_document(file_path: Path) -> Tuple[DocumentItem, List[DocumentChunk]]:
    """Parse an HTML policy document and split it into semantic clause chunks."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, "html.parser")
    
    # 1. Extract raw title
    raw_title = ""
    if soup.title and soup.title.string:
        raw_title = soup.title.string.strip()
    elif soup.find("h1"):
        raw_title = soup.find("h1").get_text().strip()
    else:
        raw_title = file_path.stem.replace("_", " ")

    # 2. Extract version and base title
    ver_match = re.search(r'Versi[oó]n\s*([\d\.]+)', raw_title, re.IGNORECASE)
    version = ver_match.group(1) if ver_match else "1.0"
    base_title = re.sub(r'\s*-\s*Versi[oó]n\s*[\d\.]+', '', raw_title, flags=re.IGNORECASE).strip()

    # 3. Determine scopes/departments
    scopes = settings.POLICY_SCOPE_MAPPING.get(base_title, ["General"])

    doc_id = f"doc_{file_path.stem}"
    
    # 4. Extract clauses
    chunks: List[DocumentChunk] = []
    clause_divs = soup.find_all("div", class_=lambda c: c and "clause" in c)

    if clause_divs:
        for idx, clause in enumerate(clause_divs, start=1):
            h2 = clause.find(["h2", "h3", "h4"])
            clause_title = h2.get_text().strip() if h2 else f"Sección {idx}"
            
            # Paragraphs inside clause
            paragraphs = [p.get_text().strip() for p in clause.find_all("p") if p.get_text().strip()]
            clause_text = "\n".join(paragraphs) if paragraphs else clause.get_text().strip()
            
            chunk = DocumentChunk(
                id=f"{doc_id}_c{idx}",
                doc_id=doc_id,
                doc_title=raw_title,
                file_name=file_path.name,
                version=version,
                clause_title=clause_title,
                content=clause_text,
                scopes=scopes,
                page_or_section=f"Cláusula {idx}",
                is_active=True
            )
            chunks.append(chunk)
    else:
        # Fallback if no div.clause (e.g. standard headers or paragraphs)
        headers = soup.find_all(["h1", "h2", "h3"])
        if headers:
            for idx, h in enumerate(headers, start=1):
                section_title = h.get_text().strip()
                # Grab subsequent text until next header
                next_p = []
                sibling = h.find_next_sibling()
                while sibling and sibling.name not in ["h1", "h2", "h3"]:
                    if sibling.name == "p" and sibling.get_text().strip():
                        next_p.append(sibling.get_text().strip())
                    sibling = sibling.find_next_sibling()
                
                content = "\n".join(next_p) if next_p else h.get_text().strip()
                chunks.append(DocumentChunk(
                    id=f"{doc_id}_s{idx}",
                    doc_id=doc_id,
                    doc_title=raw_title,
                    file_name=file_path.name,
                    version=version,
                    clause_title=section_title,
                    content=content,
                    scopes=scopes,
                    page_or_section=f"Sección {idx}",
                    is_active=True
                ))
        else:
            # Entire body as 1 chunk
            body_text = soup.get_text(separator="\n", strip=True)
            chunks.append(DocumentChunk(
                id=f"{doc_id}_full",
                doc_id=doc_id,
                doc_title=raw_title,
                file_name=file_path.name,
                version=version,
                clause_title="General",
                content=body_text,
                scopes=scopes,
                page_or_section="Documento Completo",
                is_active=True
            ))

    doc_item = DocumentItem(
        doc_id=doc_id,
        doc_title=raw_title,
        base_title=base_title,
        file_name=file_path.name,
        version=version,
        total_clauses=len(chunks),
        scopes=scopes,
        is_active=True
    )

    return doc_item, chunks

def parse_pdf_document(file_path: Path, scopes: List[str] = None) -> Tuple[DocumentItem, List[DocumentChunk]]:
    """Parse a PDF document page by page."""
    import pypdf
    reader = pypdf.PdfReader(str(file_path))
    raw_title = file_path.stem.replace("_", " ")
    doc_id = f"doc_{file_path.stem}"
    ver_match = re.search(r'v?(\d+\.\d+)', raw_title, re.IGNORECASE)
    version = ver_match.group(1) if ver_match else "1.0"
    base_title = re.sub(r'v?\d+\.\d+', '', raw_title).strip()
    
    if not scopes:
        scopes = settings.POLICY_SCOPE_MAPPING.get(base_title, ["General"])

    chunks: List[DocumentChunk] = []
    for page_idx, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            # Try to identify sections in page text
            chunks.append(DocumentChunk(
                id=f"{doc_id}_p{page_idx}",
                doc_id=doc_id,
                doc_title=raw_title,
                file_name=file_path.name,
                version=version,
                clause_title=f"Página {page_idx}",
                content=text.strip(),
                scopes=scopes,
                page_or_section=f"Página {page_idx}",
                is_active=True
            ))

    doc_item = DocumentItem(
        doc_id=doc_id,
        doc_title=raw_title,
        base_title=base_title,
        file_name=file_path.name,
        version=version,
        total_clauses=len(chunks),
        scopes=scopes,
        is_active=True
    )
    return doc_item, chunks

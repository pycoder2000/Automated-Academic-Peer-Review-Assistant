import requests
import xml.etree.ElementTree as ET
import argparse
import json
import os
from datetime import datetime

GROBID_URL = "http://localhost:8070/api/processFulltextDocument"

def extract_references_from_grobid(pdf_path):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    files = {'input': open(pdf_path, 'rb')}
    params = {
        "consolidateHeader": 1,
        "consolidateCitations": 1
    }
    print(f"📡 Sending {pdf_path} to GROBID at {GROBID_URL} ...")
    try:
        r = requests.post(GROBID_URL, files=files, data=params, timeout=60)
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"❌ Could not connect to GROBID at {GROBID_URL}. Make sure it's running.\n{e}")

    if r.status_code != 200:
        raise Exception(f"GROBID request failed: {r.status_code} - {r.text}")

    # Parse TEI XML response
    root = ET.fromstring(r.text)
    ns = {"tei": "http://www.tei-c.org/ns/1.0"}

    references = []
    for biblStruct in root.findall(".//tei:listBibl/tei:biblStruct", ns):
        ref = {
            "title": None,
            "year": None,
            "authors": [],
            "doi": None
        }

        # --- Year ---
        date_el = biblStruct.find(".//tei:date", ns)
        if date_el is not None and "when" in date_el.attrib:
            ref["year"] = date_el.attrib["when"][:4]

        # --- Title ---
        title_el = biblStruct.find(".//tei:title", ns)
        if title_el is not None and title_el.text:
            ref["title"] = title_el.text.strip()

        # --- Authors ---
        for author in biblStruct.findall(".//tei:author/tei:persName", ns):
            name_parts = []
            for tag in ["forename", "surname"]:
                el = author.find(f"tei:{tag}", ns)
                if el is not None and el.text:
                    name_parts.append(el.text.strip())
            if name_parts:
                ref["authors"].append(" ".join(name_parts))

        # --- DOI ---
        idno = biblStruct.find(".//tei:idno[@type='DOI']", ns)
        if idno is not None and idno.text:
            ref["doi"] = idno.text.strip()

        if ref["title"] or ref["year"]:
            references.append(ref)

    return references

def check_outdated_references(references, year_threshold):
    current_year = datetime.now().year
    outdated = []
    for ref in references:
        if ref["year"] and ref["year"].isdigit():
            if current_year - int(ref["year"]) > year_threshold:
                outdated.append(ref)
    return outdated

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Step 6 — Citation parsing & outdated reference alerts")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("year_threshold", type=int, help="Max age (years) before a reference is considered outdated")
    args = parser.parse_args()

    refs = extract_references_from_grobid(args.pdf_path)
    outdated_refs = check_outdated_references(refs, args.year_threshold)

    result = {
        "pdf": args.pdf_path,
        "total_references": len(refs),
        "outdated_references": outdated_refs,
        "all_references": refs
    }

    os.makedirs("data/results", exist_ok=True)
    base = os.path.splitext(os.path.basename(args.pdf_path))[0]
    output_path = f"data/results/{base}_citation_report.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"✅ Report saved to {output_path} ({len(refs)} refs checked)")
    if outdated_refs:
        print(f"⚠️ Outdated references found: {len(outdated_refs)}")
    else:
        print("✅ No outdated references found")

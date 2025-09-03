import os
import sys
import json
import argparse
import requests

GROBID_URL = "http://localhost:8070/api/processFulltextDocument"

def call_grobid(pdf_path: str, out_xml: str) -> None:
    """Send PDF to GROBID and save XML response."""
    with open(pdf_path, "rb") as f:
        resp = requests.post(
            GROBID_URL,
            files={"input": f},
            data={"consolidateHeader": "1", "consolidateCitations": "1"},
            timeout=60,
        )
    if resp.status_code != 200:
        raise RuntimeError(f"GROBID error {resp.status_code}: {resp.text[:200]}")
    with open(out_xml, "w", encoding="utf-8") as outf:
        outf.write(resp.text)

def parse_references_from_xml(xml_path: str):
    """Stub parser — replace with your existing XML parsing logic."""
    # Example: just return dummy
    # You should already have a working XML parser from your old code
    return [
        {"title": "Dummy Reference", "year": "2018", "authors": ["Someone"], "doi": None}
    ]

def filter_outdated_references(refs, year_threshold: int):
    outdated = []
    for r in refs:
        try:
            y = int(r.get("year", 0))
            if y <= year_threshold:
                outdated.append(r)
        except Exception:
            continue
    return outdated

def main():
    parser = argparse.ArgumentParser(description="Run GROBID + citation alerts")
    parser.add_argument("pdf_path", type=str, help="Path to PDF file")
    parser.add_argument("year_threshold", type=int, help="References before this year are outdated")
    parser.add_argument("--output", type=str, required=True, help="Path to save JSON report")
    args = parser.parse_args()

    base = os.path.splitext(os.path.basename(args.pdf_path))[0]
    refs_xml = f"data/references/{base}_refs.xml"
    os.makedirs("data/references", exist_ok=True)

    print(f"[📡] Sending {args.pdf_path} to GROBID at {GROBID_URL} ...")
    call_grobid(args.pdf_path, refs_xml)
    print(f"[Saved references] {refs_xml}")

    refs = parse_references_from_xml(refs_xml)
    outdated = filter_outdated_references(refs, args.year_threshold)

    report = {
        "pdf": args.pdf_path,
        "total_references": len(refs),
        "outdated_references": outdated,
    }

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"[✅] Report saved to {args.output} ({len(outdated)} outdated refs)")

if __name__ == "__main__":
    main()

import os
import json
import argparse
from PyPDF2 import PdfReader
from difflib import SequenceMatcher
from sentence_transformers import SentenceTransformer, util

# --- Utils ---
def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    text = ""
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        print(f"[ERROR] Failed to extract text from {pdf_path}: {e}")
    return text.strip()

def split_into_chunks(text, chunk_size=500):
    """Split text into chunks (for overlap checks)."""
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

def calculate_exact_overlap(chunk, ref_chunk, threshold=0.8):
    """Check for exact/copy overlap using SequenceMatcher."""
    score = SequenceMatcher(None, chunk, ref_chunk).ratio()
    return score if score >= threshold else None

def calculate_paraphrase_overlap(chunk, ref_chunk, model, threshold=0.7):
    """Check for semantic overlap using Sentence-BERT embeddings."""
    emb1 = model.encode(chunk, convert_to_tensor=True)
    emb2 = model.encode(ref_chunk, convert_to_tensor=True)
    score = float(util.cos_sim(emb1, emb2).item())
    return score if score >= threshold else None

# --- Main Pipeline ---
def run_plagiarism_check(test_pdf, metadata_file, output_file):
    print(f"[INFO] Extracting text from: {test_pdf}")
    test_text = extract_text_from_pdf(test_pdf)
    test_chunks = split_into_chunks(test_text)

    # Load metadata
    print(f"[INFO] Loading metadata from: {metadata_file}")
    with open(metadata_file, "r") as f:
        metadata_list = json.load(f)

    # Load model for semantic similarity
    model = SentenceTransformer("all-MiniLM-L6-v2")

    exact_matches, paraphrase_matches = [], []

    # Loop through references
    for paper in metadata_list:
        ref_pdf = paper.get("pdf_path")
        if not ref_pdf or not os.path.exists(ref_pdf):
            print(f"[WARNING] Skipping missing PDF: {ref_pdf}")
            continue

        print(f"[INFO] Comparing with: {paper['title']}")
        ref_text = extract_text_from_pdf(ref_pdf)
        ref_chunks = split_into_chunks(ref_text)

        for t_chunk in test_chunks:
            for r_chunk in ref_chunks:
                # Exact overlap
                score_exact = calculate_exact_overlap(t_chunk, r_chunk)
                if score_exact:
                    exact_matches.append({
                        "chunk": t_chunk,
                        "score": score_exact,
                        "type": "exact_overlap"
                    })

                # Paraphrase overlap
                score_para = calculate_paraphrase_overlap(t_chunk, r_chunk, model)
                if score_para:
                    paraphrase_matches.append({
                        "chunk": t_chunk,
                        "score": score_para,
                        "type": "paraphrase_overlap"
                    })

    # Build result JSON
    result = {
        "paper": test_pdf,
        "references": [p.get("pdf_path") for p in metadata_list if p.get("pdf_path")],
        "exact_overlap": exact_matches,
        "paraphrase_overlap": paraphrase_matches,
        "summary": {
            "exact_overlap_count": len(exact_matches),
            "paraphrase_overlap_count": len(paraphrase_matches),
        }
    }

    # Save JSON
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Results saved to {output_file}")

# --- CLI ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automated Plagiarism Checker with JSON output")
    parser.add_argument("--test-pdf", type=str, required=True, help="Path to the test PDF file")
    parser.add_argument("--metadata", type=str, required=True, help="Path to metadata.json file")
    parser.add_argument("--output", type=str, required=True, help="Path to save results JSON")
    args = parser.parse_args()

    run_plagiarism_check(args.test_pdf, args.metadata, args.output)

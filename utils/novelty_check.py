import argparse
import os
import json
from sentence_transformers import SentenceTransformer, util
from PyPDF2 import PdfReader

# Load model globally (saves time)
model = SentenceTransformer("all-MiniLM-L6-v2")

def extract_text_from_pdf(pdf_path, max_chars=2000):
    """Extract text from a PDF (first N chars)."""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages[:5]:  # only first 5 pages for speed
            text += page.extract_text() or ""
        return text[:max_chars]
    except Exception as e:
        return f"ERROR reading {pdf_path}: {e}"

def extract_title(text):
    """Guess the title as the first line with >5 chars."""
    for line in text.split("\n"):
        if len(line.strip()) > 5:
            return line.strip()
    return "Unknown Title"

def label_novelty(score):
    """Interpret similarity score into novelty category."""
    if score >= 0.40:
        return "❌ Not Novel (very similar)"
    elif score >= 0.25:
        return "⚠️ Partially Novel (some overlap)"
    else:
        return "✅ Highly Novel (no strong match)"

def novelty_check(input_pdf, topic, top_k=5, pdf_dir="data/pdfs", output_path=None):
    # Extract text from input paper
    query_text = extract_text_from_pdf(input_pdf)
    query_emb = model.encode(query_text, convert_to_tensor=True)

    results = []
    for pdf in os.listdir(pdf_dir):
        if pdf.endswith(".pdf"):
            pdf_path = os.path.join(pdf_dir, pdf)
            text = extract_text_from_pdf(pdf_path)
            emb = model.encode(text, convert_to_tensor=True)
            sim = util.cos_sim(query_emb, emb).item()
            title = extract_title(text)

            results.append({
                "title": title,
                "similarity": float(sim),
                "novelty": label_novelty(sim),
                "file": pdf_path
            })

    # Sort by similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    results = results[:top_k]

    # Console output
    print("\n📊 [NOVELTY CHECK RESULTS]")
    print(f"Topic: {topic}")
    print("------------------------------------------------------------")
    for i, r in enumerate(results, start=1):
        print(f"{i}. {r['title']}")
        print(f"   Similarity: {r['similarity']:.4f}")
        print(f"   Novelty: {r['novelty']}")
        print("------------------------------------------------------------")

    # Save to JSON
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        report = {
            "pdf": input_pdf,
            "topic": topic,
            "results": results
        }
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"✅ Results saved to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Novelty Check for Research Papers")
    parser.add_argument("input_pdf", help="Path to the research paper PDF")
    parser.add_argument("--topic", type=str, required=True, help="Research topic")
    parser.add_argument("--top_k", type=int, default=5, help="Number of top similar papers to show")
    parser.add_argument("--pdf_dir", type=str, default="data/pdfs", help="Directory containing reference PDFs")
    parser.add_argument("--output", type=str, help="Path to save JSON results")

    args = parser.parse_args()
    novelty_check(args.input_pdf, args.topic, args.top_k, args.pdf_dir, args.output)

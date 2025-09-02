import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from pathlib import Path

# Paths
PDF_SUMMARY_JSON = "data/pdf_processing_summary.json"
PARSED_TEXT_DIR = "data/parsed_text"
FAISS_DIR = "data/faiss_indexes"

# ---------- Load metadata ----------
def load_pdf_summary():
    with open(PDF_SUMMARY_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

# ---------- Load parsed text ----------
def load_text(text_path):
    if text_path and os.path.exists(text_path):
        with open(text_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

# ---------- Build FAISS index ----------
def build_faiss_index(embeddings):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)  # L2 distance
    index.add(embeddings)
    return index

# ---------- Main ----------
def main():
    print("[STEP 3] Building FAISS indexes (per topic)...")

    pdf_summaries = load_pdf_summary()

    # Load embedding model
    print("[MODEL] Loading sentence-transformers/all-MiniLM-L6-v2")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    # Group papers by topic
    topic_groups = {}
    for entry in pdf_summaries:
        topic = entry.get("topic", "unknown")
        topic_groups.setdefault(topic, []).append(entry)

    os.makedirs(FAISS_DIR, exist_ok=True)

    # Process each topic separately
    for topic, papers in topic_groups.items():
        print(f"\n[TOPIC] {topic} — {len(papers)} papers")

        texts = []
        mapping = {}

        for idx, paper in enumerate(papers):
            text = load_text(paper.get("text_path"))
            texts.append(text)
            mapping[idx] = {
                "topic": topic,
                "pdf_path": paper.get("pdf_path"),
                "text_path": paper.get("text_path"),
                "refs_path": paper.get("refs_path"),
            }

        print(f"[EMBEDDING] Encoding {len(texts)} docs for topic '{topic}'...")
        embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)

        # Build FAISS index
        print(f"[FAISS] Creating index for topic {topic}...")
        index = build_faiss_index(embeddings)

        # Save FAISS index + mapping
        faiss_path = Path(FAISS_DIR) / f"{topic}_index.bin"
        mapping_path = Path(FAISS_DIR) / f"{topic}_mapping.json"

        faiss.write_index(index, str(faiss_path))
        with open(mapping_path, "w", encoding="utf-8") as f:
            json.dump(mapping, f, indent=4, ensure_ascii=False)

        print(f"[SAVED] {faiss_path}")
        print(f"[SAVED] {mapping_path}")

    print("\n[DONE] Step 3 completed.")

# ---------- Entry ----------
if __name__ == "__main__":
    main()

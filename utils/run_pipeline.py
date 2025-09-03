import os
import argparse
import subprocess

def run_cmd(cmd):
    print(f"\n[RUNNING] {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"[ERROR] Command failed: {cmd}")
        exit(1)

def main():
    parser = argparse.ArgumentParser(description="Full Peer Review Pipeline")
    parser.add_argument("--pdf_url", type=str, help="URL to download paper (arXiv/DOI)", required=False)
    parser.add_argument("--pdf_path", type=str, help="Local PDF path", required=False)
    parser.add_argument("--out_dir", type=str, default="data/results", help="Output directory")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)

    # Step 1: Download if URL provided
    if args.pdf_url:
        pdf_path = os.path.join(args.out_dir, "paper.pdf")
        run_cmd(f"python download_pdf.py --url {args.pdf_url} --output {pdf_path}")
    elif args.pdf_path:
        pdf_path = args.pdf_path
    else:
        print("Error: Provide either --pdf_url or --pdf_path")
        exit(1)

    # Step 2: Parsing
    parsed_out = os.path.join(args.out_dir, "parsed.json")
    run_cmd("python utils/pdf_parse.py")

    # Step 3: Citation analysis
    # In run_pipeline.py
    citation_out = os.path.join(args.out_dir, "citation_report.json")
    run_cmd(
        f"python utils/grobid_citation_alerts.py {pdf_path} 5 --output {citation_out}"
    )


    # Step 4: Novelty
    novelty_out = os.path.join(args.out_dir, "novelty.json")

    # Try to auto-detect topic from metadata.json
    metadata_path = os.path.join(args.out_dir, "metadata.json")
    if os.path.exists(metadata_path):
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
            topic = metadata.get("title") or metadata.get("abstract") or "general"
    else:
        topic = "general"

    print(f"[INFO] Auto-detected topic for novelty check → {topic[:100]}...")

    run_cmd(
        f"python utils/novelty_check.py {pdf_path} "
        f"--topic \"{topic}\" "
        f"--pdf_dir data/pdfs "
        f"--top_k 5 "
        f"--output {novelty_out}"
    )

    # Step 5: Plagiarism
    plagiarism_out = os.path.join(args.out_dir, "plagiarism.json")
    run_cmd(
        f"python utils/plagiarism_check.py "
        f"--test-pdf {pdf_path} "
        f"--metadata data/metadata.json "
        f"--output {plagiarism_out}"
    )

    # Step 6: Factual check
    factual_out = os.path.join(args.out_dir, "factual.json")
    run_cmd(
        f"python utils/factual_check.py {pdf_path} --output {factual_out}"
    )


    # Step 7: Review synthesis
    review_out = os.path.join(args.out_dir, "review.txt")
    run_cmd(
        f"python utils/llm_review_synthesis.py "
        f"--novelty {novelty_out} "
        f"--claims {citation_out} "
        f"--plagiarism {plagiarism_out} "
        f"--factual {factual_out} "
        f"--output {review_out}"
    )

    print(f"\n✅ Full pipeline complete! Results saved in: {args.out_dir}")

if __name__ == "__main__":
    main()

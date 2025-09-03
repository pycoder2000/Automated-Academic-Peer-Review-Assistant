# Automated Academic Peer Review Assistant

A modular pipeline for automating parts of the academic peer review process — including PDF acquisition, parsing, citation analysis, novelty detection, plagiarism check, factual verification, and LLM-based review synthesis.

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/BhaveshBhakta/Automated-Academic-Peer-Review-Assistant.git
cd Automated-Academic-Peer-Review-Assistant
```

2. **Create a Python environment**

```bash
python3 -m venv langenv
source langenv/bin/activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

---

## 📥 Step 1: Download PDF 

Use the provided helper script to download a PDF (example from arXiv):

```bash
python utils/data_fetch.py --keyword "machine learning"
```

* Replace the `--url` with your desired paper.
* Output will be saved in the `test_pdf/` folder.

---

## 📑 Step 2: PDF Parsing

Extract text and references using GROBID.

### Start GROBID (Docker)

```bash
docker run -t --rm -p 8070:8070 lfoppiano/grobid:0.7.2
```

(Keep this running in a separate terminal.)

### Run Parsing

```bash
python utils/pdf_parser.py --input test_pdf/test_paper.pdf --output data/results/parsed.json
```

---

## 📚 Step 3: Citation Analysis & Outdated Reference Check

Check if references are too old.

```bash
python utils/grobid_citation_alerts.py test_pdf/test_paper.pdf 5
```

* `5` = maximum allowed age of references (in years).
* Output:

  ```
  data/results/citation_report.json
  ```

---

## 🔬 Step 4: Novelty Check

Compare the target paper against a set of reference PDFs.

```bash
python utils/novelty_check.py --paper test_pdf/test_paper.pdf --references "data/pdfs/*.pdf" --output data/results/novelty.json
```

* Output saved as:

  ```
  data/results/novelty.json
  ```

---

## 📖 Step 5: Plagiarism Detection

Detect overlapping passages.

```bash
python utils/plagiarism_check.py --paper test_pdf/test_paper.pdf --references "data/pdfs/*.pdf" --output data/results/plagiarism.json
```

* Output saved as:

  ```
  data/results/plagiarism.json
  ```

---

## ✅ Step 6: Factual Verification

Check claims in the paper against a knowledge base / LLM.

```bash
python utils/factual_check.py --paper test_pdf/test_paper.pdf --output data/results/factual.json
```

* Output saved as:

  ```
  data/results/factual.json
  ```

---

## 🤖 Step 7: LLM-Based Review Synthesis

Generate a structured peer review from the analysis results.

### Single Paper Mode

```bash
python utils/llm_review_synthesis.py \
  --novelty data/results/novelty.json \
  --claims data/results/citation_report.json \
  --plagiarism data/results/plagiarism.json \
  --factual data/results/factual.json \
  --output data/results/review.txt
```

* Review is saved as:

  ```
  data/results/review.txt
  ```

### Batch Mode (Multiple Papers)

```bash
python llm_review_synthesis.py --batch_dir data/results/ --output_dir data/reviews/
```

---

## 📂 Output Structure


```
data/
 └── results/
     ├── parsed.json
     ├── citation_report.json
     ├── novelty.json
     ├── plagiarism.json
     ├── factual.json
     ├── review.txt
     └── batch_reviews/
```


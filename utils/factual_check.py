import os
import re
import json
import argparse
from collections import defaultdict
from statistics import mean, pstdev
from typing import List, Dict, Any, Optional
import regex as re2
from pint import UnitRegistry
from PyPDF2 import PdfReader

# -------------------- CONFIG --------------------
PARSED_TEXT_DIR = "data/parsed_text"
RESULTS_DIR = "data/results"
os.makedirs(RESULTS_DIR, exist_ok=True)

METRIC_CUES = {
    "accuracy": ["accuracy", "top-1", "top1", "acc."],
    "f1": ["f1", "f-1", "f score", "f-score", "f1-score", "f measure", "f-measure"],
    "precision": ["precision"],
    "recall": ["recall", "sensitivity", "tpr"],
    "specificity": ["specificity", "tnr"],
    "auc": ["auc", "roc auc", "area under curve"],
    "latency": ["latency", "response time", "inference time"],
    "throughput": ["throughput", "qps", "rps", "samples/sec"],
    "memory": ["memory", "ram", "gpu memory", "vram"],
    "size": ["model size", "parameters", "params", "param"],
    "time": ["time", "duration", "runtime"],
    "freq": ["frequency", "clock", "hz"]
}
CONTEXT_WINDOW = 40
PERCENT_MIN, PERCENT_MAX = 0.0, 100.0

ureg = UnitRegistry()
Q_ = ureg.Quantity

UNIT_ALIASES = {
    "ms": "millisecond", "s": "second", "sec": "second", "secs": "second",
    "kb": "kilobyte", "mb": "megabyte", "gb": "gigabyte", "tb": "terabyte",
    "kib": "kibibyte", "mib": "mebibyte", "gib": "gibibyte",
    "mm": "millimeter", "cm": "centimeter", "m": "meter", "km": "kilometer",
    "hz": "hertz", "khz": "kilohertz", "mhz": "megahertz", "ghz": "gigahertz"
}

NUM_UNIT_RE = re2.compile(
    r"""(?P<num>[+-]?\d{1,3}(?:[\d,]{0,3})*(?:\.\d+)?|\.\d+)\s*(?P<percent>%)
    |
    (?P<num2>[+-]?\d{1,3}(?:[\d,]{0,3})*(?:\.\d+)?|\.\d+)\s*(?P<unit>[a-zA-Zμµ]{1,6})?""",
    re2.VERBOSE | re2.IGNORECASE
)

def extract_text_fn(pdf_path, max_chars=20000):
    try:
        reader = PdfReader(pdf_path)
        text = "".join(page.extract_text() or "" for page in reader.pages)
        return text[:max_chars]
    except Exception as e:
        raise RuntimeError(f"Error reading PDF {pdf_path}: {e}")

def normalize_unit_token(tok: str) -> Optional[str]:
    if tok is None:
        return None
    return UNIT_ALIASES.get(tok.strip().lower(), tok.strip().lower())

def clean_number_str(s: str) -> float:
    return float(s.replace(",", ""))

def extract_numeric_mentions(text: str) -> List[Dict[str, Any]]:
    mentions = []
    for m in NUM_UNIT_RE.finditer(text):
        start, end = m.span()
        ctx_start = max(0, start - CONTEXT_WINDOW)
        ctx_end = min(len(text), end + CONTEXT_WINDOW)
        context = text[ctx_start:ctx_end].lower()

        if m.group("percent"):
            val = clean_number_str(m.group("num"))
            mentions.append({
                "raw": m.group(0), "value": val, "kind": "percent",
                "unit": "%", "value_si": val, "si_unit": "%", "context": context, "span": [start, end],
            })
        else:
            num_str = m.group("num2")
            unit_tok = normalize_unit_token(m.group("unit"))
            val = clean_number_str(num_str)

            value_si, si_unit, kind = val, unit_tok, "scalar"
            if unit_tok:
                try:
                    q = Q_(val, unit_tok)
                    dim = str(q.dimensionality)
                    if "[time]" in dim:
                        value_si, si_unit, kind = q.to("second").magnitude, "second", "time"
                    elif "[length]" in dim:
                        value_si, si_unit, kind = q.to("meter").magnitude, "meter", "length"
                    elif "byte" in unit_tok or "[information]" in dim:
                        value_si, si_unit, kind = q.to("byte").magnitude, "byte", "memory"
                    elif "[frequency]" in dim:
                        value_si, si_unit, kind = q.to("hertz").magnitude, "hertz", "frequency"
                    else:
                        kind = "other"
                except Exception:
                    kind = "other"

            mentions.append({
                "raw": m.group(0), "value": val, "kind": kind,
                "unit": unit_tok, "value_si": float(value_si), "si_unit": si_unit,
                "context": context, "span": [start, end],
            })
    return mentions

def bind_metric_labels(mentions: List[Dict[str, Any]]) -> None:
    for m in mentions:
        ctx = m["context"]
        m["metric_labels"] = [metric for metric, cues in METRIC_CUES.items() if any(cue in ctx for cue in cues)]

def sanity_checks(mentions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    issues = []
    for m in mentions:
        if m["kind"] == "percent" and not (PERCENT_MIN <= m["value_si"] <= PERCENT_MAX):
            issues.append({"type": "range_error_percent", "message": f"Percentage {m['value_si']}% out of bounds", "mention": m["raw"]})
        if m["kind"] in {"time", "length", "memory", "frequency"} and m["value_si"] < 0:
            issues.append({"type": "negative_physical_quantity", "message": f"Negative {m['kind']} value", "mention": m["raw"]})
    return issues

def internal_consistency_checks(mentions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    issues, buckets = [], defaultdict(list)
    for m in mentions:
        key = tuple(sorted(m["metric_labels"])) if m["metric_labels"] else (m["kind"], m.get("si_unit"))
        buckets[key].append(m)

    for key, items in buckets.items():
        if len(items) < 2: continue
        vals = [x["value_si"] for x in items if x["value_si"] is not None]
        if any(x["kind"] == "percent" for x in items) and max(vals) - min(vals) >= 10:
            issues.append({"type": "inconsistent_percent", "message": f"Conflicting percents {min(vals)}–{max(vals)}", "metric": str(key)})
        elif any(x["kind"] in {"time", "memory", "length", "frequency"} for x in items):
            if max(vals)/max(1e-12, min(vals)) >= 100:
                issues.append({"type": "inconsistent_physical_quantity", "message": f"≥100× difference for {key}", "metric": str(key)})
    return issues

def build_corpus_stats(corpus_dir: str) -> Dict[str, Dict[str, float]]:
    agg = defaultdict(list)
    if not os.path.isdir(corpus_dir): return {}

    for fname in os.listdir(corpus_dir):
        if not fname.lower().endswith(".txt"): continue
        try:
            with open(os.path.join(corpus_dir, fname), "r", encoding="utf-8") as f:
                mentions = extract_numeric_mentions(f.read())
            bind_metric_labels(mentions)
            for m in mentions:
                if m["value_si"] is not None:
                    agg[f"{m['kind']}::{m.get('si_unit')}"].append(float(m["value_si"]))
        except Exception: continue

    stats = {}
    for k, vals in agg.items():
        if len(vals) < 10: continue
        stats[k] = {"count": len(vals), "mean": float(mean(vals)), "std": float(pstdev(vals)), "min": float(min(vals)), "max": float(max(vals))}
    return stats

def zscore(val: float, mu: float, sigma: float) -> float:
    return 0.0 if sigma <= 1e-12 else (val - mu) / sigma

def statistical_plausibility_checks(mentions, stats, z_thresh=3.0):
    issues = []
    for m in mentions:
        if m["value_si"] is None: continue
        k = f"{m['kind']}::{m.get('si_unit')}"
        if k in stats:
            mu, sd = stats[k]["mean"], stats[k]["std"]
            z = zscore(m["value_si"], mu, sd)
            if abs(z) >= z_thresh:
                issues.append({"type": "statistical_outlier", "message": f"{m['value_si']} {m.get('si_unit')} is outlier", "bucket": k, "zscore": float(z)})
    return issues

def read_text(path: str) -> str:
    return extract_text_fn(path) if path.lower().endswith(".pdf") else open(path, "r", encoding="utf-8").read()

def factual_check(path: str, corpus_dir: str = PARSED_TEXT_DIR, z_thresh: float = 3.0) -> Dict[str, Any]:
    text = read_text(path)
    mentions = extract_numeric_mentions(text)
    bind_metric_labels(mentions)
    hard_issues = sanity_checks(mentions) + internal_consistency_checks(mentions)
    stats = build_corpus_stats(corpus_dir)
    stat_issues = statistical_plausibility_checks(mentions, stats, z_thresh)
    return {
        "file": path, "num_mentions": len(mentions), "mentions": mentions[:2000],
        "issues": {"hard_checks": hard_issues, "statistical_checks": stat_issues},
        "corpus_stats_available_for": sorted(stats.keys())
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Step 7 — Factual Verification")
    parser.add_argument("path", type=str, help="Path to PDF/TXT file")
    parser.add_argument("--corpus_dir", type=str, default=PARSED_TEXT_DIR)
    parser.add_argument("--z_thresh", type=float, default=3.0)
    parser.add_argument("--output", type=str, help="Save JSON output")
    args = parser.parse_args()

    results = factual_check(args.path, args.corpus_dir, args.z_thresh)
    if args.output:
        os.makedirs(os.path.dirname(args.output), exist_ok=True)
        with open(args.output, "w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"✅ Results saved to {args.output}")
    else:
        print(json.dumps(results, indent=2))

from pathlib import Path

import pandas as pd

RESULTS_DIR = Path(__file__).parent / "results"
INPUT_CSV = RESULTS_DIR / "evaluator_results.csv"
OUTPUT_CSV = RESULTS_DIR / "rag_results_final_v3_chunk_500_overlap_50_k_7.csv"

METRICS = [
    "faithfulness",
    "answer_relevancy",
    "context_recall",
    "llm_context_precision_without_reference",
]


def main():
    df = pd.read_csv(INPUT_CSV)
    scores = df[METRICS].apply(pd.to_numeric, errors="coerce")

    # Blank/failed scores (NaN) are skipped when averaging
    rag_results_final = pd.DataFrame(
        {"metric": METRICS, "average": scores.mean().values}
    )

    rag_results_final.to_csv(OUTPUT_CSV, index=False)
    print(rag_results_final.to_string(index=False))
    print(f"\nSaved to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()

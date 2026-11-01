"""
Hybrid Search — Dense (semantic) + Sparse (BM25 keyword) combined.
Hosted in India (ap-south-1): configurable alpha, per-query tuning.

Algorithm:
  1. Semantic search  → top K results with cosine similarity scores
  2. BM25 keyword     → lexical term frequency / inverse document frequency scores
  3. Reciprocal Rank Fusion (RRF) + Normalized Score Blending → merge both rankings
  4. Return unified ranked results with accurate normalized scores
"""
import math
import re
from collections import defaultdict


# ── BM25 Implementation ────────────────────────────────────────────────────────

class BM25:
    """
    Okapi BM25 full-text scoring (k1=1.5, b=0.75).
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: list[list[str]] = []
        self.doc_freqs: dict[str, int] = {}
        self.idf: dict[str, float] = {}
        self.avg_doc_len: float = 0.0
        self.doc_count: int = 0

    def _tokenize(self, text: str) -> list[str]:
        if not text:
            return []
        return re.findall(r'\w+', text.lower())

    def fit(self, corpus: list[str]):
        """Build BM25 index from a list of documents."""
        self.corpus = [self._tokenize(doc) for doc in corpus]
        self.doc_count = len(self.corpus)

        if self.doc_count == 0:
            return self

        total_len = sum(len(doc) for doc in self.corpus)
        self.avg_doc_len = (total_len / self.doc_count) if total_len > 0 else 1.0

        self.doc_freqs = defaultdict(int)
        for doc in self.corpus:
            for term in set(doc):
                self.doc_freqs[term] += 1

        for term, df in self.doc_freqs.items():
            self.idf[term] = math.log(
                (self.doc_count - df + 0.5) / (df + 0.5) + 1.0
            )
        return self

    def score(self, query: str, doc_idx: int) -> float:
        """BM25 score for a document given a query."""
        if doc_idx >= len(self.corpus) or self.avg_doc_len <= 0:
            return 0.0

        query_terms = self._tokenize(query)
        if not query_terms:
            return 0.0

        doc = self.corpus[doc_idx]
        if not doc:
            return 0.0

        doc_len = len(doc)
        score = 0.0

        term_freq = defaultdict(int)
        for term in doc:
            term_freq[term] += 1

        for term in query_terms:
            if term not in self.idf:
                continue
            tf = term_freq.get(term, 0)
            if tf == 0:
                continue
            numerator = tf * (self.k1 + 1.0)
            denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
            score += self.idf[term] * (numerator / denominator)

        return score

    def get_scores(self, query: str) -> list[float]:
        """Get BM25 scores for all documents."""
        return [self.score(query, i) for i in range(len(self.corpus))]


# ── Reciprocal Rank Fusion ────────────────────────────────────────────────────

def reciprocal_rank_fusion(
    rankings: list[list[tuple[int, float]]],
    k: int = 60
) -> list[tuple[int, float]]:
    """
    RRF merges multiple ranked lists into one (Cormack et al. 2009).
    """
    rrf_scores = defaultdict(float)

    for ranking in rankings:
        for rank, (doc_idx, _) in enumerate(ranking):
            rrf_scores[doc_idx] += 1.0 / (k + rank + 1)

    return sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)


# ── Main Hybrid Search ────────────────────────────────────────────────────────

def hybrid_search(
    texts: list[str],
    query: str,
    query_vector: list[float],
    semantic_scores: list[float],
    top_k: int = 5,
    alpha: float = 0.5,
) -> list[tuple[int, float]]:
    """
    Combine semantic + keyword search using weighted RRF and normalized scoring.

    Args:
        texts:           Candidate document texts in collection
        query:           Search query string
        query_vector:    Query embedding (already computed)
        semantic_scores: Semantic similarity scores from Qdrant
        top_k:           Number of results to return
        alpha:           0.0 = pure keyword (BM25), 1.0 = pure semantic, 0.5 = balanced RRF

    Returns:
        List of (doc_idx, combined_score) sorted by score descending
    """
    if not texts:
        return []

    # 1. Semantic ranking — sort by semantic score (tie-break by doc_idx for deterministic stability)
    semantic_ranking = sorted(
        enumerate(semantic_scores),
        key=lambda x: (x[1], -x[0]),
        reverse=True
    )

    # 2. BM25 keyword ranking
    bm25 = BM25().fit(texts)
    bm25_scores = bm25.get_scores(query)
    max_bm25 = max(bm25_scores) if bm25_scores else 0.0
    norm_bm25 = [
        (s / max_bm25) if max_bm25 > 0 else 0.0
        for s in bm25_scores
    ]

    keyword_ranking = sorted(
        enumerate(bm25_scores),
        key=lambda x: (x[1], -x[0]),
        reverse=True
    )

    # 3. Alpha routing
    if alpha >= 0.95:
        # Pure semantic
        return [(idx, float(score)) for idx, score in semantic_ranking[:top_k] if score > 0]
    elif alpha <= 0.05:
        # Pure keyword (BM25) — return normalized BM25 score in (0, 1] for matched docs
        matched = [
            (idx, round(float(norm_bm25[idx]), 4))
            for idx, raw_s in keyword_ranking
            if raw_s > 0
        ]
        return matched[:top_k]
    else:
        # Weighted RRF + Normalized Score Blending
        semantic_weight = float(alpha)
        keyword_weight = 1.0 - float(alpha)

        rrf_scores: dict[int, float] = defaultdict(float)
        k = 60  # RRF constant

        for rank, (doc_idx, _) in enumerate(semantic_ranking):
            rrf_scores[doc_idx] += semantic_weight / (k + rank + 1)

        for rank, (doc_idx, raw_kw) in enumerate(keyword_ranking):
            if raw_kw > 0:
                rrf_scores[doc_idx] += keyword_weight / (k + rank + 1)

        # Compute readable normalized score in [0, 1] preserving exact RRF rank order
        ranked_indices = sorted(
            rrf_scores.keys(),
            key=lambda idx: (
                rrf_scores[idx],
                semantic_weight * max(0.0, float(semantic_scores[idx])) + keyword_weight * norm_bm25[idx],
                -idx
            ),
            reverse=True
        )

        results = []
        for idx in ranked_indices[:top_k]:
            sem_s = max(0.0, float(semantic_scores[idx]))
            kw_s = norm_bm25[idx]
            blended = semantic_weight * sem_s + keyword_weight * kw_s if kw_s > 0 else sem_s
            results.append((idx, round(max(blended, rrf_scores[idx] * 30.0), 4)))

        return results

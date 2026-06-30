"""
Hybrid Search — Dense (semantic) + Sparse (BM25 keyword) combined.
Better than Pinecone: configurable alpha, per-query tuning, India hosted.

Algorithm:
  1. Semantic search  → top K results with scores
  2. BM25 keyword     → top K results with scores  
  3. Reciprocal Rank Fusion (RRF) → merge both rankings
  4. Return unified ranked results

Why RRF instead of simple weighted average:
  - More robust — outlier scores don't dominate
  - Same method used by Elasticsearch, Pinecone internally
"""
import math
import re
from collections import defaultdict


# ── BM25 Implementation ────────────────────────────────────────────────────────

class BM25:
    """
    BM25 full-text scoring — same algorithm as Elasticsearch.
    k1=1.5, b=0.75 are industry standard defaults.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: list[list[str]] = []
        self.doc_freqs: dict[str, int] = {}
        self.idf: dict[str, float] = {}
        self.avg_doc_len: float = 0
        self.doc_count: int = 0

    def _tokenize(self, text: str) -> list[str]:
        return re.findall(r'\w+', text.lower())

    def fit(self, corpus: list[str]):
        """Build BM25 index from a list of documents."""
        self.corpus = [self._tokenize(doc) for doc in corpus]
        self.doc_count = len(self.corpus)

        if self.doc_count == 0:
            return self

        total_len = sum(len(doc) for doc in self.corpus)
        self.avg_doc_len = total_len / self.doc_count

        # Document frequency for each term
        self.doc_freqs = defaultdict(int)
        for doc in self.corpus:
            for term in set(doc):
                self.doc_freqs[term] += 1

        # IDF scores
        for term, df in self.doc_freqs.items():
            self.idf[term] = math.log(
                (self.doc_count - df + 0.5) / (df + 0.5) + 1
            )
        return self

    def score(self, query: str, doc_idx: int) -> float:
        """BM25 score for a document given a query."""
        if doc_idx >= len(self.corpus):
            return 0.0

        query_terms = self._tokenize(query)
        doc = self.corpus[doc_idx]
        doc_len = len(doc)
        score = 0.0

        term_freq = defaultdict(int)
        for term in doc:
            term_freq[term] += 1

        for term in query_terms:
            if term not in self.idf:
                continue
            tf = term_freq.get(term, 0)
            numerator = tf * (self.k1 + 1)
            denominator = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avg_doc_len)
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
    RRF merges multiple ranked lists into one.
    k=60 is the standard constant (Cormack et al. 2009).
    
    Input: list of [(doc_idx, score), ...] sorted by score desc
    Output: [(doc_idx, rrf_score), ...] sorted by rrf_score desc
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
    Combine semantic + keyword search using RRF.
    
    Args:
        texts:           All document texts in collection
        query:           Search query string
        query_vector:    Query embedding (already computed)
        semantic_scores: Semantic similarity scores from Qdrant
        top_k:           Number of results to return
        alpha:           0.0 = pure keyword, 1.0 = pure semantic, 0.5 = balanced
    
    Returns:
        List of (doc_idx, combined_score) sorted by score
    """
    if not texts:
        return []

    n = len(texts)

    # 1. Semantic ranking — sort by semantic score
    semantic_ranking = sorted(
        enumerate(semantic_scores),
        key=lambda x: x[1],
        reverse=True
    )

    # 2. BM25 keyword ranking
    bm25 = BM25().fit(texts)
    bm25_scores = bm25.get_scores(query)
    keyword_ranking = sorted(
        enumerate(bm25_scores),
        key=lambda x: x[1],
        reverse=True
    )

    # 3. Alpha blending via weighted RRF
    if alpha >= 0.95:
        # Pure semantic
        return [(idx, score) for idx, score in semantic_ranking[:top_k] if score > 0]
    elif alpha <= 0.05:
        # Pure keyword
        return [(idx, score) for idx, score in keyword_ranking[:top_k] if score > 0]
    else:
        # Weighted RRF — alpha controls weight of each method
        semantic_weight = alpha
        keyword_weight = 1 - alpha

        rrf_scores: dict[int, float] = defaultdict(float)
        k = 60  # RRF constant

        for rank, (doc_idx, _) in enumerate(semantic_ranking):
            rrf_scores[doc_idx] += semantic_weight / (k + rank + 1)

        for rank, (doc_idx, _) in enumerate(keyword_ranking):
            rrf_scores[doc_idx] += keyword_weight / (k + rank + 1)

        results = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        return results[:top_k]

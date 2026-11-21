"""
Official Framework Adapters for Iceberg DB
==========================================
Plug-and-play VectorStore & DocumentStore integrations for:
  - LangChain (`IcebergLangChainVectorStore`)
  - LlamaIndex (`IcebergLlamaIndexVectorStore`)
  - Haystack (`IcebergHaystackDocumentStore`)

Supports both Iceberg's built-in Rs.0 CPU Embeddings (384d) AND external embedding models
(OpenAI 1536d/3072d, Cohere 1024d, Voyage 1024d, Titan 1024d, Gemini 768d) via `/vectors/*`.
"""

import uuid
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple
from .client import Client


class IcebergDocument:
    """
    Lightweight Document compatible with LangChain `Document` (`.page_content`, `.metadata`, `.id`)
    and dict-style lookup (`doc["page_content"]`, `doc["metadata"]`).
    """

    def __init__(self, page_content: str, metadata: Optional[Dict[str, Any]] = None, doc_id: Optional[str] = None):
        self.id = doc_id
        self.page_content = page_content
        self.metadata = metadata or {}

    def __getitem__(self, key: str) -> Any:
        if key == "page_content" or key == "text":
            return self.page_content
        if key == "metadata":
            return self.metadata
        if key == "id":
            return self.id
        return self.metadata.get(key)

    def get(self, key: str, default: Any = None) -> Any:
        try:
            val = self[key]
            return default if val is None else val
        except Exception:
            return default

    def __repr__(self) -> str:
        return f"Document(metadata={self.metadata!r}, page_content={self.page_content!r})"


def _make_langchain_doc(page_content: str, metadata: Optional[Dict[str, Any]] = None, doc_id: Optional[str] = None) -> Any:
    try:
        from langchain_core.documents import Document as LCDocument  # type: ignore

        try:
            return LCDocument(page_content=page_content, metadata=metadata or {}, id=doc_id)
        except TypeError:
            return LCDocument(page_content=page_content, metadata=metadata or {})
    except Exception:
        return IcebergDocument(page_content=page_content, metadata=metadata, doc_id=doc_id)


class IcebergRetriever:
    """
    Retriever wrapper compatible with both standalone `.invoke(query)` and LangChain LCEL `|` pipe chains.
    """

    def __init__(self, store: "IcebergLangChainVectorStore", k: int = 4, filter: Optional[Dict[str, Any]] = None, search_type: str = "semantic", alpha: float = 0.5):
        self.store = store
        self.k = k
        self.filter = filter
        self.search_type = search_type
        self.alpha = alpha

    def invoke(self, input_val: Any, config: Optional[Any] = None, **kwargs: Any) -> List[Any]:
        if isinstance(input_val, dict):
            query = str(input_val.get("question") or input_val.get("query") or input_val.get("input") or "")
        else:
            query = str(input_val)
        return self.store.similarity_search(
            query=query,
            k=self.k,
            filter=self.filter,
            search_type=self.search_type,
            alpha=self.alpha,
        )

    def __call__(self, input_val: Any) -> List[Any]:
        return self.invoke(input_val)

    def __or__(self, other: Callable[[Any], Any]) -> Callable[[Any], Any]:
        def _chained(x: Any) -> Any:
            return other(self.invoke(x))

        return _chained


class IcebergHaystackDoc:
    """
    Fallback Haystack Document compatible with `.id`, `.content`, `.meta`, `.score` and Jinja2 templates.
    """

    def __init__(self, doc_id: str, content: str, meta: Optional[Dict[str, Any]] = None, score: float = 0.0):
        self.id = doc_id
        self.content = content
        self.meta = meta or {}
        self.score = score

    def __getitem__(self, key: str) -> Any:
        return getattr(self, key, self.meta.get(key))

    def __repr__(self) -> str:
        return f"Document(id={self.id!r}, score={self.score:.3f}, content={self.content[:60]!r})"


def _make_haystack_doc(doc_id: str, content: str, meta: Optional[Dict[str, Any]] = None, score: float = 0.0) -> Any:
    try:
        from haystack import Document as HSDocument  # type: ignore

        return HSDocument(id=doc_id, content=content, meta=meta or {}, score=score)
    except Exception:
        return IcebergHaystackDoc(doc_id=doc_id, content=content, meta=meta, score=score)


class IcebergLangChainVectorStore:
    """
    LangChain-compatible VectorStore backed by IcebergCore.
    Works seamlessly both with `langchain-core` LCEL chains and standalone Python scripts.
    """

    def __init__(
        self,
        collection_name: str,
        embedding: Optional[Any] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        namespace: str = "",
        dimension: Optional[int] = None,
        metric: str = "cosine",
        quantization: str = "float32",
        client: Optional[Client] = None,
    ):
        self.collection_name = collection_name
        self.embedding = embedding
        self.namespace = namespace
        self.client = client or Client(
            api_key=api_key,
            base_url=base_url,
            integration="langchain-iceberg",
        )
        if dimension is not None:
            self.client.create_collection(
                name=collection_name,
                dimension=dimension,
                metric=metric,
                quantization=quantization,
            )

    @classmethod
    def from_texts(
        cls,
        texts: Iterable[str],
        embedding: Optional[Any] = None,
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None,
        collection_name: str = "langchain-iceberg",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        namespace: str = "",
        dimension: Optional[int] = None,
        metric: str = "cosine",
        quantization: str = "float32",
        client: Optional[Client] = None,
    ) -> "IcebergLangChainVectorStore":
        text_list = list(texts)
        inferred_vecs: Optional[List[List[float]]] = None
        if dimension is None and embedding is not None and text_list:
            if hasattr(embedding, "embed_documents"):
                inferred_vecs = embedding.embed_documents(text_list)
            elif callable(embedding):
                inferred_vecs = [list(embedding(t)) for t in text_list]
            if inferred_vecs and len(inferred_vecs[0]) > 0:
                dimension = len(inferred_vecs[0])

        store = cls(
            collection_name=collection_name,
            embedding=embedding,
            api_key=api_key,
            base_url=base_url,
            namespace=namespace,
            dimension=dimension or (384 if embedding is None else None),
            metric=metric,
            quantization=quantization,
            client=client,
        )
        if text_list:
            store.add_texts(text_list, metadatas=metadatas, ids=ids, _precomputed_vectors=inferred_vecs)
        return store

    @classmethod
    def from_documents(
        cls,
        documents: Iterable[Any],
        embedding: Optional[Any] = None,
        ids: Optional[List[str]] = None,
        collection_name: str = "langchain-iceberg",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        namespace: str = "",
        dimension: Optional[int] = None,
        metric: str = "cosine",
        quantization: str = "float32",
        client: Optional[Client] = None,
    ) -> "IcebergLangChainVectorStore":
        docs_list = list(documents)
        texts = [
            getattr(d, "page_content", None) or (d.get("page_content", "") if isinstance(d, dict) else str(d))
            for d in docs_list
        ]
        metadatas = [
            dict(getattr(d, "metadata", None) or (d.get("metadata", {}) if isinstance(d, dict) else {}))
            for d in docs_list
        ]
        resolved_ids = ids or [
            str(getattr(d, "id", None) or (d.get("id") if isinstance(d, dict) else None) or uuid.uuid4())
            for d in docs_list
        ]
        return cls.from_texts(
            texts=texts,
            embedding=embedding,
            metadatas=metadatas,
            ids=resolved_ids,
            collection_name=collection_name,
            api_key=api_key,
            base_url=base_url,
            namespace=namespace,
            dimension=dimension,
            metric=metric,
            quantization=quantization,
            client=client,
        )

    def _embed_docs(self, texts: List[str]) -> Optional[List[List[float]]]:
        if self.embedding is None:
            return None
        if hasattr(self.embedding, "embed_documents"):
            return self.embedding.embed_documents(texts)
        if callable(self.embedding):
            return [list(self.embedding(t)) for t in texts]
        return None

    def _embed_query(self, text: str) -> Optional[List[float]]:
        if self.embedding is None:
            return None
        if hasattr(self.embedding, "embed_query"):
            return self.embedding.embed_query(text)
        if callable(self.embedding):
            return list(self.embedding(text))
        return None

    def add_texts(
        self,
        texts: Iterable[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None,
        _precomputed_vectors: Optional[List[List[float]]] = None,
    ) -> List[str]:
        text_list = list(texts)
        if not text_list:
            return []
        id_list = ids or [str(uuid.uuid4()) for _ in text_list]
        meta_list = metadatas or [{} for _ in text_list]

        vecs = _precomputed_vectors if _precomputed_vectors is not None else self._embed_docs(text_list)
        if vecs is not None:
            records = [
                {"id": str(id_list[i]), "values": vecs[i], "text": text_list[i], "metadata": meta_list[i]}
                for i in range(len(text_list))
            ]
            self.client.upsert_vectors(self.collection_name, records, namespace=self.namespace)
            return [str(x) for x in id_list]

        for i, txt in enumerate(text_list):
            self.client.upsert_point(
                collection=self.collection_name,
                point_id=str(id_list[i]),
                text=txt,
                metadata=meta_list[i],
            )
        return [str(x) for x in id_list]

    def add_documents(self, documents: Iterable[Any], ids: Optional[List[str]] = None) -> List[str]:
        docs_list = list(documents)
        texts = [
            getattr(d, "page_content", None) or (d.get("page_content", "") if isinstance(d, dict) else str(d))
            for d in docs_list
        ]
        metadatas = [
            dict(getattr(d, "metadata", None) or (d.get("metadata", {}) if isinstance(d, dict) else {}))
            for d in docs_list
        ]
        resolved_ids = ids or [
            str(getattr(d, "id", None) or (d.get("id") if isinstance(d, dict) else None) or uuid.uuid4())
            for d in docs_list
        ]
        return self.add_texts(texts=texts, metadatas=metadatas, ids=resolved_ids)

    def similarity_search_with_score(
        self,
        query: str,
        k: int = 4,
        filter: Optional[Dict[str, Any]] = None,
        search_type: str = "semantic",
        alpha: float = 0.5,
    ) -> List[Tuple[Any, float]]:
        q_vec = self._embed_query(query)
        if q_vec is not None:
            res = self.client.query_vectors(
                collection=self.collection_name,
                vector=q_vec,
                query_text=query if search_type != "semantic" else None,
                top_k=k,
                filter=filter,
                namespace=self.namespace,
                search_type=search_type,
                alpha=alpha,
                include_metadata=True,
            )
            out: List[Tuple[Any, float]] = []
            for m in res.get("matches", []):
                meta = dict(m.get("metadata") or {})
                meta.pop("text", None)
                txt = m.get("text") or m.get("metadata", {}).get("text", "")
                out.append((_make_langchain_doc(txt, meta, m.get("id")), float(m.get("score", 0.0))))
            return out

        hits = self.client.search(
            collection=self.collection_name,
            query=query,
            top_k=k,
            search_type="hybrid" if search_type == "similarity" else search_type,
            alpha=alpha,
            namespace=self.namespace or None,
            filters=filter,
        )
        return [(_make_langchain_doc(h.text, h.metadata, h.id), float(h.score)) for h in hits]

    def similarity_search(
        self,
        query: str,
        k: int = 4,
        filter: Optional[Dict[str, Any]] = None,
        search_type: str = "semantic",
        alpha: float = 0.5,
    ) -> List[Any]:
        return [
            doc
            for doc, _ in self.similarity_search_with_score(
                query=query,
                k=k,
                filter=filter,
                search_type=search_type,
                alpha=alpha,
            )
        ]

    def as_retriever(
        self,
        search_type: str = "similarity",
        search_kwargs: Optional[Dict[str, Any]] = None,
        k: int = 4,
        **kwargs: Any,
    ) -> Any:
        kw = dict(search_kwargs or {})
        resolved_k = int(kw.get("k", k))
        resolved_filter = kw.get("filter", kwargs.get("filter"))
        resolved_mode = "hybrid" if search_type == "hybrid" else "semantic"
        resolved_alpha = float(kw.get("alpha", kwargs.get("alpha", 0.5)))

        base = IcebergRetriever(
            store=self,
            k=resolved_k,
            filter=resolved_filter,
            search_type=resolved_mode,
            alpha=resolved_alpha,
        )
        try:
            from langchain_core.runnables import RunnableLambda  # type: ignore

            return RunnableLambda(base.invoke)
        except Exception:
            return base

    def delete(self, ids: Optional[List[str]] = None, filter: Optional[Dict[str, Any]] = None) -> bool:
        self.client.delete_vectors(
            collection=self.collection_name,
            ids=ids,
            filter=filter,
            namespace=self.namespace,
        )
        return True


class IcebergLlamaIndexVectorStore:
    """
    LlamaIndex-compatible VectorStore backed by IcebergCore.
    """

    stores_text: bool = True

    def __init__(
        self,
        collection_name: str,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        namespace: str = "",
        dimension: int = 1536,
        metric: str = "cosine",
        quantization: str = "float32",
        client: Optional[Client] = None,
    ):
        self.collection_name = collection_name
        self.namespace = namespace
        self.client = client or Client(
            api_key=api_key,
            base_url=base_url,
            integration="llamaindex-iceberg",
        )
        self.client.create_collection(
            name=collection_name,
            dimension=dimension,
            metric=metric,
            quantization=quantization,
        )

    def add(self, nodes: List[Any]) -> List[str]:
        records = []
        ids = []
        for node in nodes:
            nid = (
                getattr(node, "node_id", None)
                or getattr(node, "id_", None)
                or (node.get("id") if isinstance(node, dict) else str(uuid.uuid4()))
            )
            emb = getattr(node, "embedding", None) or (node.get("embedding") if isinstance(node, dict) else None)
            txt = (
                node.get_content()
                if hasattr(node, "get_content")
                else (node.get("text", "") if isinstance(node, dict) else "")
            )
            meta = getattr(node, "metadata", None) or (node.get("metadata", {}) if isinstance(node, dict) else {})
            ids.append(str(nid))
            records.append({"id": str(nid), "values": emb, "text": txt, "metadata": meta})
        self.client.upsert_vectors(self.collection_name, records, namespace=self.namespace)
        return ids

    def query(
        self,
        query_embedding: List[float],
        similarity_top_k: int = 5,
        query_str: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
        mode: str = "semantic",
    ) -> List[Dict[str, Any]]:
        res = self.client.query_vectors(
            collection=self.collection_name,
            vector=query_embedding,
            query_text=query_str,
            top_k=similarity_top_k,
            filter=filters,
            namespace=self.namespace,
            search_type=mode,
            include_metadata=True,
        )
        return res.get("matches", [])


class IcebergHaystackDocumentStore:
    """
    Haystack 2.x-compatible DocumentStore backed by IcebergCore.
    """

    def __init__(
        self,
        collection_name: str,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        namespace: str = "",
        dimension: int = 384,
        metric: str = "cosine",
        quantization: str = "float32",
        client: Optional[Client] = None,
    ):
        self.collection_name = collection_name
        self.namespace = namespace
        self.client = client or Client(
            api_key=api_key,
            base_url=base_url,
            integration="haystack-iceberg",
        )
        self.client.create_collection(
            name=collection_name,
            dimension=dimension,
            metric=metric,
            quantization=quantization,
        )

    def count_documents(self) -> int:
        info = self.client.describe_collection_stats(self.collection_name)
        return int(info.get("vector_count", 0))

    def write_documents(self, documents: List[Any]) -> int:
        vec_records = []
        text_count = 0
        for d in documents:
            did = getattr(d, "id", None) or (d.get("id") if isinstance(d, dict) else str(uuid.uuid4()))
            content = getattr(d, "content", None) or (d.get("content", "") if isinstance(d, dict) else "")
            emb = getattr(d, "embedding", None) or (d.get("embedding") if isinstance(d, dict) else None)
            meta = getattr(d, "meta", None) or (d.get("meta", {}) if isinstance(d, dict) else {})
            if emb is not None:
                vec_records.append({"id": str(did), "values": emb, "text": content, "metadata": meta})
            else:
                self.client.upsert_point(self.collection_name, str(did), text=content, metadata=meta)
                text_count += 1
        if vec_records:
            self.client.upsert_vectors(self.collection_name, vec_records, namespace=self.namespace)
        return len(vec_records) + text_count

    def retrieve_by_embedding(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Any]:
        res = self.client.query_vectors(
            collection=self.collection_name,
            vector=query_embedding,
            top_k=top_k,
            filter=filters,
            namespace=self.namespace,
            include_metadata=True,
        )
        docs: List[Any] = []
        for m in res.get("matches", []):
            meta = dict(m.get("metadata") or {})
            meta.pop("text", None)
            txt = m.get("text") or m.get("metadata", {}).get("text", "")
            docs.append(_make_haystack_doc(str(m.get("id", "")), txt, meta, float(m.get("score", 0.0))))
        return docs

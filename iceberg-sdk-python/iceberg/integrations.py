"""
Official Framework Adapters for Iceberg DB (v1.0.0)
===================================================
Plug-and-play VectorStore integrations for:
  - LangChain (`IcebergLangChainVectorStore`)
  - LlamaIndex (`IcebergLlamaIndexVectorStore`)
  - Haystack (`IcebergHaystackDocumentStore`)

Supports both Iceberg's built-in Rs.0 CPU Embeddings (384d) AND external embedding models
(OpenAI 1536d/3072d, Cohere 1024d, Voyage 1024d, Gemini 768d) via `/vectors/*`.
"""

import uuid
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple
from .client import Client


class IcebergLangChainVectorStore:
    """
    LangChain-compatible VectorStore backed by IcebergCore v1.0.0.
    Works with or without `langchain-core` installed.
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
    ):
        self.collection_name = collection_name
        self.embedding = embedding
        self.namespace = namespace
        self.client = Client(
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
    ) -> List[str]:
        text_list = list(texts)
        if not text_list:
            return []
        id_list = ids or [str(uuid.uuid4()) for _ in text_list]
        meta_list = metadatas or [{} for _ in text_list]

        vecs = self._embed_docs(text_list)
        if vecs is not None:
            records = [
                {"id": id_list[i], "values": vecs[i], "text": text_list[i], "metadata": meta_list[i]}
                for i in range(len(text_list))
            ]
            self.client.upsert_vectors(self.collection_name, records, namespace=self.namespace)
            return id_list

        # Server-side 384d CPU embedding path
        for i, txt in enumerate(text_list):
            self.client.upsert_point(
                collection=self.collection_name,
                point_id=id_list[i],
                text=txt,
                metadata=meta_list[i],
            )
        return id_list

    def similarity_search_with_score(
        self,
        query: str,
        k: int = 4,
        filter: Optional[Dict[str, Any]] = None,
        search_type: str = "hybrid",
        alpha: float = 0.5,
    ) -> List[Tuple[Dict[str, Any], float]]:
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
            return [
                (
                    {"id": m["id"], "page_content": m.get("text", ""), "metadata": m.get("metadata", {})},
                    float(m["score"]),
                )
                for m in res.get("matches", [])
            ]

        hits = self.client.search(
            collection=self.collection_name,
            query=query,
            top_k=k,
            search_type=search_type,
            alpha=alpha,
            namespace=self.namespace or None,
            filters=filter,
        )
        return [
            ({"id": h.id, "page_content": h.text, "metadata": h.metadata}, float(h.score))
            for h in hits
        ]

    def similarity_search(
        self,
        query: str,
        k: int = 4,
        filter: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        return [doc for doc, _ in self.similarity_search_with_score(query=query, k=k, filter=filter)]

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
    LlamaIndex-compatible VectorStore backed by IcebergCore v1.0.0.
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
    ):
        self.collection_name = collection_name
        self.namespace = namespace
        self.client = Client(
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
            nid = getattr(node, "node_id", None) or getattr(node, "id_", None) or (
                node.get("id") if isinstance(node, dict) else str(uuid.uuid4())
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
    ) -> Dict[str, Any]:
        return self.client.query_vectors(
            collection=self.collection_name,
            vector=query_embedding,
            query_text=query_str,
            top_k=similarity_top_k,
            filter=filters,
            namespace=self.namespace,
            search_type=mode,
            include_metadata=True,
        )


class IcebergHaystackDocumentStore:
    """
    Haystack 2.x-compatible DocumentStore backed by IcebergCore v1.0.0.
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
    ):
        self.collection_name = collection_name
        self.namespace = namespace
        self.client = Client(
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
        return int(self.client.collection_info(self.collection_name).get("vector_count", 0))

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

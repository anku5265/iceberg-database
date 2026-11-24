"""
Official Iceberg CLI (`iceberg`) -- v1.0.0.

Provides terminal-based index, vector, hybrid search, and 4-tier memory management
without requiring an agent in the loop.
"""
import argparse
import json
import os
import sys
from .client import Client, IcebergError


def _get_client(args) -> Client:
    api_key = getattr(args, "api_key", None) or os.environ.get("ICEBERG_API_KEY", "")
    base_url = getattr(args, "base_url", None) or os.environ.get("ICEBERG_API_URL", "https://api.icebergdb.in")
    if not api_key:
        print("Error: Set ICEBERG_API_KEY or pass --api-key.", file=sys.stderr)
        sys.exit(1)
    return Client(api_key=api_key, base_url=base_url, source_tag="iceberg_cli")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        prog="iceberg",
        description="Iceberg DB Official CLI (v1.0.0) -- India-hosted serverless vector & hybrid search",
    )
    parser.add_argument("--api-key", help="Iceberg API key (defaults to ICEBERG_API_KEY)")
    parser.add_argument("--base-url", help="Iceberg API URL (defaults to https://api.icebergdb.in)")
    parser.add_argument("--version", action="version", version="iceberg 1.0.0")

    sub = parser.add_subparsers(dest="command")

    sub.add_parser("status", help="Check Iceberg API status and region")

    idx_parser = sub.add_parser("index", help="Manage vector collections/indexes")
    idx_sub = idx_parser.add_subparsers(dest="index_cmd")
    idx_sub.add_parser("list", help="List collections")

    p_create = idx_sub.add_parser("create", help="Create a collection")
    p_create.add_argument("name", help="Collection name")
    p_create.add_argument("--dimension", type=int, default=384, help="Vector dimension (default: 384)")
    p_create.add_argument("--metric", default="cosine", choices=["cosine", "dotproduct", "euclidean"])

    p_stats = idx_sub.add_parser("stats", help="Describe collection stats")
    p_stats.add_argument("name", help="Collection name")

    p_del = idx_sub.add_parser("delete", help="Delete a collection")
    p_del.add_argument("name", help="Collection name")

    p_ingest = sub.add_parser("ingest", help="Chunk and embed text into a collection")
    p_ingest.add_argument("collection", help="Collection name")
    p_ingest.add_argument("text", help="Plain text to index")

    p_query = sub.add_parser("query", help="Run hybrid, semantic, or keyword search")
    p_query.add_argument("collection", help="Collection name")
    p_query.add_argument("query", help="Query string")
    p_query.add_argument("--top-k", type=int, default=5)
    p_query.add_argument("--type", default="hybrid", choices=["hybrid", "semantic", "keyword"])

    mem_parser = sub.add_parser("memory", help="Manage 4-tier cognitive agent memory")
    mem_sub = mem_parser.add_subparsers(dest="mem_cmd")
    p_rem = mem_sub.add_parser("remember", help="Store an agent memory")
    p_rem.add_argument("agent_id")
    p_rem.add_argument("content")
    p_rem.add_argument("--tier", default="semantic", choices=["short_term", "episodic", "long_term", "semantic"])

    p_rec = mem_sub.add_parser("recall", help="Recall agent memories")
    p_rec.add_argument("agent_id")
    p_rec.add_argument("query")
    p_rec.add_argument("--top-k", type=int, default=5)

    args = parser.parse_args(argv)
    if not args.command:
        parser.print_help()
        return 0

    try:
        if args.command == "status":
            import httpx
            url = (args.base_url or os.environ.get("ICEBERG_API_URL", "https://api.icebergdb.in")).rstrip("/")
            r = httpx.get(f"{url}/", timeout=10.0)
            print(json.dumps(r.json(), indent=2))
            return 0

        ib = _get_client(args)
        if args.command == "index":
            if args.index_cmd == "list":
                print(json.dumps({"collections": ib.list_collections()}, indent=2))
            elif args.index_cmd == "create":
                res = ib.create_collection(args.name, dimension=args.dimension, metric=args.metric)
                print(json.dumps(res, indent=2))
            elif args.index_cmd == "stats":
                print(json.dumps(ib.describe_collection_stats(args.name), indent=2))
            elif args.index_cmd == "delete":
                print(json.dumps(ib.delete_collection(args.name), indent=2))
            else:
                idx_parser.print_help()
        elif args.command == "ingest":
            print(json.dumps(ib.index_text(args.collection, args.text), indent=2))
        elif args.command == "query":
            hits = ib.search(args.collection, args.query, top_k=args.top_k, search_type=args.type)
            out = [{"id": h.id, "score": round(h.score, 4), "text": h.text, "metadata": h.metadata} for h in hits]
            print(json.dumps({"matches": out}, indent=2))
        elif args.command == "memory":
            if args.mem_cmd == "remember":
                print(json.dumps(ib.remember(args.agent_id, args.content, memory_type=args.tier), indent=2))
            elif args.mem_cmd == "recall":
                hits = ib.recall(args.agent_id, args.query, top_k=args.top_k)
                out = [{"score": round(m.score, 4), "tier": m.type, "content": m.content} for m in hits]
                print(json.dumps({"memories": out}, indent=2))
            else:
                mem_parser.print_help()
        return 0
    except IcebergError as exc:
        print(f"IcebergError: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

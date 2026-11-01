"""
Built-in Model Context Protocol (MCP) stdio server for Iceberg Vector Database.
Run via:
    python -m iceberg.mcp
Requires ICEBERG_API_KEY in environment.
"""
import sys
import json
import os
from .client import Client

TOOLS = [
    {
        "name": "iceberg_search",
        "description": "Run semantic, keyword, or hybrid search on an Iceberg DB collection.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "collection": {"type": "string", "description": "Collection name"},
                "query": {"type": "string", "description": "Search query"},
                "top_k": {"type": "integer", "default": 5},
                "search_type": {"type": "string", "default": "hybrid"},
            },
            "required": ["collection", "query"],
        },
    },
    {
        "name": "iceberg_index_text",
        "description": "Index plain text into an Iceberg DB collection with automatic Mumbai embeddings.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "collection": {"type": "string"},
                "text": {"type": "string"},
                "source": {"type": "string", "default": "mcp"},
            },
            "required": ["collection", "text"],
        },
    },
    {
        "name": "iceberg_remember",
        "description": "Store a memory for an AI agent in Iceberg 4-tier cognitive memory.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "agent_id": {"type": "string"},
                "content": {"type": "string"},
                "memory_type": {"type": "string", "default": "long_term"},
            },
            "required": ["agent_id", "content"],
        },
    },
    {
        "name": "iceberg_recall",
        "description": "Recall relevant memories for an AI agent from Iceberg Memory.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "agent_id": {"type": "string"},
                "query": {"type": "string"},
                "top_k": {"type": "integer", "default": 5},
            },
            "required": ["agent_id", "query"],
        },
    },
]


def main():
    client = Client(
        api_key=os.environ.get("ICEBERG_API_KEY", ""),
        base_url=os.environ.get("ICEBERG_API_URL", "https://api.icebergdb.in"),
    )
    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except Exception:
            continue
        req_id = msg.get("id")
        method = msg.get("method", "")
        params = msg.get("params") or {}

        if method == "initialize":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "iceberg-db-mcp", "version": "0.2.0"},
                },
            }
        elif method == "tools/list":
            resp = {"jsonrpc": "2.0", "id": req_id, "result": {"tools": TOOLS}}
        elif method == "tools/call":
            name = params.get("name")
            args = params.get("arguments") or {}
            try:
                if name == "iceberg_search":
                    hits = client.search(
                        args["collection"],
                        args["query"],
                        top_k=int(args.get("top_k", 5)),
                        search_type=args.get("search_type", "hybrid"),
                    )
                    out = [{"score": h.score, "text": h.text, "metadata": h.metadata} for h in hits]
                elif name == "iceberg_index_text":
                    out = client.index_text(args["collection"], args["text"], source=args.get("source", "mcp"))
                elif name == "iceberg_remember":
                    out = client.remember(args["agent_id"], args["content"], memory_type=args.get("memory_type", "long_term"))
                elif name == "iceberg_recall":
                    mems = client.recall(args["agent_id"], args["query"], top_k=int(args.get("top_k", 5)))
                    out = [{"score": m.score, "content": m.content, "type": m.type} for m in mems]
                else:
                    out = {"error": f"Unknown tool: {name}"}
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"content": [{"type": "text", "text": json.dumps(out, ensure_ascii=False)}]},
                }
            except Exception as e:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"content": [{"type": "text", "text": f"Error: {e}"}], "isError": True},
                }
        elif req_id is not None:
            resp = {"jsonrpc": "2.0", "id": req_id, "result": {}}
        else:
            continue

        sys.stdout.write(json.dumps(resp) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()

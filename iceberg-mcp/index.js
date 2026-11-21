#!/usr/bin/env node
/**
 * Iceberg DB — Official Model Context Protocol (MCP) Stdio Server (v1.1.0)
 * Connects Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI & Windsurf
 * directly to Iceberg DB (https://api.icebergdb.in):
 *   - Vector Database (Hybrid RRF, Semantic 384d ONNX, BM25)
 *   - 4-Tier Cognitive Agent Memory (Remember & Recall)
 *   - Managed RAG Assistants (Create, Upload PDF/Docs, Chat, List, Delete)
 *
 * Usage:
 *   ICEBERG_API_KEY=ibsk_your_key npx -y iceberg-mcp
 *   npx -y iceberg-mcp --api-key ibsk_your_key
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

function resolveCliApiKey() {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--api-key" && argv[i + 1]) {
      return argv[i + 1].trim();
    }
    if (argv[i].startsWith("--api-key=")) {
      return argv[i].slice("--api-key=".length).trim();
    }
  }
  return "";
}

const API_KEY = (process.env.ICEBERG_API_KEY || resolveCliApiKey() || "").trim();
const API_URL = (process.env.ICEBERG_API_URL || "https://api.icebergdb.in").replace(/\/+$/, "");

const TOOLS = [
  {
    name: "iceberg_search",
    description:
      "Run hybrid (dense 384d + BM25 RRF), semantic, or keyword search on an Iceberg DB collection hosted in India (ap-south-1).",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection name (e.g. 'my_docs')" },
        query: { type: "string", description: "Search query text" },
        top_k: { type: "integer", description: "Number of results to return (default: 5)", default: 5 },
        search_type: {
          type: "string",
          description: "'hybrid' | 'semantic' | 'keyword'",
          default: "hybrid",
        },
      },
      required: ["collection", "query"],
    },
  },
  {
    name: "iceberg_index_text",
    description:
      "Index plain text into an Iceberg DB collection with automatic server-side 384d CPU embeddings.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Target collection name" },
        text: { type: "string", description: "Text content to chunk, embed, and index" },
        source: { type: "string", description: "Optional source label", default: "mcp" },
      },
      required: ["collection", "text"],
    },
  },
  {
    name: "iceberg_remember",
    description:
      "Store a persistent memory for an AI agent in Iceberg 4-tier cognitive memory (short_term, episodic, long_term, semantic).",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent or user identifier (e.g. 'coder_agent')" },
        content: { type: "string", description: "Fact, preference, or event to remember" },
        memory_type: {
          type: "string",
          description: "'long_term' | 'short_term' | 'episodic' | 'semantic'",
          default: "long_term",
        },
      },
      required: ["agent_id", "content"],
    },
  },
  {
    name: "iceberg_recall",
    description:
      "Recall relevant memories for an AI agent from Iceberg 4-tier cognitive memory.",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent or user identifier" },
        query: { type: "string", description: "Question or context to recall" },
        top_k: { type: "integer", description: "Max memories to return (default: 5)", default: 5 },
      },
      required: ["agent_id", "query"],
    },
  },
  {
    name: "iceberg_list_collections",
    description: "List all vector collections in the authenticated Iceberg DB project.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "iceberg_create_collection",
    description:
      "Create a new vector collection (default 384d CPU embeddings, or custom 768d/1024d/1536d/3072d HNSW + Okapi BM25 with float32/sq8/binary quantization).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Collection name" },
        dimension: { type: "integer", description: "Vector dimension (default: 384)", default: 384 },
        metric: {
          type: "string",
          description: "'cosine' | 'dotproduct' | 'euclidean' | 'manhattan'",
          default: "cosine",
        },
        quantization: {
          type: "string",
          description: "'float32' | 'sq8' | 'binary'",
          default: "float32",
        },
        description: { type: "string", description: "Optional collection description", default: "" },
      },
      required: ["name"],
    },
  },
  {
    name: "iceberg_collection_info",
    description: "Inspect vector count, dimension, metric, quantization, and namespace stats for a collection.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Collection name" },
      },
      required: ["name"],
    },
  },
  {
    name: "iceberg_delete_collection",
    description: "Delete a vector collection and release its storage quota.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Collection name to delete" },
      },
      required: ["name"],
    },
  },
  {
    name: "iceberg_create_assistant",
    description:
      "Create a managed Iceberg RAG Assistant in India (ap-south-1) with automatic Web Widget (widget.js), WhatsApp webhook, and 6 pluggable LLMs.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Assistant name (e.g. 'support-assistant')" },
        instructions: {
          type: "string",
          description: "System prompt/instructions guiding how the assistant answers",
          default: "Answer concisely using the uploaded documents.",
        },
        llm_provider: {
          type: "string",
          description: "'iceberg_fast' | 'groq' | 'claude' | 'openai' | 'gemini' | 'deepseek'",
          default: "iceberg_fast",
        },
        llm_api_key: {
          type: "string",
          description: "Optional external provider API key (leave empty for iceberg_fast)",
          default: "",
        },
        greeting: {
          type: "string",
          description: "Initial greeting shown in the chat widget",
          default: "Hi! How can I help you?",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "iceberg_list_assistants",
    description: "List all Iceberg RAG Assistants in the authenticated project.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "iceberg_upload_assistant_doc",
    description:
      "Train an Iceberg Assistant by uploading either raw text/Markdown OR a local file path (.pdf, .md, .txt) — automatically chunked and embedded via Rs 0 384d ONNX CPU.",
    inputSchema: {
      type: "object",
      properties: {
        assistant_id: {
          type: "string",
          description: "Assistant ID or exact assistant name",
        },
        text: {
          type: "string",
          description: "Plain text or Markdown content to upload (optional if file_path is set)",
        },
        filename: {
          type: "string",
          description: "Filename label for citations when uploading text (default: 'knowledge.md')",
          default: "knowledge.md",
        },
        file_path: {
          type: "string",
          description: "Optional local path to a .pdf, .md, or .txt file to upload directly",
        },
      },
      required: ["assistant_id"],
    },
  },
  {
    name: "iceberg_chat_assistant",
    description:
      "Ask a question to an Iceberg Assistant and get a grounded answer with document citations.",
    inputSchema: {
      type: "object",
      properties: {
        assistant_id: {
          type: "string",
          description: "Assistant ID or exact assistant name",
        },
        message: {
          type: "string",
          description: "Question or message to ask the assistant",
        },
        session_id: {
          type: "string",
          description: "Optional conversation/user session ID",
        },
      },
      required: ["assistant_id", "message"],
    },
  },
  {
    name: "iceberg_delete_assistant",
    description: "Delete an Iceberg Assistant and its isolated vector collection.",
    inputSchema: {
      type: "object",
      properties: {
        assistant_id: {
          type: "string",
          description: "Assistant ID to delete",
        },
      },
      required: ["assistant_id"],
    },
  },
];

async function callApi(urlPath, method = "GET", body = null, isForm = false) {
  const headers = {
    "X-API-Key": API_KEY,
    "X-Iceberg-Integration": "iceberg-mcp",
  };
  const opts = { method, headers };

  if (body && isForm) {
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null) form.append(k, String(v));
    }
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    opts.body = form.toString();
  } else if (body) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${urlPath}`, opts);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, body: text };
  }
}

async function uploadMultipartToAssistant(assistantId, fileBuffer, filename, mimeType) {
  const boundary = "----IcebergMcpBoundary" + Date.now().toString(16) + Math.random().toString(16).slice(2);
  const safeName = String(filename || "knowledge.md").replace(/["\r\n]/g, "_");
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${safeName}"\r\n` +
      `Content-Type: ${mimeType || "text/plain; charset=utf-8"}\r\n\r\n`,
    "utf8"
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, "utf8");
  const payload = Buffer.concat([head, fileBuffer, tail]);

  const res = await fetch(`${API_URL}/assistant/${encodeURIComponent(assistantId)}/upload`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: payload,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, body: text };
  }
}

async function handleToolCall(name, args = {}) {
  if (!API_KEY) {
    throw new Error(
      "Missing ICEBERG_API_KEY environment variable. Get a free key at https://dashboard.icebergdb.in/signup"
    );
  }

  if (name === "iceberg_search") {
    return await callApi("/search", "POST", {
      collection: args.collection,
      query: args.query,
      top_k: Number(args.top_k || 5),
      search_type: args.search_type || "hybrid",
    });
  }

  if (name === "iceberg_index_text") {
    await callApi("/collections", "POST", { name: args.collection }).catch(() => {});
    return await callApi(
      "/documents/text",
      "POST",
      {
        collection: args.collection,
        text: args.text,
        source: args.source || "mcp",
      },
      true
    );
  }

  if (name === "iceberg_remember") {
    return await callApi(`/memory/${encodeURIComponent(args.agent_id)}/remember`, "POST", {
      content: args.content,
      memory_type: args.memory_type || "long_term",
    });
  }

  if (name === "iceberg_recall") {
    return await callApi(`/memory/${encodeURIComponent(args.agent_id)}/recall`, "POST", {
      query: args.query,
      top_k: Number(args.top_k || 5),
    });
  }

  if (name === "iceberg_list_collections") {
    return await callApi("/collections", "GET");
  }

  if (name === "iceberg_create_collection") {
    return await callApi("/collections", "POST", {
      name: args.name,
      dimension: Number(args.dimension || 384),
      metric: args.metric || "cosine",
      quantization: args.quantization || "float32",
      description: args.description || "",
    });
  }

  if (name === "iceberg_collection_info") {
    return await callApi(`/collections/${encodeURIComponent(args.name)}/stats`, "GET");
  }

  if (name === "iceberg_delete_collection") {
    return await callApi(`/collections/${encodeURIComponent(args.name)}`, "DELETE");
  }

  if (name === "iceberg_create_assistant") {
    const instructions = args.instructions || "Answer concisely using the uploaded documents.";
    return await callApi("/assistant", "POST", {
      name: args.name,
      instructions,
      description: instructions,
      llm_provider: args.llm_provider || "iceberg_fast",
      llm_api_key: args.llm_api_key || "",
      greeting: args.greeting || "Hi! How can I help you?",
    });
  }

  if (name === "iceberg_list_assistants") {
    return await callApi("/assistant", "GET");
  }

  if (name === "iceberg_upload_assistant_doc") {
    if (args.file_path) {
      const resolved = path.resolve(String(args.file_path));
      if (!fs.existsSync(resolved)) {
        throw new Error(`File not found: ${resolved}`);
      }
      const buf = fs.readFileSync(resolved);
      const base = path.basename(resolved);
      const mime = base.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "text/plain; charset=utf-8";
      return await uploadMultipartToAssistant(args.assistant_id, buf, base, mime);
    }
    if (!args.text || !String(args.text).trim()) {
      throw new Error("Provide either 'text' or 'file_path' to upload to the assistant.");
    }
    const buf = Buffer.from(String(args.text), "utf8");
    const fname = args.filename || "knowledge.md";
    return await uploadMultipartToAssistant(args.assistant_id, buf, fname, "text/plain; charset=utf-8");
  }

  if (name === "iceberg_chat_assistant") {
    const body = { message: args.message };
    if (args.session_id) body.session_id = args.session_id;
    return await callApi(
      `/assistant/${encodeURIComponent(args.assistant_id)}/chat`,
      "POST",
      body
    );
  }

  if (name === "iceberg_delete_assistant") {
    return await callApi(`/assistant/${encodeURIComponent(args.assistant_id)}`, "DELETE");
  }

  throw new Error(`Unknown tool: ${name}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

rl.on("line", async (rawLine) => {
  const line = rawLine.trim();
  if (!line) return;

  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }

  const reqId = msg.id;
  const method = msg.method || "";
  const params = msg.params || {};

  if (method === "initialize") {
    const resp = {
      jsonrpc: "2.0",
      id: reqId,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "iceberg-mcp", version: "1.1.0" },
      },
    };
    process.stdout.write(JSON.stringify(resp) + "\n");
    return;
  }

  if (method === "tools/list") {
    const resp = {
      jsonrpc: "2.0",
      id: reqId,
      result: { tools: TOOLS },
    };
    process.stdout.write(JSON.stringify(resp) + "\n");
    return;
  }

  if (method === "tools/call") {
    try {
      const out = await handleToolCall(params.name, params.arguments || {});
      const resp = {
        jsonrpc: "2.0",
        id: reqId,
        result: {
          content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
        },
      };
      process.stdout.write(JSON.stringify(resp) + "\n");
    } catch (err) {
      const resp = {
        jsonrpc: "2.0",
        id: reqId,
        result: {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        },
      };
      process.stdout.write(JSON.stringify(resp) + "\n");
    }
    return;
  }

  if (reqId !== undefined && reqId !== null) {
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: reqId, result: {} }) + "\n");
  }
});

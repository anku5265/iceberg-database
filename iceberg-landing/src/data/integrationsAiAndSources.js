// Iceberg DB v1.0.0 -- Integrations Data Module 1
// Categories: AI coding tools (5 full native plugin guides) & Data sources (16 pages)

export const INTEGRATION_CATEGORIES = [
  {
    id: 'ai-coding-tools',
    label: 'AI coding tools',
    section: 'connect',
    helperText: 'To compare setup across tools, see',
    helperLink: { label: 'AI coding tools', slug: 'ai-coding-tools' },
  },
  { id: 'data-sources', label: 'Data sources', section: 'connect' },
  { id: 'frameworks', label: 'Frameworks', section: 'connect' },
  { id: 'infrastructure', label: 'Infrastructure', section: 'connect' },
  { id: 'models', label: 'Models', section: 'connect' },
  { id: 'observability', label: 'Observability', section: 'connect' },
  { id: 'build-an-integration', label: 'Build an integration', section: 'build' },
]

export const SHARED_SKILLS_2COL_ROWS = [
  ['`iceberg-quickstart`', 'Step-by-step onboarding that creates a collection, indexes sample data, and runs hybrid search.'],
  ['`iceberg-query`', 'Search collections using natural-language hybrid BM25 + HNSW RRF queries via the Iceberg MCP server.'],
  ['`iceberg-assistant`', 'Create, manage, and chat with Iceberg Assistants for grounded document Q&A with citations.'],
  ['`iceberg-cli`', 'Use the Iceberg CLI (`iceberg`) for terminal-based index, vector, and memory management.'],
  ['`iceberg-hybrid-search`', 'Create, ingest into, and query an Iceberg hybrid dense + Okapi BM25 full-text search index.'],
  ['`iceberg-n8n`', 'Build [n8n](/integrations/n8n) workflows with `n8n-nodes-iceberg` for Vector Store, Memory, and Assistants.'],
  ['`iceberg-mcp`', 'Reference for all 16 available Iceberg MCP server tools and their JSON parameters.'],
  ['`iceberg-docs`', 'Curated links to official Iceberg documentation, all 6 SDKs, and REST API specs organized by topic.'],
  ['`iceberg-help`', 'Overview of all skills and what you need to get started.'],
]

export const SHARED_MCP_TOOL_BULLETS = [
  '`iceberg_list_collections` -- List all collections in the active project',
  '`iceberg_create_collection` -- Create a new vector collection (`384d` default or custom dimension & metric)',
  '`iceberg_collection_info` -- Inspect vector count, dimension, metric, quantization, and namespace counts',
  '`iceberg_delete_collection` -- Delete a collection and release vector quota',
  '`iceberg_index_text` -- Chunk and embed plain text on server CPU (`all-MiniLM-L6-v2`, Rs.0 cost)',
  '`iceberg_search` -- Run `hybrid` (Dense + BM25 RRF), `semantic`, or `keyword` search with filters',
  '`iceberg_upsert_vectors` -- Batch upsert custom-dimension float vectors (`768d`, `1024d`, `1536d`, `3072d`) with namespaces',
  '`iceberg_query_vectors` -- Query custom-dimension vectors with `$eq/$gt/$gte/$in` metadata filters',
  '`iceberg_delete_vectors` -- Delete vectors by IDs, metadata filter, or `delete_all` inside a namespace',
  '`iceberg_remember` -- Persist agent memory across `short_term`, `episodic`, `long_term`, or `semantic` tiers',
  '`iceberg_recall` -- Recall time-decayed cognitive memories for a specific `agent_id`',
  '`iceberg_create_assistant` -- Create a managed RAG Assistant with `widget.js` and WhatsApp webhook',
  '`iceberg_list_assistants` -- List configured RAG Assistants in your workspace',
  '`iceberg_upload_assistant_doc` -- Train an Assistant from Markdown, plain text, or `.pdf`/`.txt` files',
  '`iceberg_chat_assistant` -- Ask grounded questions against an Iceberg Assistant',
  '`iceberg_delete_assistant` -- Delete an Assistant and its isolated collection',
]

export const AI_AND_DATA_SOURCES = [
  // =========================================================================
  // 1. AI CODING TOOLS (5 PAGES)
  // =========================================================================
  {
    slug: 'ai-coding-tools',
    name: 'Overview',
    pageTitle: 'AI coding tools',
    hideFromOverviewGrid: true,
    category: 'ai-coding-tools',
    shortDesc: 'Compare MCP server setup, plugins, and agent skills across Claude Code, Codex, and Cursor.',
    summary: 'Use Iceberg with AI coding tools like Claude Code, Codex, and Cursor through the Iceberg MCP server, plugins, and agent skills.',
    intro: [
      'Iceberg provides official plugins and agent skills for AI coding tools. Use the Iceberg [MCP server](https://www.npmjs.com/package/iceberg-mcp) (Model Context Protocol) and built-in skills to manage indexes, run semantic and hybrid search, and build RAG applications, all through natural language in your development environment. For direct, scriptable access from the same terminal, the [Iceberg CLI](/product/sdk) (`iceberg`) lets you manage indexes, namespaces, and records without an agent in the loop.',
    ],
    cta: null,
    sections: [
      {
        id: 'choose-your-tool',
        title: 'Choose your tool',
        blocks: [
          {
            type: 'toolCards',
            items: [
              {
                icon: 'plug',
                title: 'Claude Code plugin',
                desc: 'Connect Claude Code CLI and desktop workflows to 16 live Iceberg MCP tools and skills.',
                to: '/integrations/claude-code',
              },
              {
                icon: 'plug',
                title: 'Codex plugin',
                desc: 'Configure OpenAI Codex CLI and Desktop across macOS, Linux, and Windows.',
                to: '/integrations/codex',
              },
              {
                icon: 'plug',
                title: 'Cursor plugin',
                desc: 'Enable project or global Iceberg MCP tools and rules inside Cursor Agent mode.',
                to: '/integrations/cursor',
              },
              {
                icon: 'layers',
                title: 'Agent Skills',
                desc: 'Universal SKILL.md library for GitHub Copilot, Windsurf, Cline, and other agentic IDEs.',
                to: '/integrations/agent-skills',
              },
              {
                icon: 'server',
                title: 'MCP server',
                desc: 'Official `iceberg-mcp` npm package exposing collections, hybrid search, memory, and assistants.',
                href: 'https://www.npmjs.com/package/iceberg-mcp',
              },
              {
                icon: 'terminal',
                title: 'Iceberg CLI',
                desc: 'Run `iceberg index`, `iceberg query`, and `iceberg memory` directly from your terminal (`v1.0.0`).',
                to: '/product/sdk',
              },
            ],
          },
        ],
      },
      {
        id: 'tool-recommendations',
        title: 'Tool recommendations',
        blocks: [
          {
            type: 'table',
            headers: ['Your tool', 'What to install', 'Command / Config'],
            rows: [
              ['Claude Code', '[Claude Code plugin](/integrations/claude-code)', '`claude mcp add icebergdb -- npx -y iceberg-mcp`'],
              ['Codex', '[Codex plugin](/integrations/codex)', '`~/.codex/config.toml` (`npx -y iceberg-mcp`)'],
              ['Cursor', '[Cursor plugin](/integrations/cursor)', '`.cursor/mcp.json` (`npx -y iceberg-mcp`)'],
              ['GitHub Copilot or another agentic IDE', '[Agent Skills](/integrations/agent-skills)', '`.agents/skills/icebergdb/SKILL.md`'],
              ['Claude Desktop, Windsurf, or another MCP client', '[Iceberg MCP server](https://www.npmjs.com/package/iceberg-mcp)', '`npx -y iceberg-mcp`'],
              ['Your terminal or application code (no agent)', '[Iceberg SDKs & CLI](/product/sdk)', '`pip install icebergdb` / `npm i icebergdb` / `cargo add icebergdb` / `dotnet add package IcebergDb` / Go / Java'],
            ],
          },
          {
            type: 'p',
            text: 'All tools require an [Iceberg API key](https://dashboard.icebergdb.in/signup). Sign up for a free account (100,000 vectors included) at [dashboard.icebergdb.in](https://dashboard.icebergdb.in).',
          },
        ],
      },
      {
        id: 'whats-included',
        title: "What's included",
        blocks: [
          {
            type: 'p',
            text: 'Agent skills give coding assistants exact `v1.0.0` patterns for `/iceberg:quickstart`, `iceberg-query`, all 6 official SDKs, multi-dimension collections, and 4-tier cognitive memory:',
          },
          {
            type: 'table',
            headers: ['Skill', 'Description'],
            rows: [
              ['Quickstart', 'Step-by-step onboarding that walks you through creating a collection, indexing text, and running your first hybrid search.'],
              ['Query', 'Search collections using natural-language hybrid BM25 + dense vector RRF via the Iceberg MCP server.'],
              ['Memory', 'Persist and recall 4-tier agent memory (`short_term`, `episodic`, `long_term`, `semantic`) with Ebbinghaus decay.'],
              ['Assistant', 'Create, manage, and chat with Iceberg Assistants for document Q&A with grounded citations.'],
              ['Multi-dim vectors', 'Create `768d`, `1024d`, `1536d`, or `3072d` collections for OpenAI, Cohere, Voyage AI, and Bedrock embeddings.'],
              ['Hybrid search', 'Configure Okapi BM25 lexical scoring + HNSW dense vectors with `alpha` blending and metadata filters.'],
              ['n8n', 'Build [n8n](/integrations/n8n) workflows with `n8n-nodes-iceberg`, including Vector Store, Memory, and Assistant operations.'],
              ['MCP', 'Reference for all 16 available Iceberg MCP server tools and their input schemas.'],
              ['Docs', 'Curated links to official Iceberg documentation, all 6 SDK references (`Python`, `Node.js`, `Java`, `Go`, `Rust`, `.NET`), and DPDP security guides.'],
            ],
          },
          {
            type: 'p',
            text: 'For live database operations from your IDE, pair these skills with the [Iceberg MCP server](https://www.npmjs.com/package/iceberg-mcp).',
          },
        ],
      },
    ],
  },

  {
    slug: 'agent-skills',
    name: 'Agent Skills',
    category: 'ai-coding-tools',
    shortDesc: 'Universal Iceberg skills library for GitHub Copilot and other agentic IDEs.',
    summary: 'Install universal Iceberg Agent Skills (`SKILL.md`) to give GitHub Copilot, Windsurf, Cline, and other agentic IDEs verified workflows for vector search, RAG, and 4-tier memory.',
    intro: [
      '[Agent Skills](https://github.com/anku5265/iceberg-database/blob/main/iceberg-mcp/SKILL.md) are portable markdown instruction files automatically discovered by [GitHub Copilot](https://docs.github.com/en/copilot), Windsurf, Cline, Roo Code, and custom coding agents.',
      'They eliminate hallucinated package names or outdated endpoints by teaching your coding agent canonical `icebergdb` (`v1.0.0`) patterns across Python, TypeScript, Rust, Go, Java, .NET, and REST.',
    ],
    cta: { label: 'View on GitHub', href: 'https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp' },
    sections: [
      {
        id: 'tip-dedicated-plugins',
        noToc: true,
        blocks: [
          {
            type: 'callout',
            variant: 'tip',
            text: 'These tools have a dedicated Iceberg setup guide with direct MCP configuration. Follow their dedicated guides for full live tool access:',
            bullets: [
              '[Claude Code](/integrations/claude-code)',
              '[Codex](/integrations/codex)',
              '[Cursor](/integrations/cursor)',
            ],
          },
        ],
      },
      {
        id: 'features',
        title: 'Features',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Zero-hallucination `v1.0.0` SDK templates for Python (`pip install icebergdb`), TypeScript (`npm install icebergdb`), Rust, Go, Java, and .NET.',
              'Ready-to-run patterns for both free server-side `384d` ONNX CPU embeddings and external multi-dimension embeddings (`1024d`, `1536d`, `3072d`).',
              'Built-in recipes for 4-tier cognitive agent memory (`remember` & `recall`), RAG Assistants, and `n8n` automation workflows.',
            ],
          },
        ],
      },
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        blocks: [
          {
            type: 'bullets',
            items: [
              'An [Iceberg API key](https://dashboard.icebergdb.in/signup) (`ib_...`)',
              '`Node.js` v18+ (required to run `npx -y iceberg-mcp`)',
              '[Iceberg MCP server](https://www.npmjs.com/package/iceberg-mcp) (recommended for live `iceberg_search` and `iceberg_remember` calls)',
              'Python, Node.js/TypeScript, Java, Go, Rust, or .NET runtime for running generated SDK code',
            ],
          },
        ],
      },
      {
        id: 'installation',
        title: 'Installation',
        blocks: [
          { type: 'p', text: 'Add the Iceberg skill file to your workspace in three steps:' },
          {
            type: 'steps',
            items: [
              {
                id: 'as-set-key',
                title: 'Set your API key',
                blocks: [
                  {
                    type: 'code',
                    noHeader: true,
                    code: `export ICEBERG_API_KEY="ib_your_api_key"`,
                  },
                  {
                    type: 'p',
                    text: 'Replace `ib_your_api_key` with your [Iceberg API key](https://dashboard.icebergdb.in). Add this line to `~/.zshrc` or `~/.bashrc` to persist across terminal sessions.',
                  },
                ],
              },
              {
                id: 'as-install-skills',
                title: 'Install the skills file',
                blocks: [
                  {
                    type: 'code',
                    noHeader: true,
                    code: `mkdir -p .agents/skills/icebergdb && curl -fsSL https://raw.githubusercontent.com/anku5265/iceberg-database/main/iceberg-mcp/SKILL.md -o .agents/skills/icebergdb/SKILL.md`,
                  },
                  {
                    type: 'p',
                    text: 'Commit `.agents/skills/icebergdb/SKILL.md` to your repository so every team member and coding agent automatically inherits the skill.',
                  },
                ],
              },
              {
                id: 'as-configure-mcp',
                title: 'Configure the MCP server (optional)',
                blocks: [
                  {
                    type: 'p',
                    text: 'To let your IDE agent execute live collection, search, and memory operations alongside `iceberg-query`, register `npx -y iceberg-mcp` in your IDE MCP settings.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'available-skills',
        title: 'Available skills',
        blocks: [
          {
            type: 'table',
            headers: ['Skill', 'Description'],
            rows: SHARED_SKILLS_2COL_ROWS,
          },
        ],
      },
      {
        id: 'mcp-tools',
        title: 'MCP tools',
        blocks: [
          {
            type: 'p',
            text: 'When paired with `iceberg-mcp`, your coding agent gains direct tool access to create collections, index text, run hybrid searches, and manage 4-tier agent memory.',
          },
          {
            type: 'p',
            text: 'For the full list of MCP tools, see the [Claude Code plugin](/integrations/claude-code#mcp-tools) reference or [iceberg-mcp on npm](https://www.npmjs.com/package/iceberg-mcp).',
          },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[GitHub repository](https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp)',
              '[Iceberg MCP server package (npm)](https://www.npmjs.com/package/iceberg-mcp)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'claude-code',
    name: 'Claude Code plugin',
    category: 'ai-coding-tools',
    shortDesc: 'Official Iceberg plugin for Claude Code with skills, MCP tools, and slash commands.',
    summary: 'Connect Anthropic Claude Code to Iceberg Database, 4-Tier Memory, and RAG Assistants with live MCP tools and structured workflow skills.',
    intro: [
      'Registering `iceberg-mcp` and `SKILL.md` in Claude Code lets Claude create collections, test hybrid RRF queries, inspect vector counts, and persist architectural decisions into 4-tier memory directly from your terminal.',
    ],
    cta: { label: 'View on GitHub', href: 'https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp' },
    sections: [
      {
        id: 'features',
        title: 'Features',
        blocks: [
          {
            type: 'bullets',
            items: [
              '16 live Model Context Protocol (MCP) tools connected directly to `https://api.icebergdb.in` or your self-hosted BYOC endpoint.',
              'Guided `/iceberg:quickstart` and `/iceberg:query` workflows for building RAG pipelines across Python, TypeScript/Node.js, Java, Go, Rust, and .NET.',
              'Persistent 4-tier engineering memory (`iceberg_remember` / `iceberg_recall`) so Claude remembers repo architecture across sessions.',
              'Shared team `.mcp.json` support with `${ICEBERG_API_KEY}` environment interpolation.',
            ],
          },
        ],
      },
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        blocks: [
          {
            type: 'bullets',
            items: [
              'An [Iceberg API key](https://dashboard.icebergdb.in/signup) (`ib_...`)',
              '[Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed in your terminal',
              '`Node.js` v18+ (`npx` on `PATH`)',
              'Python 3.9+ (`uv` or `pip`) when generating Python RAG apps',
            ],
          },
        ],
      },
      {
        id: 'installation',
        title: 'Installation',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'cc-step-1',
                title: 'Set your API key',
                blocks: [
                  {
                    type: 'code',
                    noHeader: true,
                    code: `export ICEBERG_API_KEY="ib_your_api_key"`,
                  },
                ],
              },
              {
                id: 'cc-step-2',
                title: 'Install the MCP server in Claude Code',
                blocks: [
                  { type: 'p', text: 'From your macOS or Linux terminal:' },
                  {
                    type: 'code',
                    noHeader: true,
                    code: `claude mcp add icebergdb -e ICEBERG_API_KEY="ib_your_api_key" -- npx -y iceberg-mcp`,
                  },
                  { type: 'p', text: 'Or on Windows PowerShell:' },
                  {
                    type: 'code',
                    noHeader: true,
                    code: `claude mcp add icebergdb -e ICEBERG_API_KEY="ib_your_api_key" -- cmd /c npx -y iceberg-mcp`,
                  },
                ],
              },
              {
                id: 'cc-step-3',
                title: 'Restart Claude Code and verify',
                blocks: [
                  {
                    type: 'p',
                    text: 'Launch `claude` and run `/mcp` to verify `icebergdb` shows `connected` with all 16 tools ready.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'available-skills',
        title: 'Available skills',
        blocks: [
          {
            type: 'table',
            headers: ['Skill', 'Workflow Prompt / Command', 'Description'],
            rows: [
              ['Help', '`/iceberg:help`', 'Overview of available Iceberg MCP tools, SDKs, and authentication checks.'],
              ['Quickstart', '`/iceberg:quickstart`', 'Create a collection, index sample documents, and run a hybrid RRF search.'],
              ['Query', '`/iceberg:query`', 'Run hybrid, semantic, or BM25 keyword queries with metadata filters.'],
              ['Memory', '`/iceberg:memory`', 'Store and recall 4-tier cognitive agent memories (`short_term` to `long_term`).'],
              ['Assistant', '`/iceberg:assistant`', 'Query or integrate a managed Iceberg RAG Assistant.'],
              ['Vectors', '`/iceberg:vectors`', 'Create multi-dimension (`1024d`, `1536d`, `3072d`) collections and batch-upsert vectors.'],
              ['n8n', '`/iceberg:n8n`', 'Generate `n8n-nodes-iceberg` workflow JSON for automated RAG pipelines.'],
              ['MCP', '`/iceberg:mcp`', 'Inspect live collection info and verify MCP server connectivity.'],
              ['Docs', '`/iceberg:docs`', 'Reference canonical `v1.0.0` endpoints, RBAC roles, and SDK methods.'],
            ],
          },
        ],
      },
      {
        id: 'mcp-tools',
        title: 'MCP tools',
        blocks: [
          { type: 'p', text: 'The `iceberg-mcp` server registers 16 live tools inside Claude Code:' },
          { type: 'bullets', items: SHARED_MCP_TOOL_BULLETS },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[GitHub repository](https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp)',
              '[iceberg-mcp on npm](https://www.npmjs.com/package/iceberg-mcp)',
              '[Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'codex',
    name: 'Codex plugin',
    category: 'ai-coding-tools',
    shortDesc: 'Official Iceberg plugin for Codex with skills and MCP tools.',
    summary: 'Connect OpenAI Codex CLI and Desktop app to Iceberg Database and 4-Tier Memory across macOS, Linux, and Windows.',
    intro: [
      'OpenAI Codex loads MCP tools from `~/.codex/config.toml` and reads `ICEBERG_API_KEY` from the environment it launches in, giving Codex live access to collections, hybrid search, and persistent memory.',
    ],
    cta: { label: 'View on GitHub', href: 'https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp' },
    sections: [
      {
        id: 'features',
        title: 'Features',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Live stdio MCP access to all 16 Iceberg Database, 4-Tier Memory, and Assistant tools.',
              'Works identically in both OpenAI Codex CLI and the ChatGPT / Codex Desktop app on macOS, Linux, and Windows.',
              'Supports workspace `SKILL.md` discovery for zero-hallucination RAG code generation across Python, TypeScript, Java, Go, Rust, and .NET.',
            ],
          },
        ],
      },
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        blocks: [
          {
            type: 'bullets',
            items: [
              'An [Iceberg API key](https://dashboard.icebergdb.in/signup) (`ib_...`)',
              'OpenAI Codex CLI (`npm i -g @openai/codex`) or the ChatGPT Desktop app',
              'A local Codex session (cloud-only sandboxes without outbound internet cannot reach external MCP APIs)',
              '`Node.js` v18+ (`npx` available on system `PATH`)',
            ],
          },
        ],
      },
      {
        id: 'installation',
        title: 'Installation',
        blocks: [
          { type: 'p', text: 'Register `iceberg-mcp` in Codex and configure your API key for your operating system:' },
          {
            type: 'steps',
            items: [
              {
                id: 'codex-step-1',
                title: 'Add Iceberg MCP to Codex',
                blocks: [
                  {
                    type: 'tabs',
                    tabs: [
                      {
                        label: 'Command line (~/.codex/config.toml)',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Add `[mcp_servers.icebergdb]` to `~/.codex/config.toml` (use `cmd /c npx` on native Windows):',
                          },
                          {
                            type: 'code',
                            lang: 'toml',
                            label: 'TOML',
                            code: `[mcp_servers.icebergdb]
command = "npx"
args = ["-y", "iceberg-mcp"]
env = { ICEBERG_API_URL = "https://api.icebergdb.in" }`,
                          },
                        ],
                      },
                      {
                        label: 'Workspace skill',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Optionally install `SKILL.md` into your repository so Codex automatically loads Iceberg `v1.0.0` conventions:',
                          },
                          {
                            type: 'code',
                            noHeader: true,
                            code: `mkdir -p .agents/skills/icebergdb && curl -fsSL https://raw.githubusercontent.com/anku5265/iceberg-database/main/iceberg-mcp/SKILL.md -o .agents/skills/icebergdb/SKILL.md`,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'codex-step-2',
                title: 'Set your API key and launch Codex',
                blocks: [
                  {
                    type: 'p',
                    text: "Installing the MCP entry doesn't hardcode your secret key. Codex reads `ICEBERG_API_KEY` from the environment it launches in.",
                  },
                  {
                    type: 'tabs',
                    tabs: [
                      {
                        label: 'CLI (macOS, Linux)',
                        blocks: [
                          { type: 'p', text: '1. Set the key in the same shell where you run Codex:' },
                          { type: 'code', noHeader: true, code: `export ICEBERG_API_KEY="YOUR_API_KEY"` },
                          {
                            type: 'p',
                            text: 'Replace `YOUR_API_KEY` with your [Iceberg API key](https://dashboard.icebergdb.in). To keep it across terminal sessions, add the line to your shell profile, such as `~/.zshrc`.',
                          },
                          { type: 'p', text: '2. Start Codex:' },
                          { type: 'code', noHeader: true, code: `codex` },
                        ],
                      },
                      {
                        label: 'CLI (Windows)',
                        blocks: [
                          { type: 'p', text: 'If you run Codex in WSL, use the **CLI (macOS, Linux)** tab instead.' },
                          { type: 'p', text: '1. Set the key in the same PowerShell session where you run Codex:' },
                          { type: 'code', noHeader: true, code: `$env:ICEBERG_API_KEY="YOUR_API_KEY"` },
                          {
                            type: 'p',
                            text: 'Replace `YOUR_API_KEY` with your [Iceberg API key](https://dashboard.icebergdb.in). This lasts for the current session only. To keep it across sessions, run `setx ICEBERG_API_KEY "YOUR_API_KEY"` and open a new terminal.',
                          },
                          { type: 'p', text: '2. Start Codex:' },
                          { type: 'code', noHeader: true, code: `codex` },
                        ],
                      },
                      {
                        label: 'Desktop app (macOS)',
                        blocks: [
                          { type: 'p', text: '1. Expose `ICEBERG_API_KEY` to macOS GUI applications from Terminal:' },
                          { type: 'code', noHeader: true, code: `launchctl setenv ICEBERG_API_KEY "YOUR_API_KEY"` },
                          { type: 'p', text: '2. Quit the Desktop app completely, then reopen it.' },
                        ],
                      },
                      {
                        label: 'Desktop app (Windows)',
                        blocks: [
                          { type: 'p', text: '1. Persist `ICEBERG_API_KEY` in your Windows user environment:' },
                          { type: 'code', noHeader: true, code: `setx ICEBERG_API_KEY "YOUR_API_KEY"` },
                          {
                            type: 'p',
                            text: 'Replace `YOUR_API_KEY` with your [Iceberg API key](https://dashboard.icebergdb.in). `setx` persists across restarts.',
                          },
                          { type: 'p', text: '2. Quit the Desktop app completely, then reopen it.' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'codex-step-3',
                title: 'Run the quickstart',
                blocks: [
                  { type: 'p', text: 'In a new Codex session, ask:' },
                  {
                    type: 'code',
                    noHeader: true,
                    code: `Use Iceberg MCP to create a collection named "quickstart_kb", index sample product notes, and run a hybrid search.`,
                  },
                  {
                    type: 'p',
                    text: 'Codex invokes `iceberg_create_collection`, `iceberg_index_text`, and `iceberg_search`, returning live ranked results in milliseconds.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'available-skills',
        title: 'Available skills',
        blocks: [
          {
            type: 'p',
            text: 'Codex picks the right workflow automatically from `.agents/skills/icebergdb/SKILL.md` based on what you ask:',
          },
          {
            type: 'table',
            headers: ['Skill', 'Description'],
            rows: SHARED_SKILLS_2COL_ROWS,
          },
        ],
      },
      {
        id: 'mcp-tools',
        title: 'MCP tools',
        blocks: [
          { type: 'bullets', items: SHARED_MCP_TOOL_BULLETS },
        ],
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        blocks: [
          {
            type: 'accordion',
            items: [
              {
                q: 'API key not found or 401 errors',
                a: 'Verify `ICEBERG_API_KEY` is exported in the exact shell or OS session that launched Codex and begins with `ib_`. If you used `setx` on Windows or `launchctl setenv` on macOS, fully quit and relaunch the app.',
              },
              {
                q: 'MCP server not responding on Windows',
                a: 'Native Windows stdio requires invoking `cmd` with `args = ["/c", "npx", "-y", "iceberg-mcp"]` inside `~/.codex/config.toml` so `npx.cmd` resolves cleanly.',
              },
              {
                q: 'Hybrid search returns empty results',
                a: 'Confirm you indexed documents into the same `collection` and `namespace` being queried, and verify `iceberg_collection_info` shows `vector_count > 0`.',
              },
              {
                q: 'Dimension mismatch when upserting custom vectors',
                a: 'Default collections use `384` dimensions (`all-MiniLM-L6-v2`). Create a dedicated collection with `dimension=1536` or `dimension=1024` before upserting OpenAI or Cohere vectors.',
              },
            ],
          },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[GitHub repository](https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp)',
              '[iceberg-mcp on npm](https://www.npmjs.com/package/iceberg-mcp)',
              '[Iceberg API Documentation](/docs)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'cursor',
    name: 'Cursor plugin',
    category: 'ai-coding-tools',
    shortDesc: 'Official Iceberg plugin for Cursor with skills, MCP tools, and slash commands.',
    summary: 'Add Iceberg MCP tools and workspace rules to Cursor so Composer and Agent mode can query collections and recall 4-tier project memory live.',
    intro: [
      'Cursor supports both repository-scoped (`.cursor/mcp.json`) and global (`~/.cursor/mcp.json`) Model Context Protocol servers alongside `.cursor/rules` instruction files.',
    ],
    cta: { label: 'View on GitHub', href: 'https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp' },
    sections: [
      {
        id: 'features',
        title: 'Features',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Direct Cursor Agent access to `iceberg-mcp` (`v1.0.0`) across all 10 database, hybrid search, memory, and assistant tools.',
              'Zero-config server-side `384d` text indexing and hybrid search right from Cursor Composer.',
              'Persistent 4-tier cognitive memory so Cursor remembers architectural conventions across chats.',
              'Clean `.cursor/mcp.json` configuration for macOS, Linux, and Windows.',
            ],
          },
        ],
      },
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        blocks: [
          {
            type: 'bullets',
            items: [
              'An [Iceberg API key](https://dashboard.icebergdb.in/signup) (`ib_...`)',
              '[Cursor IDE](https://cursor.com) installed',
              '`Node.js` v18+ (`npx` available on `PATH`)',
            ],
          },
        ],
      },
      {
        id: 'installation',
        title: 'Installation',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'cur-step-1',
                title: 'Create .cursor/mcp.json',
                blocks: [
                  {
                    type: 'p',
                    text: 'Create `.cursor/mcp.json` in your project root (or `~/.cursor/mcp.json` for all workspaces). On Windows, replace `"command": "npx"` with `"command": "cmd"` and prepend `"/c", "npx"` to `args`:',
                  },
                  {
                    type: 'code',
                    lang: 'json',
                    label: 'JSON',
                    code: `{
  "mcpServers": {
    "icebergdb": {
      "command": "npx",
      "args": ["-y", "iceberg-mcp"],
      "env": {
        "ICEBERG_API_URL": "https://api.icebergdb.in",
        "ICEBERG_API_KEY": "ib_your_api_key"
      }
    }
  }
}`,
                  },
                ],
              },
              {
                id: 'cur-step-2',
                title: 'Add Iceberg rules for Cursor Agent (optional)',
                blocks: [
                  {
                    type: 'code',
                    noHeader: true,
                    code: `mkdir -p .cursor/rules && curl -fsSL https://raw.githubusercontent.com/anku5265/iceberg-database/main/iceberg-mcp/SKILL.md -o .cursor/rules/icebergdb.mdc`,
                  },
                ],
              },
              {
                id: 'cur-step-3',
                title: 'Verify the installation',
                blocks: [
                  { type: 'p', text: 'Confirm both MCP tools and rules are active inside Cursor:' },
                  {
                    type: 'bullets',
                    items: [
                      'Open **Cursor Settings > Tools & MCP** and verify `icebergdb` displays a green active dot with 16 tools.',
                      'Open **Cursor Settings > Rules** and verify `icebergdb.mdc` is loaded for Agent mode.',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'available-skills',
        title: 'Available skills',
        blocks: [
          {
            type: 'table',
            headers: ['Skill', 'Agent Trigger', 'Description'],
            rows: [
              ['Help', '`@iceberg-help`', 'List available Iceberg MCP tools and check project connectivity.'],
              ['Quickstart', '`@iceberg-quickstart`', 'Scaffold a collection, index sample documents, and test hybrid search.'],
              ['Query', '`@iceberg-query`', 'Query live collections with hybrid RRF (`alpha=0.5`) and metadata filters.'],
              ['CLI', '`@iceberg-cli`', 'Use the `iceberg` CLI for terminal-based index, vector, and memory management.'],
              ['Memory', '`@iceberg-memory`', 'Add 4-tier persistent agent memory (`remember` / `recall`) to your app.'],
              ['Assistant', '`@iceberg-assistant`', 'Embed or query an Iceberg RAG Assistant (`widget.js` or REST).'],
              ['Vectors', '`@iceberg-vectors`', 'Configure custom `1024d` / `1536d` / `3072d` vector collections.'],
              ['n8n', '`@iceberg-n8n`', 'Generate `n8n-nodes-iceberg` workflow configurations.'],
              ['Docs', '`@iceberg-docs`', 'Look up canonical `v1.0.0` SDK syntax across all 6 languages (`Python`, `Node.js`, `Java`, `Go`, `Rust`, `.NET`).'],
            ],
          },
        ],
      },
      {
        id: 'mcp-tools',
        title: 'MCP tools',
        blocks: [
          { type: 'bullets', items: SHARED_MCP_TOOL_BULLETS },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[GitHub repository](https://github.com/anku5265/iceberg-database/tree/main/iceberg-mcp)',
              '[iceberg-mcp on npm](https://www.npmjs.com/package/iceberg-mcp)',
              '[Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol)',
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. DATA SOURCES (16 PAGES -- EXACT ARCHETYPE MATCH)
  // =========================================================================
  {
    slug: 'airbyte',
    name: 'Airbyte',
    category: 'data-sources',
    shortDesc: 'Integrate, transform, and load data into Iceberg from hundreds of systems, including databases, data warehouses, and SaaS products.',
    summary: 'Sync records from 350+ databases, data warehouses, and SaaS applications into Iceberg collections using PyAirbyte or Airbyte HTTP destinations.',
    intro: [
      '[Airbyte](https://airbyte.com) is an open-source data movement platform that extracts structured and unstructured records from PostgreSQL, Snowflake, Notion, Zendesk, Google Drive, and hundreds of SaaS connectors.',
      'Connecting Airbyte to Iceberg (`https://api.icebergdb.in`) lets you incrementally chunk, embed (using free `384d` server-side CPU embeddings or external models), and upsert enterprise data into isolated tenant namespaces for RAG and semantic search.',
    ],
    cta: {
      label: 'Get started',
      href: 'https://dashboard.icebergdb.in/signup',
      secondaryLabel: 'View API docs',
      secondaryTo: '/docs',
    },
    sections: [
      {
        id: 'resources',
        title: 'Resources',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[PyAirbyte + Iceberg Python SDK Reference](/docs)',
              '[Iceberg Batch Vector Upsert Endpoint (`POST /vectors/upsert`)](https://api.icebergdb.in/docs)',
              '[Multi-Tenant Namespace Isolation Guide](/product/namespaces)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'apify',
    name: 'Apify',
    category: 'data-sources',
    shortDesc: 'Integrate results from web scrapers or crawlers into Iceberg to support RAG or semantic search over web content.',
    summary: 'Crawl websites, documentation portals, and e-commerce catalogs with Apify Actors and load clean Markdown directly into Iceberg for RAG.',
    intro: [
      '[Apify](https://apify.com) is a full-stack web scraping and browser automation platform featuring over 2,000 ready-made cloud Actors.',
      'Using Apify [Website Content Crawler](https://apify.com/apify/website-content-crawler), you can strip navigation clutter, render JavaScript-heavy SPAs, extract clean Markdown, and push crawled pages straight into Iceberg (`POST /documents/text` or `POST /vectors/upsert`).',
      'Combine scheduled Apify runs with deterministic Iceberg point IDs (`PUT /documents/{collection}/points/{id}`) so your AI assistant stays continuously synchronized with live web pages without duplicate chunks.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'aryn',
    name: 'Aryn',
    category: 'data-sources',
    shortDesc: 'Process complex, unstructured documents with an ETL system built for RAG and generative AI applications.',
    summary: 'Parse complex PDFs, multi-column financial tables, and scanned documents with Aryn DocParse and index structured chunks into Iceberg.',
    intro: [
      '[Aryn](https://www.aryn.ai) provides AI-native document partitioning (`DocParse`) powered by vision-language segmentation models purpose-built for complex enterprise PDFs, engineering schematics, and regulatory filings.',
      'Instead of splitting tables mid-row, Aryn extracts layout-aware JSON elements with bounding-box metadata and table summaries that map cleanly into Iceberg hybrid BM25 + HNSW collections.',
      'Pairing Aryn document ETL with Iceberg hybrid RRF search delivers high precision on both conceptual queries and exact financial figures or invoice identifiers.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'box',
    name: 'Box',
    category: 'data-sources',
    shortDesc: 'Connect a Box account to Iceberg Database.',
    summary: 'Synchronize enterprise folders, contracts, and SOP documents from Box Content Cloud into tenant-isolated Iceberg collections.',
    intro: [
      '[Box](https://www.box.com) provides secure cloud content management and collaboration for enterprise documents, legal agreements, and internal knowledge bases.',
      'Using Box webhooks and `box-sdk-gen`, you can stream text representations of newly uploaded or updated files directly into Iceberg namespaces (`POST /documents/text` or `PUT /documents/{collection}/points/{id}`) while preserving folder metadata for access-controlled RAG.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'confluent',
    name: 'Confluent',
    category: 'data-sources',
    shortDesc: 'Stream content from Confluent Cloud into an Iceberg collection with the HTTP Sink Connector for Kafka Connect.',
    summary: 'Stream real-time Apache Kafka event topics from Confluent Cloud directly into Iceberg vector collections via Kafka Connect HTTP Sink.',
    intro: [
      '[Confluent Cloud](https://www.confluent.io) is a fully managed data streaming platform built on Apache Kafka for real-time event pipelines.',
      'By configuring the Confluent HTTP Sink Connector against `https://api.icebergdb.in/vectors/upsert` with your `X-API-Key` header, every new order, support ticket, or telemetry event becomes searchable in Iceberg within milliseconds.',
    ],
    cta: {
      label: 'Get started',
      href: 'https://dashboard.icebergdb.in/signup',
      secondaryLabel: 'View REST spec',
      secondaryHref: 'https://api.icebergdb.in/docs',
    },
    sections: [],
  },

  {
    slug: 'databricks',
    name: 'Databricks',
    category: 'data-sources',
    shortDesc: 'Combine the Databricks analytics platform with Iceberg for large-scale data processing.',
    summary: 'Embed partitioned Delta Lake tables across Apache Spark executors on Databricks and batch-upsert millions of vectors into Iceberg.',
    intro: [
      '[Databricks](https://www.databricks.com) unifies data engineering, Unity Catalog governance, and distributed Apache Spark compute on a Lakehouse architecture.',
      'Using PySpark `mapPartitions` / `mapInPandas` workers alongside the official `icebergdb` Python SDK, you can generate embeddings across GPU/CPU cluster nodes and stream batches directly into Iceberg multi-dimension HNSW collections.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'p',
            text: 'This guide walks through loading a dataset into Spark partitions, generating `384`-dimensional embeddings with `sentence-transformers/all-MiniLM-L6-v2` from [Hugging Face](https://huggingface.co), and batch-indexing into Iceberg.',
          },
          {
            type: 'h3',
            id: 'dbx-before-you-begin',
            title: 'Before you begin',
          },
          { type: 'p', text: 'Ensure you have the following:' },
          {
            type: 'bullets',
            items: [
              'A running [Databricks cluster](https://docs.databricks.com/en/compute/index.html) (Databricks Runtime ML recommended)',
              'An [Iceberg account](https://dashboard.icebergdb.in/signup) (`ap-south-1` Cloud or private VPC BYOC)',
              'An [Iceberg API key](https://dashboard.icebergdb.in) stored in Databricks Secrets (`dbutils.secrets`)',
            ],
          },
          {
            type: 'steps',
            items: [
              {
                id: 'dbx-step-1',
                title: 'Install dependencies on your Databricks cluster',
                blocks: [
                  {
                    type: 'tabs',
                    tabs: [
                      {
                        label: 'Databricks Notebook (%pip)',
                        blocks: [
                          {
                            type: 'p',
                            text: '1. Attach a notebook to your cluster and install `icebergdb`, `datasets`, and `sentence-transformers` across all worker nodes:',
                          },
                          {
                            type: 'code',
                            lang: 'bash',
                            label: 'Shell',
                            code: `%pip install -qU icebergdb datasets sentence-transformers torch
dbutils.library.restartPython()`,
                          },
                          {
                            type: 'callout',
                            variant: 'info',
                            text: 'Using `icebergdb` (`v1.0.0`) inside PySpark requires zero custom JVM uberjars -- persistent HTTP/1.1 keep-alive pools work identically on Unity Catalog Shared and Single-User clusters.',
                          },
                        ],
                      },
                      {
                        label: 'Databricks Cluster Libraries UI',
                        blocks: [
                          {
                            type: 'orderedList',
                            items: [
                              'In your Databricks workspace, open **Compute** and select your target cluster.',
                              'Open the **Libraries** tab and click **Install new**.',
                              'Select **PyPI**, enter `icebergdb`, and click **Install**.',
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Databricks on AWS / GCP / Azure',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Store your `ib_...` key inside Databricks Secret Manager so credentials never appear in notebook plaintext:',
                          },
                          {
                            type: 'code',
                            noHeader: true,
                            code: `databricks secrets put-secret iceberg api_key --string-value "ib_your_api_key"`,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'dbx-step-2',
                title: 'Load the dataset into Spark partitions',
                blocks: [
                  { type: 'p', text: 'Load a dataset and repartition it across Spark executors for parallel processing:' },
                  {
                    type: 'orderedList',
                    items: [
                      {
                        text: 'Load sample documents and convert them into a partitioned Spark DataFrame:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `from datasets import load_dataset

raw = load_dataset("ag_news", split="train[:2000]")
dataset_df = spark.createDataFrame(raw.to_pandas()).repartition(8)
display(dataset_df.limit(5))`,
                        },
                      },
                      {
                        text: 'Add a deterministic string `id` column using `monotonically_increasing_id()` and `withColumn`:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `from pyspark.sql.functions import monotonically_increasing_id, col

dataset_df = dataset_df.withColumn("id", monotonically_increasing_id().cast("string"))`,
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'dbx-step-3',
                title: 'Create embeddings across partitions',
                blocks: [
                  {
                    type: 'orderedList',
                    items: [
                      {
                        text: 'Define a partition function that loads `all-MiniLM-L6-v2` once per executor partition and encodes batches:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `def create_embeddings(partition_rows):
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    batch = list(partition_rows)
    if not batch:
        return
    texts = [r.text for r in batch]
    vecs = model.encode(texts, normalize_embeddings=True).tolist()
    for row, vec in zip(batch, vecs):
        yield (row.id, vec, row.text, int(row.label))`,
                      },
                      },
                      {
                        text: 'Apply `mapPartitions` and convert the RDD back into a structured DataFrame:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `embeddings_rdd = dataset_df.rdd.mapPartitions(create_embeddings)
embeddings_df = embeddings_rdd.toDF(["id", "values", "text", "label"])`,
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'dbx-step-4',
                title: 'Store the embeddings in Iceberg',
                blocks: [
                  {
                    type: 'orderedList',
                    items: [
                      {
                        text: 'Initialize `iceberg.Client` on the driver and create a `384`-dimension collection:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `from iceberg import Client

api_key = dbutils.secrets.get(scope="iceberg", key="api_key")
ib = Client(api_key=api_key, source_tag="databricks")
ib.create_collection("databricks_news_384", dimension=384, metric="cosine")`,
                        },
                      },
                      {
                        text: 'Upsert every partition in batches of `128` vectors using `upsert_vectors`:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `def upsert_partition(pdf_iter):
    import pandas as pd
    from iceberg import Client
    client = Client(api_key=api_key, source_tag="databricks")
    for pdf in pdf_iter:
        records = [
            {"id": r["id"], "values": list(r["values"]), "text": r["text"], "metadata": {"label": int(r["label"])}}
            for _, r in pdf.iterrows()
        ]
        for i in range(0, len(records), 128):
            client.upsert_vectors("databricks_news_384", records[i:i+128], namespace="gold")
        yield pd.DataFrame([{"upserted": len(records)}])

embeddings_df.mapInPandas(upsert_partition, schema="upserted long").show()`,
                        },
                      },
                      {
                        text: 'Verify indexed results with a vector similarity query:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `res = ib.query_vectors("databricks_news_384", query_text="semiconductor chip earnings", top_k=3, namespace="gold")
for match in res["matches"]:
    print(f"{match['score']:.4f} | {match['id']} | {match['text'][:80]}")`,
                        },
                      },
                    ],
                  },
                  {
                    type: 'callout',
                    variant: 'info',
                    text: 'Want to skip Spark-side GPU embedding completely? Call `ib.index_text("databricks_news_384", text)` to embed directly on Iceberg server CPU at Rs.0 extra cost.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'estuary',
    name: 'Estuary',
    category: 'data-sources',
    shortDesc: 'Build real-time, millisecond-latency Change Data Capture (CDC) pipelines into Iceberg.',
    summary: 'Use Estuary Flow real-time Change Data Capture (CDC) pipelines to incrementally sync PostgreSQL, MySQL, MongoDB, and Snowflake updates into Iceberg.',
    intro: [
      '[Estuary](https://estuary.dev) Flow is a real-time data operations platform that captures sub-second Change Data Capture (CDC) events from transactional databases and SaaS systems.',
      'Materializing Estuary collections to Iceberg HTTP vector endpoints (`PUT /documents/{collection}/points/{id}` or `POST /vectors/upsert`) ensures product inventory, pricing, and support records stay fresh in your RAG index with millisecond latency.',
      'Because Estuary streams incremental row-level deltas rather than full-table batch reloads, engineering teams drastically cut compute and embedding costs.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'fleak',
    name: 'Fleak',
    category: 'data-sources',
    shortDesc: 'Combine SQL, LLM inference, and Iceberg vector search in serverless APIs for RAG and data enrichment.',
    summary: "Use Fleak's low-code workflows with Iceberg to combine SQL transformations, LLM inference, and vector search in serverless APIs for RAG and data enrichment pipelines.",
    intro: [
      'Fleak is a low-code platform for building, deploying, and managing serverless data workflows. You chain SQL nodes, JSON transformations, embedding calls, and HTTP microservice nodes in a single browser environment without managing infrastructure.',
      'By connecting Fleak HTTP destination nodes to `https://api.icebergdb.in/vectors/upsert` and `/search`, you can enrich incoming events with historical vector context and publish autoscaling RAG endpoints in minutes.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'flowise',
    name: 'FlowiseAI',
    category: 'data-sources',
    shortDesc: 'Build low-code LLM apps that upsert documents and query Iceberg collections for RAG chatbots.',
    summary: 'Use FlowiseAI with Iceberg to build visual drag-and-drop LLM apps that index documents, recall 4-tier memory, and query hybrid vector collections.',
    intro: [
      'Flowise is an open-source low-code visual builder for orchestrating LLM chains, conversational RAG chatbots, and multi-agent tool workflows.',
      'Connecting Flowise Custom Tools or HTTP Retriever nodes to `https://api.icebergdb.in` lets you ground visual chatflows on low-latency `ap-south-1` hybrid vector + BM25 search and persistent agent memory.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'gathr',
    name: 'Gathr',
    category: 'data-sources',
    shortDesc: 'Build and operationalize data and AI-driven solutions at scale.',
    summary: "Use Gathr's no-code data-to-outcome platform with Iceberg to build enterprise RAG apps, chatbots, and governed Spark vector pipelines from ingestion through deployment.",
    intro: [
      '[Gathr](https://gathr.one) is a unified enterprise data engineering and GenAI pipeline platform built on Apache Spark.',
      'With Gathr visual processors, teams can ingest unstructured and relational sources, mask sensitive PII fields for DPDP Act 2023 compliance, generate embeddings, and emit vector batches directly to Iceberg Cloud or private VPC BYOC instances.',
      'Built-in pipeline scheduling, schema drift monitoring, and RBAC governance take enterprise RAG workflows from prototype to production rapidly.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'matillion',
    name: 'Matillion',
    category: 'data-sources',
    shortDesc: 'Create and maintain data pipelines, build custom connectors for any source, and choose between AI and high-code options.',
    summary: 'Use Matillion Data Productivity Cloud to chunk, embed, and upsert warehouse tables into Iceberg with low-code AI pipelines for RAG and enterprise search.',
    intro: [
      '[Matillion Data Productivity Cloud](https://www.matillion.com) empowers data teams on Snowflake, Databricks, and Amazon Redshift to orchestrate cloud-scale ELT and GenAI readiness pipelines.',
      'Using Matillion Custom REST Connectors or Python Pushdown components, analytics engineers can transform curated warehouse tables into semantic chunks and upsert them directly into Iceberg (`POST /vectors/upsert`).',
      'Automated incremental syncs ensure your downstream AI agents always reason over governed warehouse metrics and product catalogs.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [
      {
        id: 'resources',
        title: 'Resources',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[Iceberg REST Vector Upsert & Query Specification](https://api.icebergdb.in/docs)',
              '[Official Iceberg Python SDK (`pip install icebergdb`)](/product/sdk)',
              '[Multi-Tenant Namespaces for Warehouse Environments](/product/namespaces)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'nexla',
    name: 'Nexla',
    category: 'data-sources',
    shortDesc: 'Ingest data from 500+ connectors with Nexla low-code and no-code AI integration platform.',
    summary: 'Use Nexla governed data products ("Nexsets") to stream SharePoint, OneDrive, S3, and 500+ enterprise sources into Iceberg for RAG.',
    intro: [
      'Nexla automates enterprise data integration by turning raw files, APIs, and streams into schema-validated data products called Nexsets with built-in chunking and transformation stages.',
      'Configuring Iceberg (`https://api.icebergdb.in/vectors/upsert`) as a Nexla REST destination lets teams continuously populate isolated Iceberg namespaces without maintaining custom connector code.',
    ],
    cta: {
      label: 'Get started',
      href: 'https://dashboard.icebergdb.in/signup',
      secondaryLabel: 'Explore Nexla',
      secondaryHref: 'https://nexla.com',
    },
    sections: [],
  },

  {
    slug: 'redpanda',
    name: 'Redpanda',
    category: 'data-sources',
    shortDesc: 'Connect existing data sources to Iceberg with a Kafka-compatible streaming data platform built for data-intensive applications.',
    summary: "Stream events into Iceberg with Redpanda Connect's declarative YAML pipelines for real-time vector ingestion, at-least-once delivery, and RAG ETL.",
    intro: [
      'Redpanda is a C++ Kafka-compatible streaming data platform engineered for ultra-low tail latency and zero ZooKeeper or JVM complexity.',
      'Using Redpanda Connect (`rpk connect`), you can consume streaming topics, enrich payloads or generate embeddings in flight, and batch-POST JSON records straight to `https://api.icebergdb.in/vectors/upsert` with automatic backpressure and retry guarantees.',
      'This architecture keeps operational AI assistants and anomaly-detection agents updated within milliseconds of live production events.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'snowflake-openflow',
    name: 'Snowflake Openflow',
    category: 'data-sources',
    shortDesc: 'Upsert, query, and delete vectors in an Iceberg collection from Openflow data pipelines.',
    summary: 'Connect Snowflake Openflow (powered by Apache NiFi) and Snowflake External Network Access pipelines to upsert, query, and delete vectors in Iceberg.',
    intro: [
      '[Snowflake Openflow](https://www.snowflake.com) is an extensible multimodal data ingestion service built on Apache NiFi following Snowflake Datavolo integration.',
      'Openflow HTTP & Python processors map directly to Iceberg core vector operations:',
    ],
    topBullets: [
      '`POST /vectors/upsert` publishes dense vectors, metadata, and raw text into an Iceberg collection and namespace.',
      '`POST /vectors/query` queries Iceberg for nearest-neighbor matches by vector or hybrid text, or fetches records via `POST /vectors/fetch`.',
      '`POST /vectors/delete` deletes records by ID list, metadata filter, or namespace.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'streamnative',
    name: 'StreamNative',
    category: 'data-sources',
    shortDesc: "Stream data into Iceberg with StreamNative's messaging and event streaming platform.",
    summary: 'Write messages and embeddings from Apache Pulsar and Kafka topics on StreamNative Cloud directly into Iceberg collections in real time.',
    intro: [
      '[StreamNative](https://streamnative.io) powers cloud-native event streaming built on Apache Pulsar with native multi-tenancy and tiered storage.',
      'Routing Pulsar sink workers or webhooks to `https://api.icebergdb.in` lets multi-tenant SaaS platforms map Pulsar tenant topics 1-to-1 into isolated Iceberg namespaces for live customer RAG.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'unstructured',
    name: 'Unstructured',
    category: 'data-sources',
    shortDesc: 'Load partitioned PDFs, Word docs, and 25+ file formats into Iceberg.',
    summary: 'Use Unstructured to parse, chunk by title, and load PDFs, DOCX, PPTX, HTML, and 25+ enterprise file formats into Iceberg for RAG.',
    intro: [
      'Unstructured transforms raw complex files (`PDF`, `DOCX`, `PPTX`, `XLSX`, `HTML`, `EML`, images) into clean, layout-aware text elements ready for retrieval-augmented generation.',
      'Combining Unstructured `chunk_by_title` partitioning with Iceberg server-side `384d` CPU embeddings (or multi-dimension OpenAI/Cohere vectors) turns messy document drives into high-recall hybrid search collections in minutes.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },
]

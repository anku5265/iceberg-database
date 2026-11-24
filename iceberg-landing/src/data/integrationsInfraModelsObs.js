// Iceberg DB v1.0.0 -- Integrations Data Module 3
// Categories: Infrastructure (8), Models (7), Observability (6), Build an integration (3) + Unified Export

import { INTEGRATION_CATEGORIES, AI_AND_DATA_SOURCES } from './integrationsAiAndSources.js'
import { FRAMEWORKS_INTEGRATIONS } from './integrationsFrameworks.js'

export const INFRA_MODELS_OBS_BUILD = [
  // =========================================================================
  // 4. INFRASTRUCTURE (8 HONEST, 100% WORKING CLOUD & IAC PAGES)
  // =========================================================================
  {
    slug: 'aws',
    name: 'AWS Marketplace',
    category: 'infrastructure',
    shortDesc: 'Access Iceberg Cloud in AWS Mumbai (ap-south-1) or deploy BYOC inside your AWS VPC.',
    summary: 'Run Iceberg Cloud or self-hosted BYOC (`iceberg-core-rs`) inside AWS `ap-south-1` (Mumbai) with private VPC networking and encrypted gp3 NVMe storage.',
    intro: [
      'Iceberg Cloud runs natively in India (`ap-south-1` Mumbai), eliminating 200ms US/EU round-trip latency while keeping all vector payloads inside Indian jurisdiction for DPDP Act 2023 and RBI compliance.',
      'For enterprises requiring private VPC isolation, our official `iceberg-terraform` module provisions `iceberg-core-rs` inside your own AWS account on ECS, EKS, or EC2 with encrypted EBS `gp3` volumes.',
    ],
    cta: {
      label: 'Try free on AWS ap-south-1',
      href: 'https://dashboard.icebergdb.in/signup',
      secondaryLabel: 'View BYOC setup guide',
      secondaryTo: '/product/byoc',
    },
    sections: [],
  },

  {
    slug: 'google-cloud',
    name: 'Google Cloud Marketplace',
    category: 'infrastructure',
    shortDesc: 'Deploy Iceberg on Google Cloud Run or GKE in asia-south1 (Mumbai) alongside Vertex AI.',
    summary: 'Host Iceberg BYOC containers inside Google Cloud `asia-south1` (Mumbai) or connect Google Cloud Run microservices to Iceberg Cloud.',
    intro: [
      'Engineering teams building on Google Cloud Vertex AI, Gemini, and Firebase Genkit can co-locate Iceberg inside `asia-south1` (Mumbai) for single-digit millisecond intra-region vector lookups.',
      'Deploy the compiled multi-stage `iceberg-core-rs` container to GKE StatefulSets or Cloud Run with persistent disk mounts and Workload Identity governance.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'microsoft-azure',
    name: 'Microsoft Marketplace',
    category: 'infrastructure',
    shortDesc: 'Run Iceberg on Azure Container Apps or AKS in Central India (Pune) alongside Azure OpenAI.',
    summary: 'Deploy Iceberg inside Microsoft Azure `centralindia` (Pune) or `southindia` (Chennai) VNet environments with Azure Managed Disks.',
    intro: [
      'Organizations standardized on Microsoft Azure and Azure OpenAI Service in India can deploy Iceberg BYOC inside private Azure Virtual Networks on AKS or Azure Container Apps.',
      'All HNSW indices, `.ibwal` write-ahead logs, and `.ibsnap` snapshots remain inside your Azure subscription under your enterprise security controls.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'docker-byoc',
    name: 'Docker Self-Hosted BYOC',
    hideFromOverviewGrid: true,
    hideFromSidebar: true,
    category: 'infrastructure',
    shortDesc: 'Launch the compiled Rust HNSW + BM25 + 4-Tier Memory engine on any Linux host in 60 seconds.',
    summary: 'Self-host the full Iceberg DB v1.0.0 stack (`iceberg-core-rs` Rust binary + FastAPI gateway + ONNX CPU embedder) on any Docker server with zero inbound vendor access.',
    intro: [
      'Iceberg packages the entire vector database, Okapi BM25 hybrid lexical scorer, 4-tier cognitive memory kernel, and quantized `384d` CPU embedder into a single reproducible Docker image.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'docker-step-1',
                title: 'Build and launch the container with a persistent volume',
                blocks: [
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `git clone https://github.com/anku5265/iceberg-database.git
cd iceberg-database
docker build -t icebergdb:1.0.0 ./iceberg-backend

docker run -d \\
  --name icebergdb \\
  -p 8000:8000 \\
  -v iceberg_data:/app/data \\
  -e STORAGE_ENGINE=rust \\
  -e DATA_DIR=/app/data \\
  --restart unless-stopped \\
  icebergdb:1.0.0`,
                  },
                ],
              },
              {
                id: 'docker-step-2',
                title: 'Verify engine status and Prometheus telemetry',
                blocks: [
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `curl -fsS http://localhost:8000/health`,
                  },
                  {
                    type: 'response',
                    code: `{"status":"healthy","version":"1.0.0","active_engine":"iceberg-core-rs"}`,
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
    slug: 'pulumi',
    name: 'Pulumi',
    category: 'infrastructure',
    shortDesc: 'Manage your Iceberg collections and BYOC stacks as code in TypeScript, Python, Go, or C#.',
    summary: 'Provision Iceberg collections, multi-dimension schemas, and BYOC cloud compute as code with Pulumi in TypeScript, Python, Go, or .NET.',
    intro: [
      'Pulumi lets platform teams declare cloud infrastructure and vector database collections using general-purpose programming languages with full IDE autocomplete, loops, and CI/CD previews.',
      'Combine Pulumi dynamic resources with our official `icebergdb` SDKs across TypeScript (`npm install icebergdb`), Python (`pip install icebergdb`), Go (`iceberg-sdk-go`), .NET (`dotnet add package IcebergDb`), and Java (`io.icebergdb:iceberg-sdk:1.0.0`) to keep staging and production collection configurations locked in version control.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'terraform',
    name: 'Terraform',
    category: 'infrastructure',
    shortDesc: 'Manage Iceberg collections, RBAC keys, and AWS ap-south-1 BYOC resources with Terraform configuration files.',
    summary: 'Manage Iceberg collections, projects, RBAC API keys, and AWS `ap-south-1` BYOC infrastructure declaratively with Terraform (`v1.4+`).',
    intro: [
      'HashiCorp Terraform lets DevOps teams codify infrastructure and database lifecycles in declarative HCL configuration files.',
      'This guide covers managing Iceberg Cloud resources (`collections`, `projects`, `RBAC API keys`, and `stats` data sources) alongside our official `iceberg-terraform` AWS `ap-south-1` BYOC VPC module (`v1.0.0`).',
    ],
    cta: null,
    sections: [
      {
        id: 'requirements',
        title: 'Requirements',
        blocks: [
          { type: 'p', text: 'Ensure you have the following:' },
          {
            type: 'bullets',
            items: [
              '[Terraform](https://developer.hashicorp.com/terraform/install) `>= v1.4.0`',
              'An [Iceberg API key](https://dashboard.icebergdb.in/signup) (`admin` role) for managing collections, projects, and scoped keys',
              'AWS IAM credentials (only required when provisioning self-hosted BYOC VPC stacks in `ap-south-1`)',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Terraform `v1.4+` includes the built-in `terraform_data` resource and `hashicorp/http` provider out of the box -- no custom binary compilation is needed.',
          },
        ],
      },
      {
        id: 'install-the-provider',
        title: 'Install the module & providers',
        blocks: [
          {
            type: 'orderedList',
            items: [
              {
                text: 'Declare required providers (and optionally the BYOC VPC module) in `main.tf`:',
                code: {
                  lang: 'hcl',
                  label: 'Terraform',
                  code: `terraform {
  required_version = ">= 1.4.0"
  required_providers {
    http = {
      source  = "hashicorp/http"
      version = "~> 3.4"
    }
  }
}`,
                },
              },
              {
                text: 'Run `terraform init` to initialize your working directory from the [Terraform Registry](https://registry.terraform.io) and [GitHub repository](https://github.com/anku5265/iceberg-database/tree/main/iceberg-terraform).',
              },
            ],
          },
          { type: 'h3', id: 'tf-upgrade-notes', title: 'v1.0.0 schema notes' },
          {
            type: 'bullets',
            items: [
              'Collections default to `dimension = 384`, `metric = "cosine"`, and `quantization = "float32"` when omitted.',
              'Custom multi-dimension collections (`1..8192`) accept `metric` values `cosine`, `dotproduct`, `euclidean`, or `manhattan`.',
              'Runtime memory compression (`quantization = "sq8"` for ~4x RAM savings or `"binary"` for 32x RAM savings) can be configured at creation.',
            ],
          },
        ],
      },
      {
        id: 'authenticate',
        title: 'Authenticate',
        blocks: [
          { type: 'p', text: 'Iceberg supports role-scoped SHA-256 API keys for control-plane and data-plane automation:' },
          {
            type: 'table',
            headers: ['Credential Role', 'Environment Variable', 'Permitted Operations'],
            rows: [
              ['`admin` key', '`TF_VAR_iceberg_api_key`', 'Manage projects, create/revoke RBAC keys, create/delete collections, backups'],
              ['`read_write` key', '`TF_VAR_iceberg_api_key`', 'Create collections, index documents, upsert vectors, search, 4-tier memory'],
              ['`read_only` key', '`TF_VAR_iceberg_api_key`', 'Read collection stats (`GET /collections/{name}/stats`) and query only'],
            ],
          },
          { type: 'p', text: 'Export your admin key as a Terraform environment variable before running `terraform plan`:' },
          {
            type: 'code',
            noHeader: true,
            code: `export TF_VAR_iceberg_api_key="ib_your_admin_api_key"`,
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Always mark `variable "iceberg_api_key"` with `sensitive = true` so secret values are redacted from CLI plan logs.',
          },
        ],
      },
      {
        id: 'manage-resources',
        title: 'Manage resources',
        blocks: [
          { type: 'p', text: 'You can manage the full Iceberg resource hierarchy declaratively in HCL:' },
          {
            type: 'table',
            headers: ['Target Resource', 'Description', 'REST / Module Backing'],
            rows: [
              ['`iceberg_collection`', '384d built-in CPU or custom 1..8192d HNSW + BM25 collection', '`POST / DELETE /collections`'],
              ['`iceberg_project`', 'Isolated project workspace for staging/production separation', '`POST / DELETE /projects`'],
              ['`iceberg_api_key`', 'Scoped `admin`, `read_write`, or `read_only` SHA-256 API key', '`POST / DELETE /auth/keys`'],
              ['`iceberg_byoc_vpc`', 'Self-hosted AWS `ap-south-1` VPC, EC2, SG, and encrypted `gp3` EBS', '`//iceberg-terraform` module'],
            ],
          },
          { type: 'h3', id: 'tf-collections', title: 'Collections' },
          { type: 'h4', id: 'tf-integrated-embedding', title: 'Built-in 384d CPU collections' },
          {
            type: 'p',
            text: 'Create a collection with integrated server-side `all-MiniLM-L6-v2` (`384d`) ONNX CPU embeddings and automatic Okapi BM25 hybrid indexing:',
          },
          {
            type: 'code',
            lang: 'hcl',
            label: 'Terraform',
            code: `resource "terraform_data" "docs_collection" {
  input = "prod_docs_384"

  provisioner "local-exec" {
    command = <<-EOT
      curl -fsS -X POST "https://api.icebergdb.in/collections" \\
        -H "X-API-Key: \${var.iceberg_api_key}" \\
        -H "X-Iceberg-Integration: terraform" \\
        -H "Content-Type: application/json" \\
        -d '{"name":"prod_docs_384","dimension":384,"metric":"cosine","quantization":"float32"}'
    EOT
  }
}`,
          },
          { type: 'h4', id: 'tf-vector-collections', title: 'Multi-dimension & quantized collections' },
          {
            type: 'p',
            text: 'Provision `1536d` (`sq8` 4x compression) or `3072d` (`binary` 32x compression) collections for external OpenAI, Cohere, or Voyage AI embeddings:',
          },
          {
            type: 'code',
            lang: 'hcl',
            label: 'Terraform',
            code: `resource "terraform_data" "openai_1536_sq8" {
  input = "openai_1536_sq8"

  provisioner "local-exec" {
    command = <<-EOT
      curl -fsS -X POST "https://api.icebergdb.in/collections" \\
        -H "X-API-Key: \${var.iceberg_api_key}" \\
        -H "Content-Type: application/json" \\
        -d '{"name":"openai_1536_sq8","dimension":1536,"metric":"cosine","quantization":"sq8","deletion_protection":true}'
    EOT
  }
}`,
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Collection `dimension` and `metric` are immutable once created. Changing `dimension` from `384` to `1536` requires creating a new collection and re-indexing vectors.',
          },
          { type: 'h4', id: 'tf-byoc-module', title: 'BYOC VPC deployments (ap-south-1)' },
          {
            type: 'code',
            lang: 'hcl',
            label: 'Terraform',
            code: `module "iceberg_byoc_mumbai" {
  source        = "github.com/anku5265/iceberg-database//iceberg-terraform"
  aws_region    = "ap-south-1"
  instance_type = "t3.large"
  ebs_size_gb   = 100
}`,
          },
          { type: 'h3', id: 'tf-api-keys', title: 'RBAC API keys' },
          {
            type: 'p',
            text: 'Generate least-privilege `read_only` or `read_write` keys scoped to a specific `project_id`:',
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Raw `ib_...` secret keys are returned only once at creation (only the SHA-256 hash is stored on the server). Store Terraform state in an encrypted S3/GCS backend and never commit `terraform.tfstate` to Git.',
          },
        ],
      },
      {
        id: 'read-existing-resources',
        title: 'Read existing resources',
        blocks: [
          {
            type: 'p',
            text: 'Use `data "http"` blocks to inspect live collection dimensions, quantization ratios, and namespace counts during `terraform plan`:',
          },
          {
            type: 'table',
            headers: ['Data Source Endpoint', 'Required Parameter', 'Returned Attributes', 'Credential'],
            rows: [
              ['`GET /collections`', '`--`', '`collections` list', '`X-API-Key`'],
              ['`GET /collections/{name}/stats`', '`name`', '`dimension`, `metric`, `quantization`, `vector_count`, `namespaces`', '`X-API-Key`'],
              ['`GET /projects`', '`--`', '`projects` list (`id`, `name`, `region`)', '`X-API-Key`'],
              ['`GET /status`', '`--`', '`version`, `region`, `active_engine`, `uptime`', 'Public / `X-API-Key`'],
            ],
          },
          {
            type: 'code',
            lang: 'hcl',
            label: 'Terraform',
            code: `data "http" "prod_docs_stats" {
  url = "https://api.icebergdb.in/collections/prod_docs_384/stats"
  request_headers = {
    X-API-Key = var.iceberg_api_key
  }
}

output "prod_docs_vector_count" {
  value = jsondecode(data.http.prod_docs_stats.response_body).vector_count
}`,
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
              '[Official iceberg-terraform Module on GitHub](https://github.com/anku5265/iceberg-database/tree/main/iceberg-terraform)',
              '[Iceberg BYOC Architecture Overview](/product/byoc)',
              '[Interactive OpenAPI Reference](https://api.icebergdb.in/docs)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'vercel',
    name: 'Vercel',
    category: 'infrastructure',
    shortDesc: 'Use Iceberg as the long-term memory and hybrid search engine for your Vercel AI projects.',
    summary: 'Connect your Next.js App Router and Vercel AI SDK (`streamText`) projects to Iceberg collections and 4-tier agent memory.',
    intro: [
      'Vercel is a frontend and serverless cloud platform that deploys Next.js, SvelteKit, and AI SDK streaming applications with zero configuration.',
      'Iceberg provides sub-15ms hybrid search and persistent 4-tier agent memory for your Vercel AI projects via `npm install icebergdb` (`v1.0.0`). Because the SDK uses standard Web `fetch` with zero native C++ addons, it runs cleanly in both Vercel Serverless Functions and Edge Runtime.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'zapier',
    name: 'Zapier',
    category: 'infrastructure',
    shortDesc: 'Connect Iceberg to thousands of apps with Zapier to automate your work without code.',
    summary: 'Use Webhooks by Zapier to connect Iceberg to 7,000+ apps, automatically index new records, store CRM memories, or run searches without writing code.',
    intro: [
      '[Zapier](https://zapier.com) lets you connect Iceberg with thousands of business tools -- including Slack, Gmail, HubSpot, Notion, Google Sheets, and Typeform -- without writing backend glue code.',
      'Using **Webhooks by Zapier**, any app event can automatically index text (`POST /documents/text`), record 4-tier agent memories (`POST /memory/{agent}/remember`), or query an Iceberg Assistant (`POST /assistant/{id}/chat`) and post grounded answers directly into your team Slack channel.',
    ],
    cta: {
      label: 'Get started',
      href: 'https://dashboard.icebergdb.in/signup',
      secondaryLabel: 'View REST endpoints',
      secondaryTo: '/docs',
    },
    sections: [],
  },

  // =========================================================================
  // 5. MODELS (7 PAGES -- INCLUDING FULL COHERE & VOYAGE GUIDES + DIAGRAM)
  // =========================================================================
  {
    slug: 'builtin-onnx',
    name: 'Built-in ONNX CPU (Free 384d)',
    hideFromOverviewGrid: true,
    hideFromSidebar: true,
    category: 'models',
    shortDesc: 'Generate 384d all-MiniLM-L6-v2 embeddings + Okapi BM25 hybrid vectors on server CPU at Rs.0 extra cost.',
    summary: 'Index plain text, Markdown, and PDFs directly in Iceberg using built-in server-side `all-MiniLM-L6-v2` (`384d`) ONNX CPU embeddings at Rs.0 ($0) extra API cost.',
    intro: [
      'Every Iceberg workspace includes quantized server-side `all-MiniLM-L6-v2` (`384d` Cosine) embedding generation paired automatically with our compound-preserving Okapi BM25 lexical index -- so you can ship hybrid RAG without paying external OpenAI or Cohere token bills.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'onnx-step-1',
                title: 'Install the Iceberg SDK',
                blocks: [
                  { type: 'code', lang: 'bash', label: 'Shell', code: `pip install -U icebergdb` },
                ],
              },
              {
                id: 'onnx-step-2',
                title: 'Index raw text and run hybrid RRF search',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from iceberg import Client

ib = Client(api_key="ib_your_api_key")
ib.create_collection("zero_cost_kb")  # 384d Cosine + Okapi BM25

ib.index_text("zero_cost_kb", "Invoice INV-9042-AX was settled via IMPS in Mumbai.")
hits = ib.search("zero_cost_kb", "status of INV-9042-AX", search_type="hybrid", top_k=3)
for h in hits:
    print(f"{h.score:.4f}: {h.text}")`,
                  },
                  {
                    type: 'response',
                    code: `0.9412: Invoice INV-9042-AX was settled via IMPS in Mumbai.`,
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
    slug: 'cohere',
    name: 'Cohere',
    category: 'models',
    shortDesc: 'Generate text embeddings with Cohere and store them in Iceberg for semantic search.',
    summary: 'Generate `1024`-dimensional embeddings with the Cohere Embed v3 API, index them in Iceberg, and run semantic search queries against the collection.',
    intro: [
      'The Cohere platform provides enterprise foundation models and multilingual embedding APIs (`embed-english-v3.0` and `embed-multilingual-v3.0`) covering semantic search, classification, and retrieval-augmented generation.',
      'Use the Cohere Embed API endpoint to generate `1024d` embeddings and store them in Iceberg (`POST /vectors/upsert`) for fast, low-latency vector search.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'p',
            text: 'In this guide, you will use the [Cohere Embed API](https://docs.cohere.com/reference/embed) (`embed-english-v3.0`, `1024d`) to embed 1,000 questions from the TREC dataset and search them in [Iceberg Database](/product/database).',
          },
          { type: 'p', text: 'The basic workflow looks like this:' },
          {
            type: 'nestedBullets',
            items: [
              {
                label: 'Embed and index',
                children: [
                  'Use the Cohere Embed v3 endpoint (`input_type="search_document"`) to generate `1024d` float embeddings of your documents.',
                  'Batch-upsert those vector embeddings into an Iceberg `1024d` Cosine collection.',
                ],
              },
              {
                label: 'Search',
                children: [
                  'Pass the user query through Cohere Embed v3 with `input_type="search_query"`.',
                  'Send the `1024d` query vector to Iceberg `query_vectors` (`POST /vectors/query`).',
                  'Receive ranked semantically similar passages even when they share zero exact keywords with the query.',
                ],
              },
            ],
          },
          {
            type: 'diagram',
            variant: 'cohere',
          },
          {
            type: 'steps',
            items: [
              {
                id: 'cohere-step-1',
                title: 'Set up the environment',
                blocks: [
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `pip install -U cohere icebergdb datasets numpy`,
                  },
                ],
              },
              {
                id: 'cohere-step-2',
                title: 'Create embeddings',
                blocks: [
                  {
                    type: 'p',
                    text: 'Initialize `cohere.ClientV2` with your [Cohere API key](https://dashboard.cohere.com/api-keys) and load the first 1,000 questions from the TREC dataset:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import cohere, numpy as np
from datasets import load_dataset

co = cohere.ClientV2(api_key="YOUR_COHERE_API_KEY")
trec = load_dataset("CogComp/trec", split="train[:1000]")

embeds = []
batch_size = 96
for i in range(0, len(trec), batch_size):
    batch_texts = trec[i : i + batch_size]["text"]
    res = co.embed(
        texts=batch_texts,
        model="embed-english-v3.0",
        input_type="search_document",
        embedding_types=["float"],
        truncate="END",
    )
    embeds.extend(res.embeddings.float_)

shape = np.array(embeds).shape
print(shape)`,
                  },
                  {
                    type: 'response',
                    code: `(1000, 1024)`,
                  },
                  {
                    type: 'p',
                    text: '`embed-english-v3.0` produces `1024`-dimensional vectors for each of the `1000` TREC questions.',
                  },
                ],
              },
              {
                id: 'cohere-step-3',
                title: 'Store the embeddings',
                blocks: [
                  {
                    type: 'p',
                    text: 'Create a `1024`-dimension Cosine collection in Iceberg using your [Iceberg API key](https://dashboard.icebergdb.in), batch-upsert the records (`batch_size = 128`), and inspect `describe_collection_stats`:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from iceberg import Client

ib = Client(api_key="ib_your_api_key", source_tag="cohere")
collection_name = "cohere-iceberg-trec"
ib.create_collection(collection_name, dimension=shape[1], metric="cosine")

for i in range(0, len(trec), 128):
    end = min(i + 128, len(trec))
    records = [
        {"id": str(k), "values": embeds[k], "text": trec[k]["text"]}
        for k in range(i, end)
    ]
    ib.upsert_vectors(collection_name, records)

print(ib.describe_collection_stats(collection_name))`,
                  },
                  {
                    type: 'response',
                    code: `{'name': 'cohere-iceberg-trec', 'dimension': 1024, 'metric': 'cosine', 'vector_count': 1000, 'namespaces': {'': 1000}}`,
                  },
                ],
              },
              {
                id: 'cohere-step-4',
                title: 'Run a semantic search',
                blocks: [
                  {
                    type: 'p',
                    text: 'Embed a search query with `input_type="search_query"` and query Iceberg — notice how semantic search finds topically matching historical questions even when phrasing differs ("recession" / "economic downturn" vs "Great Depression"):',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `query = "What caused the major economic downturn in the late 1920s?"
xq = co.embed(
    texts=[query],
    model="embed-english-v3.0",
    input_type="search_query",
    embedding_types=["float"],
).embeddings.float_[0]

res = ib.query_vectors(collection_name, vector=xq, top_k=5)
for match in res["matches"]:
    print(f"{match['score']:.2f}: {match['text']}")`,
                  },
                  {
                    type: 'response',
                    code: `0.62: Why did the world enter a global depression in 1929 ?
0.54: When was '' the Great Depression '' ?
0.38: What are some of the significant historical events of the 1990s ?
0.35: When did World War I start ?
0.32: What do economists do ?`,
                  },
                ],
              },
              {
                id: 'cohere-step-5',
                title: 'Clean up',
                blocks: [
                  { type: 'p', text: "When you're finished with the collection, delete it:" },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `ib.delete_collection(collection_name)`,
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
    slug: 'voyage-ai',
    name: 'Voyage AI',
    category: 'models',
    shortDesc: 'Generate embeddings with Voyage AI models for semantic search and RAG.',
    summary: 'Generate domain-specific Voyage AI embeddings (`voyage-law-2`, `voyage-code-3`, `voyage-3`) for contract or code documents, index them in Iceberg, and run semantic search.',
    intro: [
      '[Voyage AI](https://www.voyageai.com) provides high-accuracy general-purpose (`voyage-3`) and domain-specialized embedding models for source code (`voyage-code-3`), finance (`voyage-finance-2`), and legal contracts (`voyage-law-2`). This guide uses `voyage-law-2` (`1024d`).',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'p',
            text: 'Use the [Voyage Embedding API](https://docs.voyageai.com/docs/embeddings) to encode consumer contract clauses from LegalBench and index them into a `1024`-dimension Iceberg collection.',
          },
          {
            type: 'steps',
            items: [
              {
                id: 'voy-step-1',
                title: 'Set up the environment',
                blocks: [
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `pip install -U voyageai icebergdb datasets numpy`,
                  },
                ],
              },
              {
                id: 'voy-step-2',
                title: 'Create embeddings with voyage-law-2',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import voyageai, numpy as np
from datasets import load_dataset

vc = voyageai.Client(api_key="YOUR_VOYAGE_API_KEY")
corpus = load_dataset("mteb/legalbench_consumer_contracts_qa", "corpus", split="corpus")

embeds = []
for i in range(0, len(corpus), 128):
    batch = corpus[i : i + 128]["text"]
    embeds.extend(vc.embed(batch, model="voyage-law-2", input_type="document", truncation=True).embeddings)

print(np.array(embeds).shape)`,
                  },
                  {
                    type: 'response',
                    code: `(154, 1024)`,
                  },
                ],
              },
              {
                id: 'voy-step-3',
                title: 'Store the embeddings in Iceberg',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from iceberg import Client

ib = Client(api_key="ib_your_api_key", source_tag="voyage-ai")
ib.create_collection("voyage-legalbench-1024", dimension=1024, metric="cosine")

records = [
    {"id": str(corpus[i]["_id"]), "values": embeds[i], "text": corpus[i]["text"][:1000]}
    for i in range(len(corpus))
]
ib.upsert_vectors("voyage-legalbench-1024", records)
print(ib.describe_collection_stats("voyage-legalbench-1024"))`,
                  },
                  {
                    type: 'response',
                    code: `{'name': 'voyage-legalbench-1024', 'dimension': 1024, 'metric': 'cosine', 'vector_count': 154, 'namespaces': {'': 154}}`,
                  },
                ],
              },
              {
                id: 'voy-step-4',
                title: 'Run a semantic search',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `q_vec = vc.embed(["Can the provider terminate my account without prior notice?"], model="voyage-law-2", input_type="query").embeddings[0]
hits = ib.query_vectors("voyage-legalbench-1024", vector=q_vec, top_k=3)
for m in hits["matches"]:
    print(f"{m['score']:.3f} | {m['id']} | {m['text'][:90]}...")`,
                  },
                ],
              },
              {
                id: 'voy-step-5',
                title: 'Clean up',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `ib.delete_collection("voyage-legalbench-1024")`,
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
    slug: 'huggingface',
    name: 'Hugging Face Inference Endpoints',
    cardTitle: 'Hugging Face',
    category: 'models',
    shortDesc: 'Deploy machine learning models on Hugging Face Inference Endpoints and use them to create embeddings for Iceberg.',
    summary: 'Generate open-weights embeddings (`BAAI/bge-base-en-v1.5` `768d`, `BAAI/bge-m3` `1024d`, `nomic-embed-text`) on Hugging Face Inference Endpoints and store them in Iceberg.',
    intro: [
      'Hugging Face Inference Endpoints run dedicated Rust Text Embeddings Inference (TEI) servers for any open-source encoder on Hugging Face Hub.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'hf-step-1',
                title: 'Install huggingface_hub and icebergdb',
                blocks: [
                  { type: 'code', lang: 'bash', label: 'Shell', code: `pip install -U huggingface_hub icebergdb` },
                ],
              },
              {
                id: 'hf-step-2',
                title: 'Encode with InferenceClient and upsert into a 768d collection',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from huggingface_hub import InferenceClient
from iceberg import Client

hf = InferenceClient(model="BAAI/bge-base-en-v1.5", token="hf_your_token")
ib = Client(api_key="ib_your_api_key", source_tag="huggingface")
ib.create_collection("hf_bge_768", dimension=768, metric="cosine")

text = "Open-weights BGE embeddings indexed in Iceberg HNSW."
vec = hf.feature_extraction(text).tolist()
ib.upsert_vectors("hf_bge_768", [{"id": "doc_1", "values": vec, "text": text}])`,
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
    slug: 'jina-ai',
    name: 'Jina AI',
    cardTitle: 'Jina',
    category: 'models',
    shortDesc: 'Generate text embeddings with Jina AI models, fine-tuned for domain- and language-specific use cases.',
    summary: 'Generate `1024`-dimensional multilingual late-chunking embeddings with `jina-embeddings-v3` and index them in Iceberg.',
    intro: [
      'Jina Embeddings v3 supports 8,192-token contexts across 89 languages with task-specific LoRA adapters (`retrieval.passage` and `retrieval.query`).',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'jina-step-1',
                title: 'Call Jina Embeddings v3 and store in Iceberg',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import httpx
from iceberg import Client

ib = Client(api_key="ib_your_api_key", source_tag="jina-ai")
ib.create_collection("jina_v3_1024", dimension=1024, metric="cosine")

resp = httpx.post(
    "https://api.jina.ai/v1/embeddings",
    headers={"Authorization": "Bearer jina_your_key"},
    json={"model": "jina-embeddings-v3", "task": "retrieval.passage", "dimensions": 1024, "input": ["Multilingual Hindi & English policy clause"]},
).json()

ib.upsert_vectors("jina_v3_1024", [{"id": "j_1", "values": resp["data"][0]["embedding"], "text": "Multilingual Hindi & English policy clause"}])`,
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
    slug: 'openai',
    name: 'OpenAI',
    category: 'models',
    shortDesc: 'Use OpenAI models to generate embeddings and responses, and store the embeddings in Iceberg.',
    summary: 'Generate `1536d` (`text-embedding-3-small`) or `3072d` (`text-embedding-3-large`) embeddings with OpenAI, store them in Iceberg, and ground GPT-4o responses.',
    intro: [
      'Iceberg natively supports `1536`, `3072`, and custom Matryoshka dimensions from OpenAI embedding models across all 6 official SDKs: Python (`pip install icebergdb`), Node.js/TypeScript (`npm install icebergdb`), Java, Go, Rust (`cargo add icebergdb`), and .NET (`dotnet add package IcebergDb`).',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'oa-step-1',
                title: 'Set up the environment',
                blocks: [
                  { type: 'code', lang: 'bash', label: 'Shell', code: `pip install -U openai icebergdb` },
                ],
              },
              {
                id: 'oa-step-2',
                title: 'Embed documents and store in a 1536d Iceberg collection',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from openai import OpenAI
from iceberg import Client

oa = OpenAI(api_key="sk-...")
ib = Client(api_key="ib_your_api_key", source_tag="openai")
ib.create_collection("openai_1536", dimension=1536, metric="cosine")

docs = [
    "Iceberg SQ8 quantization cuts 1536d RAM usage by 3.98x with >98% recall.",
    "Binary quantization cuts 3072d RAM usage by 32x using hardware POPCNT.",
]
embs = [d.embedding for d in oa.embeddings.create(model="text-embedding-3-small", input=docs).data]

ib.upsert_vectors("openai_1536", [
    {"id": f"doc_{i}", "values": embs[i], "text": docs[i]} for i in range(len(docs))
])`,
                  },
                ],
              },
              {
                id: 'oa-step-3',
                title: 'Query vectors and generate a grounded GPT-4o answer',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `q = "How much memory does Binary quantization save on 3072d vectors?"
q_vec = oa.embeddings.create(model="text-embedding-3-small", input=q).data[0].embedding

hits = ib.query_vectors("openai_1536", vector=q_vec, top_k=2)
ctx = "\\n".join(m["text"] for m in hits["matches"])

chat = oa.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": f"Context:\\n{ctx}\\n\\nQuestion: {q}"}],
)
print(chat.choices[0].message.content)`,
                  },
                  {
                    type: 'response',
                    code: `Binary quantization reduces 3072d RAM usage by 32x using hardware POPCNT instructions.`,
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
    slug: 'twelve-labs',
    name: 'Twelve Labs',
    category: 'models',
    shortDesc: 'Create multimodal embeddings from video with Twelve Labs and store them in Iceberg.',
    summary: 'Generate `1024`-dimensional multimodal video, audio, and motion clip embeddings with Twelve Labs Marengo and index timestamped segments in Iceberg.',
    intro: [
      'Twelve Labs Marengo encodes visual frames, on-screen text, audio, and spoken dialogue into `1024d` vectors per video clip window (`start_offset_sec` to `end_offset_sec`), enabling instant natural-language scene search in Iceberg.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'tl-step-1',
                title: 'Embed video segments and index timestamps in Iceberg',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from twelvelabs import TwelveLabs
from iceberg import Client

tl = TwelveLabs(api_key="tlk_...")
ib = Client(api_key="ib_your_api_key", source_tag="twelve-labs")
ib.create_collection("video_archive_1024", dimension=1024, metric="cosine")

task = tl.embed.task.create(model_name="Marengo-retrieval-2.7", video_url="https://example.com/keynote.mp4")
task.wait_for_done()
res = tl.embed.task.retrieve(task.id)

ib.upsert_vectors("video_archive_1024", [
    {
        "id": f"seg_{i}",
        "values": seg.embeddings_float,
        "text": f"Keynote clip {seg.start_offset_sec}s-{seg.end_offset_sec}s",
        "metadata": {"start_sec": seg.start_offset_sec, "end_sec": seg.end_offset_sec},
    }
    for i, seg in enumerate(res.video_embedding.segments)
])`,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 6. OBSERVABILITY (6 PAGES -- EXACT DATADOG, HONEYHIVE, NEW RELIC, TRACELOOP, TRULENS)
  // =========================================================================
  {
    slug: 'prometheus-grafana',
    name: 'Prometheus & Grafana',
    hideFromOverviewGrid: true,
    hideFromSidebar: true,
    category: 'observability',
    shortDesc: 'Scrape native OpenMetrics / Prometheus gauges and counters directly from GET /metrics.',
    summary: 'Scrape real-time Rust HNSW search latency, collection counts, vector totals, and RAM utilization directly from `GET /metrics` into Prometheus and Grafana.',
    intro: [
      'Both `https://api.icebergdb.in/metrics` and self-hosted `iceberg-core-rs` containers expose Prometheus exposition format natively with zero external exporter required.',
    ],
    cta: null,
    sections: [
      {
        id: 'exported-metrics',
        title: 'Exported metrics',
        blocks: [
          {
            type: 'table',
            headers: ['Metric', 'Type', 'Description'],
            rows: [
              ['`iceberg_collections_total`', '`gauge`', 'Active collections loaded in `iceberg-core-rs`'],
              ['`iceberg_vectors_total`', '`gauge`', 'Total live non-deleted vectors across collections'],
              ['`iceberg_search_requests_total`', '`counter`', 'Total vector & hybrid search queries served'],
              ['`iceberg_search_latency_ms_avg`', '`gauge`', 'Rolling core Rust HNSW search latency in milliseconds'],
              ['`iceberg_memory_bytes`', '`gauge`', 'Vector matrix & quantized buffer RAM footprint in bytes'],
            ],
          },
          {
            type: 'code',
            lang: 'yaml',
            label: 'YAML (prometheus.yml)',
            code: `scrape_configs:
  - job_name: "icebergdb"
    scheme: https
    metrics_path: "/metrics"
    static_configs:
      - targets: ["api.icebergdb.in"]`,
          },
        ],
      },
    ],
  },

  {
    slug: 'datadog',
    name: 'Datadog',
    category: 'observability',
    shortDesc: 'Monitor your Iceberg usage and performance with Datadog dashboards and alerts.',
    summary: 'Collect OpenMetrics telemetry from Iceberg into Datadog to monitor query latency, vector capacity, and anomaly alerts.',
    intro: [
      'Connecting Datadog to Iceberg (`GET /metrics`) gives your SRE and AI platform teams unified observability:',
    ],
    topBullets: [
      'Track `iceberg_search_requests_total` and `iceberg_integration_requests_total` to identify high-throughput services and optimize resource utilization.',
      'Get alerted automatically when collection vector counts or `iceberg_memory_bytes` cross capacity thresholds.',
      'Triage unexpected spikes in query volume or latency (`iceberg_search_latency_ms_avg`) with Datadog anomaly monitors.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          { type: 'p', text: 'Follow these steps to monitor an Iceberg Cloud or BYOC instance with Datadog:' },
          {
            type: 'orderedList',
            items: [
              'Open the **OpenMetrics** integration tile in your Datadog account.',
              'Open `conf.d/openmetrics.d/conf.yaml` on your Datadog Agent host.',
              'Add a new instance entry with `openmetrics_endpoint: https://api.icebergdb.in/metrics` (or `http://localhost:8000/metrics` on BYOC).',
              'Set `namespace: icebergdb` to group metrics cleanly in Datadog Metrics Explorer.',
              'Include `metrics: ["iceberg_.*"]` to ingest all collection, vector, RAM, and latency series.',
              'Tag the instance with `env:production` and `region:ap-south-1`.',
              'Restart the Datadog Agent and run `datadog-agent status` to verify green scrape health.',
              'Open **Monitors > New Monitor > Metric** in Datadog to configure latency and capacity alerts.',
            ],
          },
          {
            type: 'p',
            text: 'In **Metrics Explorer**, query `avg:icebergdb.iceberg_search_latency_ms_avg{*}` and `sum:icebergdb.iceberg_vectors_total{*}` to build real-time RAG dashboards.',
          },
        ],
      },
    ],
  },

  {
    slug: 'honeyhive',
    name: 'HoneyHive',
    category: 'observability',
    shortDesc: 'Visualize execution traces and spans from your Iceberg calls.',
    summary: 'Use HoneyHive with Iceberg to capture OpenTelemetry traces of SDK calls and visualize spans for observability and evaluation of RAG pipelines.',
    intro: [
      '[HoneyHive](https://www.honeyhive.ai) is an AI observability and evaluation platform that visualizes execution traces and spans across your retrieval and agent memory calls. Using HoneyHive `@trace` decorators in Python or TypeScript alongside `icebergdb` gives you a span-by-span breakdown of query latency, retrieved chunk scores, and groundedness exported via OpenTelemetry.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'new-relic',
    name: 'New Relic',
    category: 'observability',
    shortDesc: 'Monitor your Iceberg application with New Relic for performance analysis.',
    summary: "Monitor Iceberg with New Relic's Prometheus OpenMetrics integration for dashboards, alerts, and AI observability across query latency and RAG performance.",
    intro: [
      'New Relic provides full-stack application performance monitoring (APM) and AI monitoring so engineering teams can correlate LLM latency, vector retrieval speed, and infrastructure health in one place.',
      'Point New Relic Prometheus OpenMetrics scraper or Remote Write at `https://api.icebergdb.in/metrics` (or your BYOC instance) to chart `iceberg_vectors_total` and `iceberg_search_latency_ms_avg` in NRQL and trigger Slack or PagerDuty alerts on threshold changes.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'traceloop',
    name: 'Traceloop',
    category: 'observability',
    shortDesc: 'Produce traces and metrics that can be viewed in any OpenTelemetry-based platform.',
    summary: "Instrument Iceberg RAG workflows with Traceloop's OpenLLMetry SDK to emit standard OpenTelemetry traces and metrics to Datadog, Grafana, or Traceloop.",
    intro: [
      '[Traceloop](https://www.traceloop.com) provides OpenTelemetry-native observability (`OpenLLMetry`) for LLM applications, helping teams debug prompt regressions and latency bottlenecks.',
      'Wrapping your `icebergdb` retrieval and 4-tier memory functions with `@task` and `@workflow` emits standard OTel spans viewable in Grafana Tempo, Datadog, Honeycomb, or Traceloop.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'trulens',
    name: 'TruLens',
    category: 'observability',
    shortDesc: 'Evaluate and track RAG applications built on Iceberg with TruLens.',
    summary: 'Use TruLens to evaluate and track a RAG app built on Iceberg and LangChain, and compare configurations such as the distance metric (`cosine` vs `euclidean`), model, and `top_k`.',
    intro: [
      '[TruLens](https://www.trulens.org) is an open-source library for evaluating and tracking LLM applications. It scores each query with automated feedback functions -- such as Answer Relevance and Context Relevance -- and records latency and cost on a live leaderboard so you can compare index configurations scientifically.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'p',
            text: 'This guide builds a retrieval-augmented generation (RAG) app on Iceberg Database with LangChain, evaluates it with TruLens, and compares `cosine` vs `euclidean` index configurations.',
          },
          {
            type: 'steps',
            items: [
              {
                id: 'tru-step-1',
                title: 'Set up the environment',
                blocks: [
                  {
                    type: 'p',
                    text: 'Install `trulens`, `langchain-openai`, and `icebergdb`, and ensure `ICEBERG_API_KEY` and `OPENAI_API_KEY` are set in your environment:',
                  },
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `pip install -qU trulens trulens-apps-langchain trulens-providers-openai langchain-openai icebergdb numpy`,
                  },
                ],
              },
              {
                id: 'tru-step-2',
                title: 'Create the Cosine collection',
                blocks: [
                  {
                    type: 'p',
                    text: 'Create an initial `1536`-dimension `cosine` collection (`langchain-rag-cosine`) and index factual passages:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import os
from iceberg import Client
from iceberg.integrations import IcebergLangChainVectorStore
from langchain_openai import OpenAIEmbeddings

ib = Client(api_key=os.environ["ICEBERG_API_KEY"], source_tag="trulens")
embed = OpenAIEmbeddings(model="text-embedding-3-small")

passages = [
    "Washington, D.C. is a federal district and is not part of any US state.",
    "Hawaii's state song 'Hawaii Ponoi' was written in 1874 by King Kalakaua.",
    "Mumbai (ap-south-1) hosts Iceberg serverless HNSW and Okapi BM25 collections.",
]

index_name_v1 = "langchain-rag-cosine"
vectorstore = IcebergLangChainVectorStore.from_texts(
    texts=passages,
    embedding=embed,
    collection_name=index_name_v1,
    dimension=1536,
    metric="cosine",
)`,
                  },
                ],
              },
              {
                id: 'tru-step-3',
                title: 'Build the RAG chain',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

retriever = vectorstore.as_retriever(k=2)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
prompt = ChatPromptTemplate.from_template("Use the context to answer:\\n{context}\\n\\nQuestion: {question}")
format_docs = lambda docs: "\\n\\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)`,
                  },
                ],
              },
              {
                id: 'tru-step-4',
                title: 'Define feedback functions',
                blocks: [
                  { type: 'p', text: 'Feedback functions score each request from `0` to `1`. This guide configures two:' },
                  {
                    type: 'bullets',
                    items: [
                      '**Context relevance** -- average relevance (`0` to `1`) of each retrieved Iceberg chunk.',
                      '**Answer relevance** -- relevance (`0` to `1`) of the final LLM response to the input question.',
                    ],
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import numpy as np
from trulens.apps.langchain import TruChain
from trulens.core import Metric, Selector, TruSession
from trulens.providers.openai import OpenAI

session = TruSession()
provider = OpenAI(model_engine="gpt-4o-mini")

f_answer_relevance = Metric(
    implementation=provider.relevance,
    name="Answer Relevance",
    selectors={
        "prompt": Selector.select_record_input(),
        "response": Selector.select_record_output(),
    },
)

f_context_relevance = Metric(
    implementation=provider.context_relevance,
    name="Context Relevance",
    selectors={
        "question": Selector.select_record_input(),
        "context": Selector.select_context(collect_list=False),
    },
    agg=np.mean,
)`,
                  },
                  {
                    type: 'p',
                    text: 'Selectors tell TruLens which parts of a trace to score: `select_record_input()` and `select_record_output()` capture the prompt and final answer, while `select_context(collect_list=False)` scores each retrieved Iceberg chunk individually before `agg=np.mean` averages them.',
                  },
                ],
              },
              {
                id: 'tru-step-5',
                title: 'Record queries',
                blocks: [
                  {
                    type: 'p',
                    text: 'Wrap the chain with `TruChain` (`Chain1`) and run benchmark questions inside the recording context:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `truchain_v1 = TruChain(
    rag_chain,
    app_name="WikipediaQA",
    app_version="Chain1",
    feedbacks=[f_answer_relevance, f_context_relevance],
)

with truchain_v1 as recording:
    rag_chain.invoke("Which state is Washington D.C. in?")
    rag_chain.invoke("Which year was Hawaii's state song written?")

record_ids = [r.record_id for r in recording.records]
print(truchain_v1.retrieve_feedback_results(record_ids=record_ids))
print(session.get_leaderboard())`,
                  },
                ],
              },
              {
                id: 'tru-step-6',
                title: 'Compare configurations',
                blocks: [
                  {
                    type: 'p',
                    text: 'Create a second `1536d` collection using `metric="euclidean"` (`langchain-rag-euclidean`), adjust `k=1` on the retriever, and record `Chain2` to compare scores and latency side-by-side:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `index_name_v2 = "langchain-rag-euclidean"
vectorstore_v2 = IcebergLangChainVectorStore.from_texts(
    texts=passages,
    embedding=embed,
    collection_name=index_name_v2,
    dimension=1536,
    metric="euclidean",
)
retriever_v2 = vectorstore_v2.as_retriever(k=1)

rag_chain_v2 = (
    {"context": retriever_v2 | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

truchain_v2 = TruChain(
    rag_chain_v2,
    app_name="WikipediaQA",
    app_version="Chain2",
    feedbacks=[f_answer_relevance, f_context_relevance],
)

with truchain_v2 as recording:
    rag_chain_v2.invoke("Which state is Washington D.C. in?")
    rag_chain_v2.invoke("Which year was Hawaii's state song written?")

print(session.get_leaderboard())`,
                  },
                ],
              },
              {
                id: 'tru-step-7',
                title: 'Clean up',
                blocks: [
                  { type: 'p', text: "When you're finished evaluating, delete both test collections:" },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `ib.delete_collection(index_name_v1)
ib.delete_collection(index_name_v2)`,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 7. BUILD AN INTEGRATION (3 PARTNER SYSTEM PAGES -- FULL 30-SS FIDELITY)
  // =========================================================================
  {
    slug: 'integration-ecosystem',
    name: 'Integration ecosystem',
    category: 'build-an-integration',
    shortDesc: 'Learn how to build an Iceberg integration with the public SDKs and API, and how to apply for official listing.',
    summary: 'Learn how to build an Iceberg integration with the public SDKs and API, and how to apply to have it listed on the Iceberg integrations page.',
    intro: [
      "Anyone can use the [Iceberg SDKs](/product/sdk) or the [Iceberg API](/docs) to build a native Iceberg integration. You're free to build and launch an integration to support your users.",
      'Listings on the [Integrations overview](/integrations) are curated. We prioritize applications from integrations that are actively used by mutual customers. If you think your integration qualifies for official partner support, fill out the [application form](#partner-application-form).',
    ],
    cta: null,
    sections: [
      {
        id: 'more-info',
        title: 'More info',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[Attribute usage to your integration](/integrations/attribute-usage)',
              '[Connect your users to Iceberg](/integrations/connect-users)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'attribute-usage',
    name: 'Attribute usage to your integration',
    category: 'build-an-integration',
    shortDesc: 'Learn how to set a source tag in the Iceberg SDKs or the API User-Agent header to attribute traffic.',
    summary: 'Learn how to set a source tag in the Iceberg SDKs or the API User-Agent header so that usage from your integration is attributed to it.',
    intro: [
      'After you create your integration, specify a source tag when you create a client with an Iceberg SDK. If you call the API directly, pass the source tag in the `User-Agent` header.',
    ],
    cta: null,
    sections: [
      {
        id: 'attr-partner-callout',
        noToc: true,
        blocks: [
          {
            type: 'callout',
            variant: 'info',
            text: 'Anyone can create an integration. To apply to become an official Iceberg partner, see [Integration ecosystem](/integrations/integration-ecosystem).',
          },
        ],
      },
      {
        id: 'source-tag-naming-conventions',
        title: 'Source tag naming conventions',
        blocks: [
          { type: 'p', text: 'Your source tag must follow these conventions:' },
          {
            type: 'bullets',
            items: [
              'Clearly identify your integration.',
              'Use only lowercase letters, numbers, underscores, and colons.',
            ],
          },
          {
            type: 'p',
            text: 'For example, for an integration called "New Framework", `"new_framework"` is valid, but `"new framework"` and `"New_framework"` aren\'t.',
          },
        ],
      },
      {
        id: 'specify-a-source-tag',
        title: 'Specify a source tag',
        blocks: [
          { type: 'p', text: 'Source tags require these minimum SDK versions:' },
          {
            type: 'table',
            headers: ['Iceberg SDK', 'Required version'],
            rows: [
              ['[Python](/docs?section=python)', 'v1.0.0+'],
              ['[Node.js](/docs?section=javascript)', 'v1.0.0+'],
              ['[Java](/docs?section=java)', 'v1.0.0+'],
              ['[Go](/docs?section=go)', 'v1.0.0+'],
              ['[Rust](/docs?section=rust)', 'v1.0.0+'],
              ['[.NET](/docs?section=dotnet)', 'v1.0.0+'],
            ],
          },
          {
            type: 'p',
            text: 'Pass the source tag when you create the client, or in the `User-Agent` header with curl:',
          },
          {
            type: 'codeTabs',
            tabs: [
              {
                label: 'Python',
                lang: 'python',
                code: `# REST client
from iceberg import Iceberg

ib = Iceberg(
    api_key="YOUR_API_KEY",
    source_tag="YOUR_SOURCE_TAG"
)

# gRPC client
from iceberg.grpc import IcebergGRPC

ib = IcebergGRPC(
    api_key="YOUR_API_KEY",
    source_tag="YOUR_SOURCE_TAG"
)`,
              },
              {
                label: 'JavaScript',
                lang: 'javascript',
                code: `import { Iceberg } from 'icebergdb';

const ib = new Iceberg({
    apiKey: 'YOUR_API_KEY',
    sourceTag: 'YOUR_SOURCE_TAG'
});`,
              },
              {
                label: 'Java',
                lang: 'java',
                code: `import in.iceberg.Iceberg;

public class IntegrationExample {
    public static void main(String[] args) {
        Iceberg ib = new Iceberg.Builder("YOUR_API_KEY")
                .withSourceTag("YOUR_SOURCE_TAG")
                .build();
    }
}`,
              },
              {
                label: 'Go',
                lang: 'go',
                code: `import iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"

client, err := iceberg.NewClient(iceberg.NewClientParams{
    ApiKey:    "YOUR_API_KEY",
    SourceTag: "YOUR_SOURCE_TAG",
})`,
              },
              {
                label: 'Rust',
                lang: 'rust',
                code: `use icebergdb::Iceberg;

let ib = Iceberg::new("YOUR_API_KEY")
    .with_source_tag("YOUR_SOURCE_TAG");`,
              },
              {
                label: '.NET',
                lang: 'csharp',
                code: `using Iceberg;

var ib = new IcebergClient(
    apiKey: "YOUR_API_KEY",
    sourceTag: "YOUR_SOURCE_TAG"
);`,
              },
              {
                label: 'curl',
                lang: 'bash',
                code: `curl -i -X GET "https://api.icebergdb.in/collections" \\
  -H "Accept: application/json" \\
  -H "Api-Key: YOUR_API_KEY" \\
  -H "User-Agent: source_tag=YOUR_SOURCE_TAG" \\
  -H "X-Iceberg-Api-Version: 2026-07"`,
              },
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'connect-users',
    name: 'Connect your users to Iceberg',
    category: 'build-an-integration',
    shortDesc: 'Embed a Connect to Iceberg flow in your app or notebook so users can sign in and generate an API key.',
    summary: 'Embed a Connect to Iceberg flow in your app or notebook so users can sign in, choose a project, and receive an API key without leaving your integration.',
    intro: [
      'Add a **Connect to Iceberg** flow to your app, website, or [Colab](#connect-widget-colab) notebook so your users can get an Iceberg API key without leaving your integration. In the flow, users sign up for or log in to Iceberg, select or create an organization and project, and generate an API key. The API key is then shown to the user to copy, or sent directly to your page, app, or notebook.',
      'You can add the flow in two ways:',
    ],
    topBullets: [
      '[Add a Connect popup](#add-a-connect-popup) that opens from your own button or link.',
      '[Embed the Connect widget](#embed-the-connect-widget), a drop-in component with the same functionality.',
    ],
    introAfterBullets: [
      'Both require an integration ID, so start by [creating one](#create-an-integration-id).',
    ],
    cta: null,
    sections: [
      {
        id: 'conn-owner-callout',
        noToc: true,
        blocks: [
          {
            type: 'callout',
            variant: 'info',
            text: 'Only [organization owners](https://dashboard.icebergdb.in/settings?tab=access) can add or manage integrations.',
          },
        ],
      },
      {
        id: 'create-an-integration-id',
        title: 'Create an integration ID',
        blocks: [
          {
            type: 'p',
            text: 'Create a unique `integrationId` to use with the **Connect to Iceberg** popup and widget:',
          },
          {
            type: 'steps',
            noToc: true,
            items: [
              {
                id: 'conn-id-step-1',
                title: 'Open the Integrations tab',
                blocks: [
                  {
                    type: 'p',
                    text: 'On the [Integrations](https://dashboard.icebergdb.in/integrations) tab in the Iceberg console, click **Create Integration**.',
                  },
                  {
                    type: 'callout',
                    variant: 'info',
                    text: "The **Integrations** tab doesn't appear until your organization has an integration. To create your first one, go to the [Create integration](https://dashboard.icebergdb.in/integrations/create) form directly.",
                  },
                ],
              },
              {
                id: 'conn-id-step-2',
                title: 'Fill out the form',
                blocks: [
                  {
                    type: 'p',
                    text: 'In the **Create integration** form, fill out these fields:',
                  },
                  {
                    type: 'bullets',
                    items: [
                      '**Integration name:** A name for your integration.',
                      "**URL Slug:** Your `integrationId`. Enter a human-readable string that uniquely identifies your integration and that may appear in URLs. The URL slug is public and can't be changed.",
                      '**Logo:** A logo for your integration.',
                      {
                        text: '**Return mechanism:** How the generated API key is returned:',
                        subItems: [
                          '**Web Message:** Your application receives the API key through a web message, and only the allowed origins you list below receive it. Select this option if you use the [`icebergdb` library](https://www.npmjs.com/package/icebergdb).',
                          '**Copy/Paste:** The API key appears in the success message, and users copy and paste it into your application.',
                        ],
                      },
                      '**Allowed origin:** If you selected **Web Message**, list the URL origins where your integration is hosted. An [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) is the part of a URL that specifies the protocol, hostname, and port.',
                    ],
                  },
                ],
              },
              {
                id: 'conn-id-step-3',
                title: 'Create the integration',
                blocks: [
                  {
                    type: 'p',
                    text: 'Click **Create**.',
                  },
                ],
              },
            ],
          },
          {
            type: 'p',
            text: 'After you create your integration, [attribute usage to your integration](/integrations/attribute-usage).',
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Anyone can create an integration. To apply to become an official Iceberg partner, see [Integration ecosystem](/integrations/integration-ecosystem).',
          },
        ],
      },
      {
        id: 'add-a-connect-popup',
        title: 'Add a Connect popup',
        blocks: [
          {
            type: 'p',
            text: "After you [create your](#create-an-integration-id) `integrationId`, you can open the **Connect to Iceberg** popup from your own button or link. You can use the JavaScript library or the script. The library is the most common method. Use the script when you can't build with a custom library, such as in a content management system (CMS).",
          },
          {
            type: 'steps',
            noToc: true,
            items: [
              {
                id: 'popup-step-1',
                title: 'Load the library or script',
                blocks: [
                  {
                    type: 'p',
                    text: "Install the [`icebergdb` library](https://www.npmjs.com/package/icebergdb), or load the script in your page's `<head>`:",
                  },
                  {
                    type: 'codeTabs',
                    tabs: [
                      {
                        label: 'JavaScript library',
                        lang: 'bash',
                        code: `npm i -S icebergdb`,
                      },
                      {
                        label: 'JavaScript script',
                        lang: 'html',
                        code: `<script src="https://dashboard.icebergdb.in/embed.js"></script>`,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'popup-step-2',
                title: 'Create the popup',
                blocks: [
                  {
                    type: 'p',
                    text: 'Call the `ConnectPopup` function. It takes one required configuration option:',
                  },
                  {
                    type: 'bullets',
                    items: [
                      "`integrationId`: The URL slug of your integration. If you don't pass `integrationId`, the popup doesn't render.",
                    ],
                  },
                  {
                    type: 'p',
                    text: 'When the user completes the flow, the `onConnect` callback receives the API key. The function returns an object with an `open` function that opens the popup.',
                  },
                  {
                    type: 'codeTabs',
                    tabs: [
                      {
                        label: 'JavaScript library',
                        lang: 'javascript',
                        code: `import { ConnectPopup } from 'icebergdb'

const popup = ConnectPopup({
  onConnect: (key) => console.log("API Key:", key),
  integrationId: 'myApp'
});`,
                      },
                      {
                        label: 'JavaScript script',
                        lang: 'html',
                        code: `<script>
  const icebergPopup = ConnectPopup({
    onConnect: (key) => console.log("API Key:", key),
    integrationId: 'myApp'
  });
</script>`,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'popup-step-3',
                title: 'Open the popup from your button or link',
                blocks: [
                  {
                    type: 'p',
                    text: 'Call `open` when the user clicks your button or link:',
                  },
                  {
                    type: 'codeTabs',
                    tabs: [
                      {
                        label: 'JavaScript library',
                        lang: 'javascript',
                        code: `document.getElementById('connectButton').addEventListener('click', () => {
  popup.open();
});`,
                      },
                      {
                        label: 'JavaScript script',
                        lang: 'html',
                        code: `<button onclick="icebergPopup.open()">Connect to Iceberg</button>`,
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
        id: 'embed-the-connect-widget',
        title: 'Embed the Connect widget',
        blocks: [
          {
            type: 'p',
            text: 'The **Connect** widget is a drop-in component with the same functionality as the popup. After you [create your `integrationId`](#create-an-integration-id), you can embed it in two ways:',
          },
          {
            type: 'bullets',
            items: [
              'Use the [JavaScript](#connect-widget-javascript) library (`icebergdb`) or script to render the widget in apps and websites.',
              'Use the [Colab](#connect-widget-colab) library (`icebergdb`) to render the widget in Colab notebooks with Python.',
            ],
          },
          { type: 'h3', id: 'connect-widget-javascript', title: 'JavaScript' },
          {
            type: 'p',
            text: "To embed the widget in your app or website, use the [`icebergdb` library](https://www.npmjs.com/package/icebergdb) or, if you can't use the library, the script.",
          },
          {
            type: 'steps',
            noToc: true,
            items: [
              {
                id: 'widget-js-step-1',
                title: 'Load the library or script',
                blocks: [
                  {
                    type: 'p',
                    text: "Install the library, or load the script in your page's `<head>`:",
                  },
                  {
                    type: 'codeTabs',
                    tabs: [
                      {
                        label: 'JavaScript library',
                        lang: 'bash',
                        code: `npm i -S icebergdb`,
                      },
                      {
                        label: 'JavaScript script',
                        lang: 'html',
                        code: `<script src="https://dashboard.icebergdb.in/embed.js"></script>`,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'widget-js-step-2',
                title: 'Add a container for the widget',
                blocks: [
                  {
                    type: 'p',
                    text: 'Add the HTML element where the widget renders:',
                  },
                  {
                    type: 'code',
                    lang: 'html',
                    label: 'HTML',
                    code: `<div id="connect-widget"></div>`,
                  },
                ],
              },
              {
                id: 'widget-js-step-3',
                title: 'Render the widget',
                blocks: [
                  {
                    type: 'p',
                    text: 'Call the `connectToIceberg` function. It takes two required configuration options:',
                  },
                  {
                    type: 'bullets',
                    items: [
                      "`integrationId`: The URL slug of your integration. If you don't pass `integrationId`, the widget doesn't render.",
                      '`container`: The HTML element where the widget renders.',
                    ],
                  },
                  {
                    type: 'p',
                    text: 'When the user completes the flow, the function calls your callback with the Iceberg API key. If you use the script, place the inline `<script>` in the page body after the container element, so the container exists when `connectToIceberg` runs.',
                  },
                  {
                    type: 'codeTabs',
                    tabs: [
                      {
                        label: 'JavaScript library',
                        lang: 'javascript',
                        code: `import { connectToIceberg } from 'icebergdb'

const setupIceberg = (apiKey) => { /* Set up an Iceberg client using the API key */ }

connectToIceberg(
  setupIceberg,
  {
    integrationId: 'myApp',
    container: document.getElementById('connect-widget')
  }
)`,
                      },
                      {
                        label: 'JavaScript script',
                        lang: 'html',
                        code: `<script>
  connectToIceberg(
    (apiKey) => { /* Set up an Iceberg client using the API key */ },
    {
      integrationId: 'myApp',
      container: document.getElementById('connect-widget'),
    }
  );
</script>`,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { type: 'h3', id: 'connect-widget-colab', title: 'Colab' },
          {
            type: 'p',
            text: 'To embed the widget in a Colab notebook, use the [`icebergdb` Python library](https://pypi.org/project/icebergdb/).',
          },
          {
            type: 'steps',
            noToc: true,
            items: [
              {
                id: 'widget-colab-step-1',
                title: 'Install the libraries',
                blocks: [
                  {
                    type: 'code',
                    noHeader: true,
                    code: `pip install -qU icebergdb`,
                  },
                ],
              },
              {
                id: 'widget-colab-step-2',
                title: 'Render the widget',
                blocks: [
                  {
                    type: 'p',
                    text: 'Call `Authenticate` to render the widget, so the user can log in and generate an API key:',
                  },
                  {
                    type: 'code',
                    noHeader: true,
                    code: `from iceberg.colab import Authenticate

Authenticate()`,
                  },
                ],
              },
              {
                id: 'widget-colab-step-3',
                title: 'Use the API key',
                blocks: [
                  {
                    type: 'p',
                    text: 'After the user completes the flow, the API key is available in the `ICEBERG_API_KEY` environment variable. Use it to initialize the Iceberg client:',
                  },
                  {
                    type: 'code',
                    noHeader: true,
                    code: `import os
from iceberg.grpc import IcebergGRPC as Iceberg

ib = Iceberg(api_key=os.environ.get('ICEBERG_API_KEY'))`,
                  },
                ],
              },
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'To see this flow in practice, open the [example notebook](/notebooks/connect_to_iceberg.ipynb).',
          },
        ],
      },
      {
        id: 'manage-generated-api-keys',
        title: 'Manage generated API keys',
        blocks: [
          {
            type: 'p',
            text: 'Your users can [manage the API keys](https://dashboard.icebergdb.in/apikeys) generated by your integration in the Iceberg console.',
          },
        ],
      },
    ],
  },
]

const RAW_COMBINED = [
  ...AI_AND_DATA_SOURCES,
  ...FRAMEWORKS_INTEGRATIONS,
  ...INFRA_MODELS_OBS_BUILD,
]

export const ALL_INTEGRATIONS = INTEGRATION_CATEGORIES.flatMap(cat =>
  RAW_COMBINED.filter(item => item.category === cat.id)
)

// Clean URL slug aliases matching every URL pattern across screenshots
export const SLUG_ALIASES = {
  voyage: 'voyage-ai',
  cloudera: 'cloudera-ai',
  flowiseai: 'flowise',
  'instill-ai': 'instill',
  'aws-marketplace': 'aws',
  'google-cloud-marketplace': 'google-cloud',
  'microsoft-marketplace': 'microsoft-azure',
  'attribute-usage-to-your-integration': 'attribute-usage',
  'connect-your-users-to-iceberg': 'connect-users',
}

export { INTEGRATION_CATEGORIES }

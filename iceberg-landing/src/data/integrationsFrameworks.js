// Iceberg DB v1.0.0 -- Integrations Data Module 2
// Category: Frameworks (14 pages -- Full Guides for LangChain, LlamaIndex, Haystack, Amazon Bedrock, n8n, OpenClaw/CrewAI + Partner Pages)

export const FRAMEWORKS_INTEGRATIONS = [
  {
    slug: 'ai-engine',
    name: 'AI Engine',
    category: 'frameworks',
    shortDesc: 'Create chatbots, generate content, build AI forms, and automate tasks with Iceberg.',
    summary: 'Connect AI Engine and autonomous function-calling agents to Iceberg to power grounded chatbots, semantic search, and persistent 4-tier memory.',
    intro: [
      'AI Engine makes it straightforward to embed conversational assistants, content copilot workflows, and tool-calling agents directly into web portals and CMS dashboards.',
      'Connecting AI Engine custom REST/webhook endpoints or Python backends to `https://api.icebergdb.in` gives your site assistant sub-15ms domestic hybrid search (`POST /search`) across product catalogs and articles.',
      'Unlike stateless vector indexes, you can also enable Iceberg 4-Tier Memory (`POST /memory/{agent_id}/remember`) so returning visitors get personalized, context-aware answers.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'amazon-bedrock',
    name: 'Amazon Bedrock',
    category: 'frameworks',
    shortDesc: 'Integrate your enterprise data into Amazon Bedrock in ap-south-1 using Iceberg to build GenAI applications.',
    summary: 'Use Iceberg as the vector retrieval layer for Amazon Bedrock (`ap-south-1` Mumbai) Titan Embeddings and Claude agents to ship low-latency, DPDP-compliant GenAI on AWS.',
    intro: [
      'You can pair [Amazon Bedrock](https://aws.amazon.com/bedrock/), a fully managed foundation model service from AWS, directly with Iceberg (`ap-south-1`) for enterprise GenAI applications.',
      'Iceberg Database helps companies eliminate hallucinations and US cross-border latency by keeping S3 documents, Amazon Titan Text Embeddings v2 (`1024d`), HNSW vector search, and Claude completions inside Mumbai (`ap-south-1`):',
    ],
    topBullets: [
      'Zero cross-border data transfer -- 100% India data residency for RBI and DPDP Act 2023 compliance.',
      'Native `1024`-dimension Cosine & DotProduct collections matched to `amazon.titan-embed-text-v2:0`.',
      'Sub-15ms domestic vector retrieval plus optional Okapi BM25 hybrid RRF scoring.',
    ],
    cta: { label: 'Try free on ap-south-1', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [
      {
        id: 'agents-for-amazon-bedrock',
        title: 'Agents for Amazon Bedrock',
        blocks: [
          {
            type: 'p',
            text: 'Agents for Amazon Bedrock orchestrate multi-step tasks by breaking down user requests, querying enterprise vector stores for grounded context, and invoking Lambda action groups.',
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'The foundation model used for generating embeddings (`amazon.titan-embed-text-v2:0`, `1024d`) is independent of the generation LLM (`anthropic.claude-3-5-sonnet` or `meta.llama3`), allowing you to upgrade LLMs without re-indexing your Iceberg collection.',
          },
        ],
      },
      {
        id: 'knowledge-bases-for-amazon-bedrock',
        title: 'Knowledge Bases & Iceberg Architecture',
        blocks: [
          {
            type: 'p',
            text: 'Documents stored in Amazon S3 (`ap-south-1`) are chunked, embedded via Bedrock Titan v2 (`1024d`), and indexed in Iceberg. At query time, your Bedrock Agent or RAG service embeds the user prompt and retrieves top-scoring chunks from Iceberg:',
          },
          {
            type: 'diagram',
            variant: 'bedrock',
          },
        ],
      },
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'bedrock-step-1',
                title: 'Create a 1024d Iceberg collection',
                blocks: [
                  {
                    type: 'p',
                    text: 'Create an Iceberg collection configured for `amazon.titan-embed-text-v2:0` (`dimension=1024`, `metric="cosine"`) via the [Iceberg Console](https://dashboard.icebergdb.in) or Python SDK:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from iceberg import Client

ib = Client(api_key="ib_your_api_key", source_tag="amazon-bedrock")
ib.create_collection("bedrock_kb_1024", dimension=1024, metric="cosine")`,
                  },
                  {
                    type: 'callout',
                    variant: 'info',
                    text: 'Your Iceberg collection `dimension` (`1024` or `512` / `256` for Matryoshka Titan v2) must match the `dimensions` parameter passed to `bedrock-runtime`.',
                  },
                ],
              },
              {
                id: 'bedrock-step-2',
                title: 'Set up your AWS credentials & S3 source',
                blocks: [
                  { type: 'h4', id: 'bedrock-set-up-secrets', title: 'Set up secrets in AWS Secrets Manager' },
                  {
                    type: 'orderedList',
                    items: [
                      'Open **AWS Secrets Manager** in region `ap-south-1` (Asia Pacific Mumbai) and click **Store a new secret**.',
                      'Select **Other type of secret** and add key `apiKey` with your `ib_...` Iceberg API key.',
                      'Name the secret `prod/icebergdb/apiKey` and copy its ARN for your Lambda / ECS IAM role.',
                    ],
                  },
                  { type: 'h4', id: 'bedrock-set-up-s3', title: 'Set up S3 bucket' },
                  {
                    type: 'orderedList',
                    items: [
                      'Create an S3 bucket in `ap-south-1` (for example `s3://acme-genai-kb-mumbai`).',
                      'Upload your enterprise `.pdf`, `.md`, or `.txt` policy files into the bucket.',
                    ],
                  },
                ],
              },
              {
                id: 'bedrock-step-3',
                title: 'Embed S3 documents with Titan v2 and upsert to Iceberg',
                blocks: [
                  {
                    type: 'p',
                    text: 'Invoke `amazon.titan-embed-text-v2:0` via `boto3` and batch-upsert `1024d` vectors into Iceberg:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import json, boto3

bedrock = boto3.client("bedrock-runtime", region_name="ap-south-1")

def titan_embed(text: str) -> list[float]:
    res = bedrock.invoke_model(
        modelId="amazon.titan-embed-text-v2:0",
        body=json.dumps({"inputText": text, "dimensions": 1024, "normalize": True}),
    )
    return json.loads(res["body"].read())["embedding"]

chunks = [
    {"id": "pol-01", "text": "RBI digital lending norms require all customer data to reside on servers in India."},
    {"id": "pol-02", "text": "Loan settlement confirmations are dispatched within 24 hours via registered email."},
]

ib.upsert_vectors(
    "bedrock_kb_1024",
    [{"id": c["id"], "values": titan_embed(c["text"]), "text": c["text"], "metadata": {"source": "s3"}} for c in chunks],
    namespace="compliance",
)`,
                  },
                ],
              },
              {
                id: 'bedrock-step-4',
                title: 'Retrieve grounded context and invoke Claude on Bedrock',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `question = "Where must digital lending customer data be stored?"
q_vec = titan_embed(question)

hits = ib.query_vectors("bedrock_kb_1024", vector=q_vec, top_k=3, namespace="compliance")
context = "\\n".join(m["text"] for m in hits["matches"])

converse_res = bedrock.converse(
    modelId="apac.anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": [{"text": f"Context:\\n{context}\\n\\nQuestion: {question}"}]}],
)
print(converse_res["output"]["message"]["content"][0]["text"])`,
                  },
                  {
                    type: 'response',
                    code: `Under RBI digital lending norms, all customer data must reside on servers located in India.`,
                  },
                ],
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
              '[Deploy Iceberg BYOC inside AWS ap-south-1 VPC](/integrations/aws)',
              '[Security & DPDP Act 2023 Compliance Architecture](/security)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'amazon-sagemaker',
    name: 'Amazon SageMaker',
    category: 'frameworks',
    shortDesc: 'Integrate machine learning models with a fully managed service for deployment and scaling.',
    summary: 'Combine Amazon SageMaker JumpStart and custom Hugging Face DLC endpoints with Iceberg for scalable RAG and domain-specific vector search.',
    intro: [
      'Amazon SageMaker enables ML teams to fine-tune, host, and autoscale custom domain encoders and open-weights LLMs inside AWS (`ap-south-1`).',
      'Pair custom `768d` or `1024d` embeddings served from SageMaker real-time or serverless endpoints with Iceberg multi-dimension HNSW collections to eliminate vector index ops.',
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
              '[Multi-Dimension Raw Vector API (`POST /vectors/upsert`)](https://api.icebergdb.in/docs)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'cloudera-ai',
    name: 'Cloudera AI',
    category: 'frameworks',
    shortDesc: 'Build vector embedding, RAG, and semantic search applications at scale with Cloudera AI.',
    summary: 'Integrate Cloudera AI Workbenches and Spark pipelines with Iceberg Cloud or private BYOC clusters to power governed enterprise RAG.',
    intro: [
      '[Cloudera AI](https://www.cloudera.com/products/machine-learning.html) (formerly Cloudera Machine Learning) provides governed enterprise AI Studios, Jupyter/Python workbenches, and distributed Spark execution.',
      'Connecting Cloudera AI pipelines to Iceberg lets regulated enterprises run high-throughput embedding jobs and query isolated vector namespaces with strict SHA-256 RBAC keys.',
      'For hybrid or air-gapped VPC mandates, deploy Iceberg BYOC (`iceberg-core-rs`) directly alongside your Cloudera environment.',
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
              '[Python SDK Quickstart (`pip install icebergdb`)](/docs) - Example of creating & indexing vectors in Iceberg',
              '[Self-Hosted BYOC Deployment Guide](/product/byoc) - Running Iceberg inside private enterprise VPCs',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'context-data',
    name: 'Context Data',
    category: 'frameworks',
    shortDesc: 'Create end-to-end data flows that connect data sources to Iceberg.',
    summary: 'Use Context Data with Iceberg to build no-code ingestion flows from PostgreSQL, S3, and Salesforce directly into Iceberg vector collections.',
    intro: [
      '[Context Data](https://contextdata.ai) is a data engineering orchestration platform designed for generative AI pipelines, automating connector syncs, chunking, and embedding generation.',
      'Configure Iceberg (`https://api.icebergdb.in/vectors/upsert`) as your destination store to continuously sync enterprise data sources into low-latency HNSW collections without custom cron jobs.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'genkit',
    name: 'Genkit',
    category: 'frameworks',
    shortDesc: 'Build AI-powered applications and agents with Genkit.',
    summary: 'Use the official `icebergdb` TypeScript SDK inside Firebase Genkit `defineRetriever` and `defineIndexer` flows for strongly-typed Node.js RAG.',
    intro: [
      '[Genkit](https://firebase.google.com/docs/genkit) is an open-source TypeScript AI framework from Google Firebase for building observable, type-safe AI workflows and tool-calling agents.',
      'Pair Genkit custom retrievers with `npm install icebergdb` (`v1.0.0`) to combine hybrid vector + BM25 search and 4-tier persistent agent memory in Next.js or Cloud Run backends.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'haystack',
    name: 'Haystack',
    category: 'frameworks',
    shortDesc: 'Implement an end-to-end search pipeline for efficient retrieval and question answering over large datasets.',
    summary: "Use deepset Haystack with Iceberg's official `IcebergHaystackDocumentStore` to build production NLP pipelines that index, embed, and query documents for question answering and RAG.",
    intro: [
      'Haystack is an open-source Python framework by deepset for building composable retrieval-augmented generation (RAG) pipelines, semantic search systems, and tool-using agents.',
      'The official `icebergdb` Python SDK (`v1.0.0`) ships `IcebergHaystackDocumentStore` out of the box -- supporting both zero-cost `384d` server-side embeddings and external `OpenAIDocumentEmbedder` (`1536d`) pipelines.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'p',
            text: 'Follow the steps below to build a complete question-answering pipeline using the [Haystack library](https://haystack.deepset.ai) and `IcebergHaystackDocumentStore`.',
          },
          {
            type: 'steps',
            items: [
              {
                id: 'hs-step-1',
                title: 'Install Haystack and Iceberg SDK',
                blocks: [
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `pip install -U "haystack-ai>=2.6.0" "icebergdb" datasets pandas`,
                  },
                ],
              },
              {
                id: 'hs-step-2',
                title: 'Set your API keys',
                blocks: [
                  {
                    type: 'p',
                    text: 'Set `ICEBERG_API_KEY` ([create a free account](https://dashboard.icebergdb.in/signup)) and `OPENAI_API_KEY` in your environment:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import os

os.environ["ICEBERG_API_KEY"] = "ib_your_api_key"
os.environ["OPENAI_API_KEY"] = "sk-your-openai-key"`,
                  },
                ],
              },
              {
                id: 'hs-step-3',
                title: 'Initialize IcebergHaystackDocumentStore',
                blocks: [
                  {
                    type: 'p',
                    text: 'Initialize `IcebergHaystackDocumentStore` with `dimension=1536` to match OpenAI `text-embedding-3-small` (or use `dimension=384` for free built-in CPU embeddings):',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from iceberg import Client
from iceberg.integrations import IcebergHaystackDocumentStore

ib = Client(api_key=os.environ["ICEBERG_API_KEY"], source_tag="haystack")
document_store = IcebergHaystackDocumentStore(
    client=ib,
    collection_name="haystack-qa",
    dimension=1536,
    metric="cosine",
    namespace="squad_dev",
)`,
                  },
                ],
              },
              {
                id: 'hs-step-4',
                title: 'Prepare data',
                blocks: [
                  { type: 'p', text: 'Load a deduplicated subset of the SQuAD encyclopedia passages:' },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from datasets import load_dataset

dataset = load_dataset("rajpurkar/squad", split="validation")
df = dataset.to_pandas()[["title", "context"]].drop_duplicates().head(25)
df.head(5)`,
                  },
                  {
                    type: 'table',
                    headers: ['#', 'title', 'context'],
                    rows: [
                      ['0', 'Super_Bowl_50', 'Super Bowl 50 was an American football game to determine the champion of the NFL for the 2015 season...'],
                      ['5', 'Super_Bowl_50', 'The American Football Conference (AFC) champion Denver Broncos defeated the Carolina Panthers 24-10...'],
                      ['10', 'Super_Bowl_50', 'The game was played on February 7, 2016, at Levi Stadium in the San Francisco Bay Area at Santa Clara...'],
                      ['15', 'Warsaw', 'Warsaw is the capital and largest city of Poland. The metropolis stands on the River Vistula...'],
                      ['20', 'Normans', 'The Normans were the people who in the 10th and 11th centuries gave their name to Normandy...'],
                    ],
                  },
                  {
                    type: 'p',
                    text: 'Convert each row into a Haystack `Document` format (`id`, `content`, `meta`):',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from haystack import Document

docs = [
    Document(id=f"squad_{i}", content=row["context"], meta={"title": row["title"]})
    for i, (_, row) in enumerate(df.iterrows())
]`,
                  },
                ],
              },
              {
                id: 'hs-step-5',
                title: 'Embed and upsert documents',
                blocks: [
                  {
                    type: 'p',
                    text: 'Embed the documents with `OpenAIDocumentEmbedder` (`text-embedding-3-small`) and write them to `IcebergHaystackDocumentStore`:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from haystack.components.embedders import OpenAIDocumentEmbedder

doc_embedder = OpenAIDocumentEmbedder(model="text-embedding-3-small")
embedded_docs = doc_embedder.run(documents=docs)["documents"]

written = document_store.write_documents([
    {"id": d.id, "content": d.content, "embedding": d.embedding, "meta": d.meta}
    for d in embedded_docs
])
print(f"Indexed {written} documents into Iceberg.")`,
                  },
                ],
              },
              {
                id: 'hs-step-6',
                title: 'Inspect collection stats',
                blocks: [
                  {
                    type: 'p',
                    text: 'Verify vector count and namespace statistics on the live Rust engine via `describe_collection_stats`:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `print(ib.describe_collection_stats("haystack-qa"))`,
                  },
                  {
                    type: 'response',
                    code: `{'name': 'haystack-qa', 'dimension': 1536, 'metric': 'cosine', 'vector_count': 25, 'namespaces': {'squad_dev': 25}}`,
                  },
                ],
              },
              {
                id: 'hs-step-7',
                title: 'Initialize a question-answering pipeline',
                blocks: [
                  { type: 'p', text: 'Combine query embedding, Iceberg retrieval, prompt building, and `gpt-4o-mini` generation:' },
                  {
                    type: 'bullets',
                    items: [
                      '`OpenAITextEmbedder` encodes the incoming user question into a `1536d` query vector.',
                      '`document_store.retrieve_by_embedding()` fetches the top matching passages from Iceberg.',
                      '`ChatPromptBuilder` injects retrieved passages into a grounded system prompt.',
                      '`OpenAIChatGenerator` (`gpt-4o-mini`) produces the final answer.',
                    ],
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from haystack.components.embedders import OpenAITextEmbedder
from haystack.components.builders import ChatPromptBuilder
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage

text_embedder = OpenAITextEmbedder(model="text-embedding-3-small")
prompt_builder = ChatPromptBuilder(template=[
    ChatMessage.from_user("Answer using ONLY the passages below:\\n{% for d in docs %}- {{ d.content }}\\n{% endfor %}\\nQuestion: {{ question }}")
])
llm = OpenAIChatGenerator(model="gpt-4o-mini")`,
                  },
                ],
              },
              {
                id: 'hs-step-8',
                title: 'Ask questions',
                blocks: [
                  { type: 'p', text: 'Define a helper `ask(question, top_k=3)` and run grounded queries:' },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `def ask(question: str, top_k: int = 3) -> str:
    q_vec = text_embedder.run(text=question)["embedding"]
    hits = document_store.retrieve_by_embedding(q_vec, top_k=top_k)
    msgs = prompt_builder.run(docs=hits, question=question)["prompt"]
    return llm.run(messages=msgs)["replies"][0].text

print(ask("Where and when was Super Bowl 50 played?"))`,
                  },
                  {
                    type: 'response',
                    code: `Super Bowl 50 was played on February 7, 2016, at Levi's Stadium in the San Francisco Bay Area at Santa Clara.`,
                  },
                ],
              },
              {
                id: 'hs-step-9',
                title: 'Clean up',
                blocks: [
                  { type: 'p', text: 'Delete the test collection when finished:' },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `ib.delete_collection("haystack-qa")`,
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
    slug: 'instill',
    name: 'Instill AI',
    category: 'frameworks',
    shortDesc: 'Build AI applications with a low-code, full-stack tool for data, model, and pipeline orchestration.',
    summary: 'Wire Iceberg into Instill Core pipelines to upsert vectors, run hybrid similarity queries, and power RAG agents and chatbots.',
    intro: [
      'The Iceberg integration with Instill Core adds low-latency vector upsert and hybrid search tasks to your visual AI pipelines.',
      'Provide your `ib_...` API key and `https://api.icebergdb.in` base URL in Instill Core to retrieve top-scoring passages with metadata and similarity scores for autonomous agents, chatbots, and multi-agent RAG workflows.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'langchain',
    name: 'LangChain',
    category: 'frameworks',
    shortDesc: 'Build LLM applications with LangChain, using Iceberg as the vector store.',
    summary: 'Use Iceberg with LangChain to build RAG apps, agents, and chatbots, and manage embeddings, vector stores, retrievers, and LCEL chains for LLM-powered search.',
    intro: [
      'LangChain provides composable modules for connecting large language models to external data sources. Its ecosystem simplifies the GenAI application lifecycle:',
    ],
    topBullets: [
      'Write production RAG pipelines in Python with `IcebergLangChainVectorStore` (bundled directly in `pip install icebergdb`).',
      'Use either built-in free `384d` server-side CPU embeddings (`embedding=None`) or external `OpenAIEmbeddings` / `CohereEmbeddings`.',
    ],
    introAfterBullets: [
      'By integrating Iceberg with LangChain, you ground LLMs on factual enterprise knowledge across autonomous agents, chatbots, and multi-tenant SaaS apps.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'p',
            text: 'This guide shows how to integrate Iceberg Database with [LangChain](https://python.langchain.com).',
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'This guide covers core vector store and LCEL RAG patterns. Also explore:',
            bullets: [
              '[4-Tier Agent Memory for Stateful LangGraph Agents](/product/memory)',
              '[Multi-Tenant Namespaces in Iceberg](/product/namespaces)',
              '[Evaluating LangChain RAG Pipelines with TruLens](/integrations/trulens)',
            ],
          },
        ],
      },
      {
        id: 'key-concepts',
        title: 'Key concepts',
        blocks: [
          {
            type: 'p',
            text: 'The `IcebergLangChainVectorStore` class inside `iceberg.integrations` wraps your Iceberg connection so it plugs into any LangChain `Retriever` or `Runnable` chain.',
          },
          { type: 'h3', id: 'lc-init-vector-store', title: 'Initialize a vector store' },
          {
            type: 'p',
            text: 'You can initialize `IcebergLangChainVectorStore` in two ways depending on whether your collection already contains records:',
          },
          {
            type: 'orderedList',
            items: [
              {
                text: 'Initialize against an existing Iceberg collection without adding new records:',
                code: {
                  lang: 'python',
                  label: 'Python',
                  code: `from iceberg import Client
from iceberg.integrations import IcebergLangChainVectorStore
from langchain_openai import OpenAIEmbeddings

ib = Client(api_key="ib_your_api_key", source_tag="langchain")
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vectorstore = IcebergLangChainVectorStore(
    client=ib,
    collection_name="langchain-kb",
    embedding=embeddings,
    dimension=1536,
    metric="cosine",
)`,
                },
              },
              {
                text: 'Initialize while indexing LangChain `Document` objects or raw strings (`from_documents` / `from_texts`):',
                code: {
                  lang: 'python',
                  label: 'Python',
                  code: `from langchain_core.documents import Document

docs = [
    Document(page_content="Iceberg DB runs in ap-south-1 Mumbai.", metadata={"source": "arch.md"}),
    Document(page_content="Hybrid RRF fuses HNSW cosine similarity with Okapi BM25.", metadata={"source": "search.md"}),
]

vectorstore = IcebergLangChainVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name="langchain-kb",
    dimension=1536,
    metric="cosine",
)`,
                },
              },
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            text: "If you see `Client has no attribute 'from_texts'`, make sure you call `IcebergLangChainVectorStore.from_texts(...)` from `iceberg.integrations` rather than calling it directly on `iceberg.Client`.",
          },

          { type: 'h3', id: 'lc-add-more-records', title: 'Add more records' },
          {
            type: 'p',
            text: 'Append additional documents or plain strings at any time with `add_documents` or `add_texts`:',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Python',
            code: `vectorstore.add_texts(
    texts=["Read-only RBAC keys return HTTP 403 on write or delete attempts."],
    metadatas=[{"source": "security.md"}],
)`,
          },

          { type: 'h3', id: 'lc-similarity-search', title: 'Perform a similarity search' },
          {
            type: 'p',
            text: 'Run `similarity_search` to retrieve LangChain `Document` objects, optionally passing MongoDB-style metadata `filter` expressions (`$eq`, `$in`, `$gte`):',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Python',
            code: `results = vectorstore.similarity_search(
    "Where is Iceberg hosted?",
    k=3,
    filter={"source": {"$eq": "arch.md"}},
)`,
          },

          { type: 'h3', id: 'lc-namespaces', title: 'Namespaces' },
          {
            type: 'p',
            text: 'Isolate tenants or environments inside one collection by passing `namespace` during initialization, indexing, or search:',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Python',
            code: `vs_tenant_a = IcebergLangChainVectorStore.from_texts(
    texts=["Tenant A enterprise SLA includes 99.90% uptime."],
    embedding=embeddings,
    collection_name="langchain-kb",
    namespace="tenant-a",
    dimension=1536,
)
hits = vs_tenant_a.similarity_search("What is our uptime SLA?", k=2)`,
          },
        ],
      },
      {
        id: 'tutorial',
        title: 'Tutorial',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                id: 'lc-tut-1',
                title: 'Set up the environment',
                blocks: [
                  { type: 'p', text: 'Install the official SDK and LangChain OpenAI packages:' },
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `pip install -qU icebergdb langchain-core langchain-openai datasets`,
                  },
                  { type: 'p', text: 'Export your Iceberg and OpenAI API keys:' },
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `export ICEBERG_API_KEY="ib_your_api_key"  # From dashboard.icebergdb.in
export OPENAI_API_KEY="sk-your-openai-key"`,
                  },
                ],
              },
              {
                id: 'lc-tut-2',
                title: 'Build the knowledge base',
                blocks: [
                  {
                    type: 'orderedList',
                    items: [
                      {
                        text: 'Prepare sample encyclopedia passages with source URLs:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `corpus = [
    {"id": "wiki-1", "text": "The Reserve Bank of India (RBI) was established on April 1, 1935 in Kolkata and moved to Mumbai in 1937.", "source": "https://en.wikipedia.org/wiki/Reserve_Bank_of_India"},
    {"id": "wiki-2", "text": "Unified Payments Interface (UPI) was launched by NPCI in April 2016 for instant inter-bank mobile transfers.", "source": "https://en.wikipedia.org/wiki/Unified_Payments_Interface"},
    {"id": "wiki-3", "text": "The Digital Personal Data Protection Act 2023 governs personal data processing in India.", "source": "https://en.wikipedia.org/wiki/DPDP_Act"},
]
len(corpus)`,
                        },
                        response: `3`,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'lc-tut-3',
                title: 'Index the data in Iceberg',
                blocks: [
                  {
                    type: 'orderedList',
                    items: [
                      {
                        text: 'Create a `1536`-dimension collection and inspect initial stats (`total_vector_count: 0`):',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `import os
from iceberg import Client

ib = Client(api_key=os.environ["ICEBERG_API_KEY"], source_tag="langchain")
collection_name = "langchain-rag-fast"
ib.create_collection(collection_name, dimension=1536, metric="cosine")
ib.describe_collection_stats(collection_name)`,
                        },
                        response: `{'name': 'langchain-rag-fast', 'dimension': 1536, 'namespaces': {}, 'vector_count': 0}`,
                      },
                      {
                        text: 'Embed and index the records via `IcebergLangChainVectorStore.from_texts`, then re-check stats:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `from langchain_openai import OpenAIEmbeddings
from iceberg.integrations import IcebergLangChainVectorStore

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = IcebergLangChainVectorStore.from_texts(
    texts=[r["text"] for r in corpus],
    metadatas=[{"source": r["source"]} for r in corpus],
    ids=[r["id"] for r in corpus],
    embedding=embeddings,
    collection_name=collection_name,
    dimension=1536,
)
ib.describe_collection_stats(collection_name)`,
                        },
                        response: `{'name': 'langchain-rag-fast', 'dimension': 1536, 'namespaces': {'': 3}, 'vector_count': 3}`,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'lc-tut-4',
                title: 'Query the LangChain vector store directly',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `query = "When did NPCI launch UPI?"
vectorstore.similarity_search(query, k=2)`,
                  },
                  {
                    type: 'response',
                    code: `[Document(metadata={'source': 'https://en.wikipedia.org/wiki/Unified_Payments_Interface'}, page_content='Unified Payments Interface (UPI) was launched by NPCI in April 2016 for instant inter-bank mobile transfers.')]`,
                  },
                ],
              },
              {
                id: 'lc-tut-5',
                title: 'Use Iceberg and LangChain for RAG with citations',
                blocks: [
                  {
                    type: 'orderedList',
                    items: [
                      {
                        text: 'Build an LCEL RAG chain that retrieves context from Iceberg and answers with `gpt-4o-mini`:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
retriever = vectorstore.as_retriever(k=2)
prompt = ChatPromptTemplate.from_template("Answer based only on context:\\n{context}\\n\\nQuestion: {question}")
format_docs = lambda docs: "\\n\\n".join(d.page_content for d in docs)

rag_chain = ({"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt | llm | StrOutputParser())
rag_chain.invoke(query)`,
                        },
                        response: `'NPCI launched the Unified Payments Interface (UPI) in April 2016.'`,
                      },
                      {
                        text: 'Return cited `sources` alongside `answer` using `RunnableParallel`:',
                        code: {
                          lang: 'python',
                          label: 'Python',
                          code: `rag_with_sources = RunnableParallel({"docs": retriever, "question": RunnablePassthrough()}).assign(
    answer=lambda x: (prompt | llm | StrOutputParser()).invoke({"context": format_docs(x["docs"]), "question": x["question"]}),
    sources=lambda x: [d.metadata.get("source") for d in x["docs"]],
)
res = rag_with_sources.invoke(query)
{"question": res["question"], "answer": res["answer"], "sources": res["sources"]}`,
                        },
                        response: `{'question': 'When did NPCI launch UPI?', 'answer': 'NPCI launched UPI in April 2016.', 'sources': ['https://en.wikipedia.org/wiki/Unified_Payments_Interface']}`,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'lc-tut-6',
                title: 'Clean up',
                blocks: [
                  { type: 'p', text: 'When you no longer need the test collection, delete it with `delete_collection`:' },
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
      {
        id: 'resources',
        title: 'Resources',
        blocks: [
          {
            type: 'bullets',
            items: [
              '[LangChain Python Documentation](https://python.langchain.com)',
              '[Iceberg Python SDK Source (`integrations.py`)](https://github.com/anku5265/iceberg-database/tree/main/iceberg-sdk-python)',
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'llamaindex',
    name: 'LlamaIndex',
    category: 'frameworks',
    shortDesc: 'Index and retrieve your data with LlamaIndex and Iceberg for semantic search and RAG applications.',
    summary: 'Use Iceberg with LlamaIndex to build RAG pipelines that ingest PDFs, enrich node metadata, run semantic search, and evaluate LLM answer relevancy.',
    intro: [
      'LlamaIndex is a data framework for connecting private enterprise documents and APIs to LLMs across Python and TypeScript.',
      'Integrate Iceberg Database with LlamaIndex via `IcebergLlamaIndexVectorStore` (included in `pip install icebergdb`) to build end-to-end ingestion, retrieval, and evaluation workflows.',
    ],
    cta: null,
    sections: [
      {
        id: 'setup-guide',
        title: 'Setup guide',
        blocks: [
          {
            type: 'p',
            text: 'In this guide, you will build and evaluate a complete LlamaIndex RAG pipeline backed by Iceberg:',
          },
          {
            type: 'bullets',
            items: [
              'Load and clean an academic PDF paper (`hnsw.pdf`) with LlamaIndex readers',
              'Enrich node metadata and chunk text in an ingestion pipeline',
              'Upsert `1536d` vectors into Iceberg and inspect collection stats',
              'Query with a RAG engine and evaluate groundedness with `RelevancyEvaluator`',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'You can run `IcebergLlamaIndexVectorStore` either with external `OpenAIEmbedding` (`1536d`) or with zero external API keys using Iceberg built-in `384d` server-side embeddings.',
          },
          {
            type: 'steps',
            items: [
              {
                id: 'li-step-1',
                title: 'Set up the environment',
                blocks: [
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `pip install -qU icebergdb llama-index-core llama-index-llms-openai llama-index-embeddings-openai llama-index-readers-file arxiv`,
                  },
                  {
                    type: 'code',
                    lang: 'bash',
                    label: 'Shell',
                    code: `export ICEBERG_API_KEY="ib_your_api_key"
export OPENAI_API_KEY="sk-your-openai-key"`,
                  },
                ],
              },
              {
                id: 'li-step-2',
                title: 'Load the data',
                blocks: [
                  {
                    type: 'p',
                    text: 'Download the [canonical HNSW graph paper](https://arxiv.org/abs/1603.09320) (`1603.09320`) from arXiv and load pages with `PDFReader`:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import arxiv, re
from pathlib import Path
from llama_index.readers.file import PDFReader

paper = next(arxiv.Client().results(arxiv.Search(id_list=["1603.09320"])))
paper.download_pdf(filename="hnsw.pdf")

documents = PDFReader().load_data(file=Path("hnsw.pdf"))
documents[0]`,
                  },
                  {
                    type: 'response',
                    code: `Document(id_='doc_page_0', metadata={'page_label': '1', 'file_name': 'hnsw.pdf'}, text='Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs...')`,
                  },
                  {
                    type: 'p',
                    text: 'Clean hyphenated line-breaks (`alg o-\\nrithms` -> `algorithms`) before chunking:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `for d in documents:
    d.text = re.sub(r"-\\n", "", d.text)`,
                  },
                ],
              },
              {
                id: 'li-step-3',
                title: 'Transform the data',
                blocks: [
                  { type: 'h4', id: 'li-metadata', title: 'Metadata' },
                  {
                    type: 'p',
                    text: 'Enrich each `Document` with paper citation metadata so downstream filters and LLM prompts know the exact source:',
                  },
                  {
                    type: 'callout',
                    variant: 'info',
                    text: 'LlamaIndex lets you control `excluded_llm_metadata_keys` and `excluded_embed_metadata_keys` independently for fine-grained context tuning.',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `for d in documents:
    d.metadata.update({"title": paper.title, "year": 2016})
documents[0].metadata`,
                  },
                  {
                    type: 'response',
                    code: `{'page_label': '1', 'file_name': 'hnsw.pdf', 'title': 'Efficient and robust approximate nearest neighbor search using HNSW graphs', 'year': 2016}`,
                  },
                  { type: 'h4', id: 'li-ingestion-pipeline', title: 'Ingestion pipeline' },
                  {
                    type: 'p',
                    text: 'Split pages into clean sentence chunks and embed with `text-embedding-3-small` (`1536d`):',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding

splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
embed_model = OpenAIEmbedding(model="text-embedding-3-small")
nodes = splitter.get_nodes_from_documents(documents)
for n in nodes:
    n.embedding = embed_model.get_text_embedding(n.get_content())`,
                  },
                ],
              },
              {
                id: 'li-step-4',
                title: 'Upsert the data',
                blocks: [
                  {
                    type: 'p',
                    text: 'Initialize `IcebergLlamaIndexVectorStore` (`dimension=1536`, `metric="cosine"`), upsert the embedded nodes, and inspect stats:',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `import os
from iceberg import Client
from iceberg.integrations import IcebergLlamaIndexVectorStore

ib = Client(api_key=os.environ["ICEBERG_API_KEY"], source_tag="llamaindex")
vector_store = IcebergLlamaIndexVectorStore(
    client=ib,
    collection_name="llama-hnsw-paper",
    dimension=1536,
    metric="cosine",
)
vector_store.add(nodes)
ib.describe_collection_stats("llama-hnsw-paper")`,
                  },
                  {
                    type: 'response',
                    code: `{'name': 'llama-hnsw-paper', 'dimension': 1536, 'metric': 'cosine', 'vector_count': 46, 'namespaces': {'': 46}}`,
                  },
                ],
              },
              {
                id: 'li-step-5',
                title: 'Query the data',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `q_str = "How does logarithmic complexity affect HNSW graph construction?"
q_emb = embed_model.get_query_embedding(q_str)
matches = vector_store.query(query_embedding=q_emb, similarity_top_k=3)
matches[0]["text"][:140]`,
                  },
                  {
                    type: 'response',
                    code: `'Hierarchical navigable small world graphs maintain logarithmic O(log N) routing complexity across multi-layer proximity links...'`,
                  },
                ],
              },
              {
                id: 'li-step-6',
                title: 'Build a RAG app with the data',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from llama_index.llms.openai import OpenAI

llm = OpenAI(model="gpt-4o-mini", temperature=0)
context_blob = "\\n\\n".join(m["text"] for m in matches)
answer = llm.complete(f"Context:\\n{context_blob}\\n\\nQuestion: {q_str}")
print(answer.text)`,
                  },
                  {
                    type: 'response',
                    code: `'Logarithmic complexity in HNSW construction separates links across hierarchical layers, bounding node degree and keeping search fast as datasets scale.'`,
                  },
                ],
              },
              {
                id: 'li-step-7',
                title: 'Evaluate the data',
                blocks: [
                  {
                    type: 'p',
                    text: 'Use LlamaIndex `RelevancyEvaluator` to verify that the generated answer is grounded in the retrieved Iceberg chunks (and rejects out-of-domain questions with `False`):',
                  },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from llama_index.core.evaluation import RelevancyEvaluator
import nest_asyncio

nest_asyncio.apply()
evaluator = RelevancyEvaluator(llm=llm)
eval_result = evaluator.evaluate(
    query=q_str,
    response=answer.text,
    contexts=[m["text"] for m in matches],
)
print(eval_result.passing)`,
                  },
                  {
                    type: 'response',
                    code: `True`,
                  },
                ],
              },
              {
                id: 'li-step-8',
                title: 'Clean up',
                blocks: [
                  { type: 'p', text: "When you're finished with the collection, delete it:" },
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `ib.delete_collection("llama-hnsw-paper")`,
                  },
                ],
              },
            ],
          },
          { type: 'h3', id: 'li-summary', title: 'Summary' },
          {
            type: 'p',
            text: 'This guide covered loading academic PDFs, enriching metadata, indexing into Iceberg with `IcebergLlamaIndexVectorStore`, and evaluating RAG faithfulness. [Explore the full API reference](/docs) or [reach out](/contact) with feedback.',
          },
        ],
      },
    ],
  },

  {
    slug: 'n8n',
    name: 'n8n',
    category: 'frameworks',
    shortDesc: 'Build AI workflows with the Iceberg Assistant, 4-Tier Memory, or Vector Store node for managed RAG or full pipeline control.',
    summary: 'Use `n8n-nodes-iceberg` in n8n to build visual RAG pipelines, persistent 4-tier agent memory, and no-code automations across 400+ apps.',
    intro: [
      'n8n is a fair-code workflow automation platform that combines a visual node editor with custom JavaScript/Python steps and native AI Agent orchestration.',
      'Whether self-hosted in Docker or running on n8n Cloud, n8n connects Slack, WhatsApp, Gmail, Notion, and webhooks directly to Iceberg.',
    ],
    cta: null,
    sections: [
      {
        id: 'three-ways-to-use-iceberg-in-n8n',
        title: 'Three ways to use Iceberg in n8n',
        blocks: [
          {
            type: 'p',
            text: '1. **Iceberg Vector Store (`n8n-nodes-iceberg`)** -- Index text documents on server CPU (`384d` free) or upsert custom vectors and run hybrid BM25 + HNSW searches inside n8n AI Agent chains.',
          },
          {
            type: 'p',
            text: '2. **Iceberg 4-Tier Memory (`n8n-nodes-iceberg`)** -- Give Telegram, WhatsApp, and Slack bots persistent `short_term`, `episodic`, `long_term`, and `semantic` memory across workflow executions.',
          },
          {
            type: 'p',
            text: '3. **Iceberg Assistant (`n8n-nodes-iceberg`)** -- Upload PDFs/docs once in the Iceberg Console and chat with a managed RAG Assistant node with zero chunking setup.',
          },
          {
            type: 'inlineCta',
            label: 'Explore Iceberg Assistant',
            to: '/product/assistant',
          },
        ],
      },
      {
        id: 'getting-started-n8n',
        title: 'Getting started (n8n-nodes-iceberg)',
        blocks: [
          {
            type: 'p',
            text: 'Follow these steps to connect your n8n instance to `https://api.icebergdb.in`:',
          },
          {
            type: 'bullets',
            items: [
              'In self-hosted n8n, open **Settings > Community Nodes > Install** and enter `n8n-nodes-iceberg`',
              'Generate an `ib_...` API key in [dashboard.icebergdb.in](https://dashboard.icebergdb.in)',
              'Add an **Iceberg DB API** credential in n8n (`https://api.icebergdb.in` + your key)',
              'Drop the **Iceberg DB** node into your workflow and choose `Vector`, `Memory`, or `Assistant`',
              'Start indexing webhooks, recalling user preferences, or answering customer questions',
            ],
          },
          {
            type: 'p',
            text: 'You can also use the `iceberg-n8n` skill inside [Claude Code](/integrations/claude-code) and [Cursor](/integrations/cursor) to auto-generate importable n8n workflow JSON.',
          },
        ],
      },
    ],
  },

  {
    slug: 'openclaw-crewai',
    name: 'OpenClaw & CrewAI',
    hideFromOverviewGrid: true,
    hideFromSidebar: true,
    category: 'frameworks',
    shortDesc: 'Share unified 4-tier cognitive memory (Ebbinghaus decay) across OpenClaw, CrewAI crews, and LangGraph.',
    summary: 'Equip multi-agent systems (`CrewAI`, `OpenClaw`, `LangGraph`, `AutoGen`) with native 4-tier cognitive memory powered by Ebbinghaus forgetting curves in Rust.',
    intro: [
      'Multi-agent crews fail when every agent forgets prior user preferences or floods prompts with stale logs. Iceberg computes Ebbinghaus time-decay and access reinforcement natively inside `iceberg-core-rs` across `short_term` (1h), `episodic` (30d), `long_term`, and `semantic` tiers.',
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
                id: 'mem-step-1',
                title: 'Store episodic and long-term memories from Agent A',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `from iceberg import Client

ib = Client(api_key="ib_your_api_key", source_tag="crewai-openclaw")

ib.remember(
    agent_id="research_crew_01",
    content="Customer requires DPDP Act 2023 ap-south-1 data residency and INR GST invoicing.",
    memory_type="long_term",
    metadata={"author_agent": "discovery_specialist"},
)`,
                  },
                ],
              },
              {
                id: 'mem-step-2',
                title: 'Recall ranked memories in Agent B before synthesis',
                blocks: [
                  {
                    type: 'code',
                    lang: 'python',
                    label: 'Python',
                    code: `memories = ib.recall("research_crew_01", "compliance and billing requirements", top_k=3)
for m in memories:
    print(f"{m.score:.3f} [{m.memory_type}] -> {m.content}")`,
                  },
                  {
                    type: 'response',
                    code: `0.912 [long_term] -> Customer requires DPDP Act 2023 ap-south-1 data residency and INR GST invoicing.`,
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
    slug: 'progress-agentic-rag',
    name: 'Progress Agentic RAG',
    category: 'frameworks',
    shortDesc: 'Store the vector index for an enterprise agentic RAG knowledge box in Iceberg.',
    summary: 'Ground multi-hop Progress Agentic RAG knowledge pipelines on Iceberg hybrid BM25 + HNSW vector collections.',
    intro: [
      '[Progress Agentic RAG](https://www.progress.com) (formerly Nuclia) provides enterprise RAG-as-a-Service over multimodal documents, tables, and internal knowledge repositories.',
      'Connecting Progress Agentic RAG retrieval stages to Iceberg combines multi-step query verification with sub-15ms India-hosted (`ap-south-1`) hybrid RRF search and strict namespace isolation.',
      'Hybrid lexical + dense scoring ensures exact part numbers, legal clause citations, and semantic concepts are retrieved together.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },

  {
    slug: 'voltagent',
    name: 'VoltAgent',
    category: 'frameworks',
    shortDesc: 'Build AI agents with retrieval-augmented generation (RAG) and persistent memory in VoltAgent, a TypeScript framework.',
    summary: 'Build observable TypeScript AI agents with VoltAgent and the official `icebergdb` npm SDK using automatic embeddings, hybrid search, and 4-tier memory.',
    intro: [
      '[VoltAgent](https://voltagent.dev) is a modular TypeScript framework for building, debugging, and monitoring tool-calling AI agents.',
      'Integrating `npm install icebergdb` (`v1.0.0`) into VoltAgent provides:',
    ],
    topBullets: [
      'Zero-key `384d` text indexing and hybrid RRF search (`ib.search`)',
      'Multi-dimension vector queries (`1024d` / `1536d`) with metadata filtering',
      '4-tier persistent agent memory (`ib.remember` & `ib.recall`)',
      'Source references, chunk metadata, and similarity scores',
      'Edge-ready Web `fetch` client with automatic exponential-backoff retries',
    ],
    introAfterBullets: [
      'Use this integration to ship production TypeScript agents with full observability and low-latency retrieval.',
    ],
    cta: { label: 'Get started', href: 'https://dashboard.icebergdb.in/signup' },
    sections: [],
  },
]

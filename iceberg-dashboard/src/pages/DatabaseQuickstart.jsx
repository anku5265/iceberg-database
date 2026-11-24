import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const SAMPLE_DATASET = [
  {
    id: 'sample_1',
    text: 'Iceberg DB is a serverless vector database and agent memory infrastructure hosted in India (ap-south-1). It combines dense 384-dimensional vector embeddings with sparse BM25 keyword scoring via Reciprocal Rank Fusion (RRF).',
    metadata: { category: 'architecture', source: 'sample_dataset' }
  },
  {
    id: 'sample_2',
    text: 'Hybrid search blends semantic similarity (cosine distance on all-MiniLM-L6-v2 embeddings) with exact keyword matching so product SKUs, error codes, and proper nouns are retrieved alongside conceptual matches.',
    metadata: { category: 'search', source: 'sample_dataset' }
  },
  {
    id: 'sample_3',
    text: 'Iceberg Agent Memory provides four cognitive tiers for autonomous AI agents: working memory, episodic memory, semantic memory, and long-term memory, each isolated per tenant namespace.',
    metadata: { category: 'memory', source: 'sample_dataset' }
  },
  {
    id: 'sample_4',
    text: 'Every API request is authenticated using an X-API-Key header. Read-only keys (ib_ro_...) can run search and recall queries, while full-access keys can create collections, upload documents, and delete vectors.',
    metadata: { category: 'security', source: 'sample_dataset' }
  },
  {
    id: 'sample_5',
    text: 'The Python SDK (pip install icebergdb) and JavaScript SDK (npm install icebergdb) include automatic exponential backoff retry protection against transient network errors and rate limits.',
    metadata: { category: 'sdk', source: 'sample_dataset' }
  }
]

const CONNECT_METHODS = [
  { id: 'code', label: 'Code' },
  { id: 'ai_assist', label: 'AI Assist' },
  { id: 'n8n', label: 'n8n' },
]

// Exact 5 options in exact order from Pinecone Screenshot: Node, Python, Java, Go, Shell
const SDK_OPTIONS = [
  {
    id: 'node',
    label: 'Node',
    refLabel: 'Node.js SDK reference',
    installCmd: 'npm install icebergdb',
    initLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">import</span> {'{ '}Iceberg{' }'} <span className="text-[#ddad7d]">from</span> <span className="text-[#8fcf6d]">&apos;icebergdb&apos;</span>;</span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">const</span> ic = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">Iceberg</span>({'{'}</span>,
      <span key="4">{'  '}<span className="text-[#6bb6e4]">apiKey</span>: <span className="text-[#8fcf6d]">&apos;{key}&apos;</span></span>,
      <span key="5">{'}'});</span>,
    ],
    initRaw: (key) => `import { Iceberg } from 'icebergdb';\n\nconst ic = new Iceberg({\n  apiKey: '${key}'\n});`,
    createLines: [
      <span key="1"><span className="text-[#ddad7d]">const</span> indexName = <span className="text-[#8fcf6d]">&apos;developer-quickstart-js&apos;</span>;</span>,
      <span key="2"><span className="text-[#ddad7d]">await</span> ic.<span className="text-[#6bb6e4]">createIndexForModel</span>({'{'}</span>,
      <span key="3">{'  '}<span className="text-[#6bb6e4]">name</span>: indexName,</span>,
      <span key="4">{'  '}<span className="text-[#6bb6e4]">cloud</span>: <span className="text-[#8fcf6d]">&apos;aws&apos;</span>,</span>,
      <span key="5">{'  '}<span className="text-[#6bb6e4]">region</span>: <span className="text-[#8fcf6d]">&apos;ap-south-1&apos;</span>,</span>,
      <span key="6">{'  '}<span className="text-[#6bb6e4]">embed</span>: {'{'}</span>,
      <span key="7">{'    '}<span className="text-[#6bb6e4]">model</span>: <span className="text-[#8fcf6d]">&apos;all-MiniLM-L6-v2&apos;</span>,</span>,
      <span key="8">{'    '}<span className="text-[#6bb6e4]">fieldMap</span>: {'{'} <span className="text-[#6bb6e4]">text</span>: <span className="text-[#8fcf6d]">&apos;chunk_text&apos;</span> {'}'},</span>,
      <span key="9">{'  '}{'}'},</span>,
      <span key="10">{'  '}<span className="text-[#6bb6e4]">waitUntilReady</span>: <span className="text-[#decc75]">true</span>,</span>,
      <span key="11">{'}'});</span>,
    ],
    createRaw: `const indexName = 'developer-quickstart-js';\nawait ic.createIndexForModel({\n  name: indexName,\n  cloud: 'aws',\n  region: 'ap-south-1',\n  embed: {\n    model: 'all-MiniLM-L6-v2',\n    fieldMap: { text: 'chunk_text' },\n  },\n  waitUntilReady: true,\n});`
  },
  {
    id: 'python',
    label: 'Python',
    refLabel: 'Python SDK reference',
    hasNotebooks: true,
    installCmd: 'pip install icebergdb',
    initLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">from</span> iceberg <span className="text-[#ddad7d]">import</span> Iceberg, ServerlessSpec</span>,
      <span key="2"></span>,
      <span key="3">ic = Iceberg(api_key=<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>)</span>,
    ],
    initRaw: (key) => `from iceberg import Iceberg, ServerlessSpec\n\nic = Iceberg(api_key="${key}")`,
    createLines: [
      <span key="1">index_name = <span className="text-[#8fcf6d]">&quot;developer-quickstart-py&quot;</span></span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">if not</span> ic.has_index(index_name):</span>,
      <span key="4">{'    '}ic.create_index_for_model(</span>,
      <span key="5">{'        '}name=index_name,</span>,
      <span key="6">{'        '}cloud=<span className="text-[#8fcf6d]">&quot;aws&quot;</span>,</span>,
      <span key="7">{'        '}region=<span className="text-[#8fcf6d]">&quot;ap-south-1&quot;</span>,</span>,
      <span key="8">{'        '}embed={'{'}</span>,
      <span key="9">{'            '}<span className="text-[#8fcf6d]">&quot;model&quot;</span>:<span className="text-[#8fcf6d]">&quot;all-MiniLM-L6-v2&quot;</span>,</span>,
      <span key="10">{'            '}<span className="text-[#8fcf6d]">&quot;field_map&quot;</span>:{'{'}<span className="text-[#8fcf6d]">&quot;text&quot;</span>: <span className="text-[#8fcf6d]">&quot;chunk_text&quot;</span>{'}'}</span>,
      <span key="11">{'        '}{'}'}</span>,
      <span key="12">{'    '})</span>,
    ],
    createRaw: `index_name = "developer-quickstart-py"\n\nif not ic.has_index(index_name):\n    ic.create_index_for_model(\n        name=index_name,\n        cloud="aws",\n        region="ap-south-1",\n        embed={\n            "model":"all-MiniLM-L6-v2",\n            "field_map":{"text": "chunk_text"}\n        }\n    )`
  },
  {
    id: 'java',
    label: 'Java',
    refLabel: 'Java SDK reference',
    installLines: [
      <span key="1"><span className="text-[#8a8a8a]">// Add a dependency to the current module:</span></span>,
      <span key="2"><span className="text-[#8a8a8a]">// Maven</span></span>,
      <span key="3">&lt;dependency&gt;</span>,
      <span key="4">{'  '}&lt;groupId&gt;io.icebergdb&lt;/groupId&gt;</span>,
      <span key="5">{'  '}&lt;artifactId&gt;iceberg-sdk&lt;/artifactId&gt;</span>,
      <span key="6">{'  '}&lt;version&gt;1.0.0&lt;/version&gt;</span>,
      <span key="7">&lt;/dependency&gt;</span>,
      <span key="8"></span>,
      <span key="9"><span className="text-[#8a8a8a]">// Gradle</span></span>,
      <span key="10">implementation <span className="text-[#8fcf6d]">&quot;io.icebergdb:iceberg-sdk:1.0.0&quot;</span></span>,
    ],
    installCmd: `// Add a dependency to the current module:\n// Maven\n<dependency>\n  <groupId>io.icebergdb</groupId>\n  <artifactId>iceberg-sdk</artifactId>\n  <version>1.0.0</version>\n</dependency>\n\n// Gradle\nimplementation "io.icebergdb:iceberg-sdk:1.0.0"`,
    initLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">import</span> in.iceberg.<span className="text-[#6bb6e4]">Index</span>;</span>,
      <span key="2"><span className="text-[#ddad7d]">import</span> in.iceberg.<span className="text-[#6bb6e4]">Iceberg</span>;</span>,
      <span key="3"><span className="text-[#ddad7d]">import</span> in.iceberg.<span className="text-[#6bb6e4]">IcebergError</span>;</span>,
      <span key="4"><span className="text-[#ddad7d]">import</span> in.iceberg.model.<span className="text-[#6bb6e4]">CreateIndexForModelRequest</span>;</span>,
      <span key="5"><span className="text-[#ddad7d]">import</span> in.iceberg.model.<span className="text-[#6bb6e4]">CreateIndexForModelRequestEmbed</span>;</span>,
      <span key="6"><span className="text-[#ddad7d]">import</span> in.iceberg.model.<span className="text-[#6bb6e4]">DeletionProtection</span>;</span>,
      <span key="7"><span className="text-[#ddad7d]">import</span> in.iceberg.model.<span className="text-[#6bb6e4]">IndexModel</span>;</span>,
      <span key="8"><span className="text-[#ddad7d]">import</span> in.iceberg.model.<span className="text-[#6bb6e4]">SearchRecordsRequestQuery</span>;</span>,
      <span key="9"><span className="text-[#ddad7d]">import</span> in.iceberg.model.<span className="text-[#6bb6e4]">SearchRecordsResponse</span>;</span>,
      <span key="10"><span className="text-[#ddad7d]">import</span> in.iceberg.model.<span className="text-[#6bb6e4]">DescribeIndexStatsResponse</span>;</span>,
      <span key="11"></span>,
      <span key="12"><span className="text-[#ddad7d]">import</span> java.util.*;</span>,
      <span key="13"></span>,
      <span key="14"><span className="text-[#ddad7d]">public class</span> <span className="text-[#6bb6e4]">Quickstart</span> {'{'}</span>,
      <span key="15">{'    '}<span className="text-[#ddad7d]">public static void</span> <span className="text-[#6bb6e4]">main</span>(<span className="text-[#6bb6e4]">String</span>[] args) <span className="text-[#ddad7d]">throws</span> <span className="text-[#6bb6e4]">IcebergError</span> {'{'}</span>,
      <span key="16">{'        '}<span className="text-[#6bb6e4]">Iceberg</span> ic = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">Iceberg.Builder</span>(<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>).<span className="text-[#6bb6e4]">build</span>();</span>,
      <span key="17">{'    '}{'}'}</span>,
      <span key="18">{'}'}</span>,
    ],
    initRaw: (key) => `import in.iceberg.Index;\nimport in.iceberg.Iceberg;\nimport in.iceberg.IcebergError;\nimport in.iceberg.model.CreateIndexForModelRequest;\nimport in.iceberg.model.CreateIndexForModelRequestEmbed;\nimport in.iceberg.model.DeletionProtection;\nimport in.iceberg.model.IndexModel;\nimport in.iceberg.model.SearchRecordsRequestQuery;\nimport in.iceberg.model.SearchRecordsResponse;\nimport in.iceberg.model.DescribeIndexStatsResponse;\n\nimport java.util.*;\n\npublic class Quickstart {\n    public static void main(String[] args) throws IcebergError {\n        Iceberg ic = new Iceberg.Builder("${key}").build();\n    }\n}`,
    createLines: [
      <span key="1"><span className="text-[#8a8a8a]">// Add to the main function:</span></span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#6bb6e4]">String</span> indexName = <span className="text-[#8fcf6d]">&quot;developer-quickstart-java&quot;</span>;</span>,
      <span key="4"><span className="text-[#6bb6e4]">String</span> region = <span className="text-[#8fcf6d]">&quot;ap-south-1&quot;</span>;</span>,
      <span key="5"><span className="text-[#6bb6e4]">HashMap</span>&lt;<span className="text-[#6bb6e4]">String</span>, <span className="text-[#6bb6e4]">String</span>&gt; fieldMap = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">HashMap</span>&lt;&gt;();</span>,
      <span key="6">fieldMap.<span className="text-[#6bb6e4]">put</span>(<span className="text-[#8fcf6d]">&quot;text&quot;</span>, <span className="text-[#8fcf6d]">&quot;chunk_text&quot;</span>);</span>,
      <span key="7"><span className="text-[#6bb6e4]">CreateIndexForModelRequestEmbed</span> embed = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">CreateIndexForModelRequestEmbed</span>()</span>,
      <span key="8">{'    '}.<span className="text-[#6bb6e4]">model</span>(<span className="text-[#8fcf6d]">&quot;all-MiniLM-L6-v2&quot;</span>)</span>,
      <span key="9">{'    '}.<span className="text-[#6bb6e4]">fieldMap</span>(fieldMap);</span>,
      <span key="10"></span>,
      <span key="11">ic.<span className="text-[#6bb6e4]">createIndexForModel</span>(</span>,
      <span key="12">{'    '}indexName,</span>,
      <span key="13">{'    '}<span className="text-[#6bb6e4]">CreateIndexForModelRequest</span>.<span className="text-[#6bb6e4]">CloudEnum</span>.<span className="text-[#decc75]">AWS</span>,</span>,
      <span key="14">{'    '}region,</span>,
      <span key="15">{'    '}embed,</span>,
      <span key="16">{'    '}<span className="text-[#6bb6e4]">DeletionProtection</span>.<span className="text-[#decc75]">DISABLED</span>,</span>,
      <span key="17">{'    '}<span className="text-[#decc75]">null</span></span>,
      <span key="18">);</span>,
    ],
    createRaw: `// Add to the main function:\n\nString indexName = "developer-quickstart-java";\nString region = "ap-south-1";\nHashMap<String, String> fieldMap = new HashMap<>();\nfieldMap.put("text", "chunk_text");\nCreateIndexForModelRequestEmbed embed = new CreateIndexForModelRequestEmbed()\n    .model("all-MiniLM-L6-v2")\n    .fieldMap(fieldMap);\n\nic.createIndexForModel(\n    indexName,\n    CreateIndexForModelRequest.CloudEnum.AWS,\n    region,\n    embed,\n    DeletionProtection.DISABLED,\n    null\n);`
  },
  {
    id: 'go',
    label: 'Go',
    refLabel: 'Go SDK reference',
    installLines: [
      <span key="1"><span className="text-[#8a8a8a]"># Add a dependency to the current module:</span></span>,
      <span key="2">go get github.com/anku5265/iceberg-database/iceberg-sdk-go</span>,
    ],
    installCmd: `# Add a dependency to the current module:\ngo get github.com/anku5265/iceberg-database/iceberg-sdk-go`,
    initLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">package</span> main</span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">import</span> (</span>,
      <span key="4">{'    '}<span className="text-[#8fcf6d]">&quot;context&quot;</span></span>,
      <span key="5">{'    '}<span className="text-[#8fcf6d]">&quot;encoding/json&quot;</span></span>,
      <span key="6">{'    '}<span className="text-[#8fcf6d]">&quot;fmt&quot;</span></span>,
      <span key="7">{'    '}<span className="text-[#8fcf6d]">&quot;log&quot;</span></span>,
      <span key="8"></span>,
      <span key="9">{'    '}<span className="text-[#8fcf6d]">&quot;github.com/anku5265/iceberg-database/iceberg-sdk-go&quot;</span></span>,
      <span key="10">{'    '}<span className="text-[#8fcf6d]">&quot;google.golang.org/protobuf/types/known/structpb&quot;</span></span>,
      <span key="11">)</span>,
      <span key="12"></span>,
      <span key="13"><span className="text-[#ddad7d]">func</span> <span className="text-[#c678dd]">main</span>() {'{'}</span>,
      <span key="14">{'    '}ctx := context.<span className="text-[#c678dd]">Background</span>()</span>,
      <span key="15"></span>,
      <span key="16">{'    '}ic, err := iceberg.<span className="text-[#c678dd]">NewClient</span>(iceberg.NewClientParams{'{'}</span>,
      <span key="17">{'        '}ApiKey: <span className="text-[#8fcf6d]">&quot;{key}&quot;</span>,</span>,
      <span key="18">{'    '}{'}'})</span>,
      <span key="19">{'    '}<span className="text-[#ddad7d]">if</span> err != <span className="text-[#c678dd]">nil</span> {'{'}</span>,
      <span key="20">{'        '}log.<span className="text-[#c678dd]">Fatalf</span>(<span className="text-[#8fcf6d]">&quot;Failed to create Client: %v&quot;</span>, err)</span>,
      <span key="21">{'    '}{'}'}</span>,
      <span key="22">{'}'}</span>,
      <span key="23"></span>,
      <span key="24"><span className="text-[#ddad7d]">func</span> <span className="text-[#c678dd]">prettifyStruct</span>(obj <span className="text-[#ddad7d]">interface</span>{'{}'}) <span className="text-[#c678dd]">string</span> {'{'}</span>,
      <span key="25">{'    '}bytes, _ := json.<span className="text-[#c678dd]">MarshalIndent</span>(obj, <span className="text-[#8fcf6d]">&quot;&quot;</span>, <span className="text-[#8fcf6d]">&quot;  &quot;</span>)</span>,
      <span key="26">{'    '}<span className="text-[#ddad7d]">return</span> <span className="text-[#c678dd]">string</span>(bytes)</span>,
      <span key="27">{'}'}</span>,
    ],
    initRaw: (key) => `package main\n\nimport (\n    "context"\n    "encoding/json"\n    "fmt"\n    "log"\n\n    "github.com/anku5265/iceberg-database/iceberg-sdk-go"\n    "google.golang.org/protobuf/types/known/structpb"\n)\n\nfunc main() {\n    ctx := context.Background()\n\n    ic, err := iceberg.NewClient(iceberg.NewClientParams{\n        ApiKey: "${key}",\n    })\n    if err != nil {\n        log.Fatalf("Failed to create Client: %v", err)\n    }\n}\n\nfunc prettifyStruct(obj interface{}) string {\n    bytes, _ := json.MarshalIndent(obj, "", "  ")\n    return string(bytes)\n}`,
    createLines: [
      <span key="1"><span className="text-[#8a8a8a]">// Add to the main function:</span></span>,
      <span key="2"></span>,
      <span key="3">indexName := <span className="text-[#8fcf6d]">&quot;developer-quickstart-go&quot;</span></span>,
      <span key="4">idx, err := ic.<span className="text-[#c678dd]">CreateIndexForModel</span>(ctx, &amp;iceberg.CreateIndexForModelRequest{'{'}</span>,
      <span key="5">{'    '}Name:   indexName,</span>,
      <span key="6">{'    '}Cloud:  iceberg.Aws,</span>,
      <span key="7">{'    '}Region: <span className="text-[#8fcf6d]">&quot;ap-south-1&quot;</span>,</span>,
      <span key="8">{'    '}Embed: iceberg.CreateIndexForModelEmbed{'{'}</span>,
      <span key="9">{'        '}Model:    <span className="text-[#8fcf6d]">&quot;all-MiniLM-L6-v2&quot;</span>,</span>,
      <span key="10">{'        '}FieldMap: <span className="text-[#ddad7d]">map</span>[<span className="text-[#c678dd]">string</span>]<span className="text-[#ddad7d]">interface</span>{'{}'}{'{' }<span className="text-[#8fcf6d]">&quot;text&quot;</span>: <span className="text-[#8fcf6d]">&quot;chunk_text&quot;</span>{'}'},</span>,
      <span key="11">{'    '}{'}'},</span>,
      <span key="12">{'}'})</span>,
      <span key="13"><span className="text-[#ddad7d]">if</span> err != <span className="text-[#c678dd]">nil</span> {'{'}</span>,
      <span key="14">{'    '}log.<span className="text-[#c678dd]">Fatalf</span>(<span className="text-[#8fcf6d]">&quot;Failed to create serverless index: %v&quot;</span>, idx.Name)</span>,
      <span key="15">{'}'} <span className="text-[#ddad7d]">else</span> {'{'}</span>,
      <span key="16">{'    '}fmt.<span className="text-[#c678dd]">Printf</span>(<span className="text-[#8fcf6d]">&quot;Successfully created serverless index: %v&quot;</span>, idx.Name)</span>,
      <span key="17">{'}'}</span>,
    ],
    createRaw: `// Add to the main function:\n\nindexName := "developer-quickstart-go"\nidx, err := ic.CreateIndexForModel(ctx, &iceberg.CreateIndexForModelRequest{\n    Name:   indexName,\n    Cloud:  iceberg.Aws,\n    Region: "ap-south-1",\n    Embed: iceberg.CreateIndexForModelEmbed{\n        Model:    "all-MiniLM-L6-v2",\n        FieldMap: map[string]interface{}{"text": "chunk_text"},\n    },\n})\nif err != nil {\n    log.Fatalf("Failed to create serverless index: %v", idx.Name)\n} else {\n    fmt.Printf("Successfully created serverless index: %v", idx.Name)\n}`
  },
  {
    id: 'rust',
    label: 'Rust',
    refLabel: 'Rust SDK reference',
    installLines: [
      <span key="1"><span className="text-[#8a8a8a]"># Add a dependency to Cargo.toml:</span></span>,
      <span key="2"><span className="text-[#6bb6e4]">[dependencies]</span></span>,
      <span key="3"><span className="text-[#6bb6e4]">icebergdb</span> = <span className="text-[#8fcf6d]">&quot;1.0.0&quot;</span></span>,
      <span key="4"><span className="text-[#6bb6e4]">tokio</span> = {'{'} <span className="text-[#6bb6e4]">version</span> = <span className="text-[#8fcf6d]">&quot;1&quot;</span>, <span className="text-[#6bb6e4]">features</span> = [<span className="text-[#8fcf6d]">&quot;full&quot;</span>] {'}'}</span>,
      <span key="5"></span>,
      <span key="6"><span className="text-[#8a8a8a]"># Or via Cargo CLI:</span></span>,
      <span key="7">cargo add icebergdb</span>,
    ],
    installCmd: `# Add a dependency to Cargo.toml:\n[dependencies]\nicebergdb = "1.0.0"\ntokio = { version = "1", features = ["full"] }\n\n# Or via Cargo CLI:\ncargo add icebergdb`,
    initLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">use</span> icebergdb::{'{'}<span className="text-[#6bb6e4]">Client</span>, <span className="text-[#6bb6e4]">CreateIndexForModelEmbed</span>, <span className="text-[#6bb6e4]">CreateIndexForModelRequest</span>, <span className="text-[#6bb6e4]">IcebergError</span>{'}'};</span>,
      <span key="2"><span className="text-[#ddad7d]">use</span> std::collections::<span className="text-[#6bb6e4]">HashMap</span>;</span>,
      <span key="3"></span>,
      <span key="4"><span className="text-[#6bb6e4]">#[tokio::main]</span></span>,
      <span key="5"><span className="text-[#ddad7d]">async fn</span> <span className="text-[#c678dd]">main</span>() -&gt; <span className="text-[#6bb6e4]">Result</span>&lt;(), <span className="text-[#6bb6e4]">IcebergError</span>&gt; {'{'}</span>,
      <span key="6">{'    '}<span className="text-[#8a8a8a]">// Initialize a client with your API key</span></span>,
      <span key="7">{'    '}<span className="text-[#ddad7d]">let</span> ic = <span className="text-[#6bb6e4]">Client</span>::<span className="text-[#c678dd]">new</span>(<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>);</span>,
      <span key="8"></span>,
      <span key="9">{'    '}<span className="text-[#6bb6e4]">Ok</span>(())</span>,
      <span key="10">{'}'}</span>,
    ],
    initRaw: (key) => `use icebergdb::{Client, CreateIndexForModelEmbed, CreateIndexForModelRequest, IcebergError};\nuse std::collections::HashMap;\n\n#[tokio::main]\nasync fn main() -> Result<(), IcebergError> {\n    // Initialize a client with your API key\n    let ic = Client::new("${key}");\n\n    Ok(())\n}`,
    createLines: [
      <span key="1"><span className="text-[#8a8a8a]">// Add to the main function:</span></span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">let</span> index_name = <span className="text-[#8fcf6d]">&quot;developer-quickstart-rust&quot;</span>;</span>,
      <span key="4"><span className="text-[#ddad7d]">let mut</span> field_map = <span className="text-[#6bb6e4]">HashMap</span>::<span className="text-[#c678dd]">new</span>();</span>,
      <span key="5">field_map.<span className="text-[#c678dd]">insert</span>(<span className="text-[#8fcf6d]">&quot;text&quot;</span>.<span className="text-[#c678dd]">to_string</span>(), <span className="text-[#8fcf6d]">&quot;chunk_text&quot;</span>.<span className="text-[#c678dd]">to_string</span>());</span>,
      <span key="6"></span>,
      <span key="7"><span className="text-[#ddad7d]">let</span> req = <span className="text-[#6bb6e4]">CreateIndexForModelRequest</span> {'{'}</span>,
      <span key="8">{'    '}name: index_name.<span className="text-[#c678dd]">to_string</span>(),</span>,
      <span key="9">{'    '}cloud: <span className="text-[#8fcf6d]">&quot;aws&quot;</span>.<span className="text-[#c678dd]">to_string</span>(),</span>,
      <span key="10">{'    '}region: <span className="text-[#8fcf6d]">&quot;ap-south-1&quot;</span>.<span className="text-[#c678dd]">to_string</span>(),</span>,
      <span key="11">{'    '}embed: <span className="text-[#6bb6e4]">CreateIndexForModelEmbed</span> {'{'}</span>,
      <span key="12">{'        '}model: <span className="text-[#8fcf6d]">&quot;all-MiniLM-L6-v2&quot;</span>.<span className="text-[#c678dd]">to_string</span>(),</span>,
      <span key="13">{'        '}metric: <span className="text-[#6bb6e4]">Some</span>(<span className="text-[#8fcf6d]">&quot;cosine&quot;</span>.<span className="text-[#c678dd]">to_string</span>()),</span>,
      <span key="14">{'        '}field_map,</span>,
      <span key="15">{'    '}{'}'},</span>,
      <span key="16">{'}'};</span>,
      <span key="17"><span className="text-[#ddad7d]">let</span> idx = ic.<span className="text-[#c678dd]">create_index_for_model</span>(&amp;req).<span className="text-[#ddad7d]">await</span>?;</span>,
      <span key="18"><span className="text-[#c678dd]">println!</span>(<span className="text-[#8fcf6d]">&quot;Successfully created serverless index: {'{}'}&quot;</span>, idx.name);</span>,
    ],
    createRaw: `// Add to the main function:\n\nlet index_name = "developer-quickstart-rust";\nlet mut field_map = HashMap::new();\nfield_map.insert("text".to_string(), "chunk_text".to_string());\n\nlet req = CreateIndexForModelRequest {\n    name: index_name.to_string(),\n    cloud: "aws".to_string(),\n    region: "ap-south-1".to_string(),\n    embed: CreateIndexForModelEmbed {\n        model: "all-MiniLM-L6-v2".to_string(),\n        metric: Some("cosine".to_string()),\n        field_map,\n    },\n};\nlet idx = ic.create_index_for_model(&req).await?;\nprintln!("Successfully created serverless index: {}", idx.name);`
  },
  {
    id: 'dotnet',
    label: '.NET',
    refLabel: '.NET SDK reference',
    installLines: [
      <span key="1"><span className="text-[#8a8a8a]">// Add a package reference to your project:</span></span>,
      <span key="2"><span className="text-[#8a8a8a]">// .NET CLI</span></span>,
      <span key="3">dotnet add package IcebergDb --version <span className="text-[#decc75]">1.0.0</span></span>,
      <span key="4"></span>,
      <span key="5"><span className="text-[#8a8a8a]">// Or in your .csproj file:</span></span>,
      <span key="6">&lt;<span className="text-[#6bb6e4]">ItemGroup</span>&gt;</span>,
      <span key="7">{'  '}&lt;<span className="text-[#6bb6e4]">PackageReference</span> <span className="text-[#ddad7d]">Include</span>=<span className="text-[#8fcf6d]">&quot;IcebergDb&quot;</span> <span className="text-[#ddad7d]">Version</span>=<span className="text-[#8fcf6d]">&quot;1.0.0&quot;</span> /&gt;</span>,
      <span key="8">&lt;/<span className="text-[#6bb6e4]">ItemGroup</span>&gt;</span>,
    ],
    installCmd: `// Add a package reference to your project:\n// .NET CLI\ndotnet add package IcebergDb --version 1.0.0\n\n// Or in your .csproj file:\n<ItemGroup>\n  <PackageReference Include="IcebergDb" Version="1.0.0" />\n</ItemGroup>`,
    initLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">using</span> System;</span>,
      <span key="2"><span className="text-[#ddad7d]">using</span> System.Collections.Generic;</span>,
      <span key="3"><span className="text-[#ddad7d]">using</span> System.Threading.Tasks;</span>,
      <span key="4"><span className="text-[#ddad7d]">using</span> Iceberg;</span>,
      <span key="5"></span>,
      <span key="6"><span className="text-[#ddad7d]">public class</span> <span className="text-[#6bb6e4]">Quickstart</span></span>,
      <span key="7">{'{'}</span>,
      <span key="8">{'    '}<span className="text-[#ddad7d]">public static async</span> <span className="text-[#6bb6e4]">Task</span> <span className="text-[#c678dd]">Main</span>(<span className="text-[#ddad7d]">string</span>[] args)</span>,
      <span key="9">{'    '}{'{'}</span>,
      <span key="10">{'        '}<span className="text-[#ddad7d]">var</span> ic = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">IcebergClient</span>(<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>);</span>,
      <span key="11">{'    '}{'}'}</span>,
      <span key="12">{'}'}</span>,
    ],
    initRaw: (key) => `using System;\nusing System.Collections.Generic;\nusing System.Threading.Tasks;\nusing Iceberg;\n\npublic class Quickstart\n{\n    public static async Task Main(string[] args)\n    {\n        var ic = new IcebergClient("${key}");\n    }\n}`,
    createLines: [
      <span key="1"><span className="text-[#8a8a8a]">// Add to the Main method:</span></span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">var</span> indexName = <span className="text-[#8fcf6d]">&quot;developer-quickstart-dotnet&quot;</span>;</span>,
      <span key="4"><span className="text-[#ddad7d]">var</span> fieldMap = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">Dictionary</span>&lt;<span className="text-[#ddad7d]">string</span>, <span className="text-[#ddad7d]">string</span>&gt;</span>,
      <span key="5">{'{'}</span>,
      <span key="6">{'    '}[<span className="text-[#8fcf6d]">&quot;text&quot;</span>] = <span className="text-[#8fcf6d]">&quot;chunk_text&quot;</span></span>,
      <span key="7">{'};'}</span>,
      <span key="8"><span className="text-[#ddad7d]">await</span> ic.<span className="text-[#c678dd]">CreateIndexForModelAsync</span>(<span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">CreateIndexForModelRequest</span></span>,
      <span key="9">{'{'}</span>,
      <span key="10">{'    '}Name = indexName,</span>,
      <span key="11">{'    '}Cloud = <span className="text-[#8fcf6d]">&quot;aws&quot;</span>,</span>,
      <span key="12">{'    '}Region = <span className="text-[#8fcf6d]">&quot;ap-south-1&quot;</span>,</span>,
      <span key="13">{'    '}Embed = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">CreateIndexForModelEmbed</span></span>,
      <span key="14">{'    '}{'{'}</span>,
      <span key="15">{'        '}Model = <span className="text-[#8fcf6d]">&quot;all-MiniLM-L6-v2&quot;</span>,</span>,
      <span key="16">{'        '}Metric = <span className="text-[#8fcf6d]">&quot;cosine&quot;</span>,</span>,
      <span key="17">{'        '}FieldMap = fieldMap</span>,
      <span key="18">{'    '}{'}'}</span>,
      <span key="19">{'});'}</span>,
    ],
    createRaw: `// Add to the Main method:\n\nvar indexName = "developer-quickstart-dotnet";\nvar fieldMap = new Dictionary<string, string>\n{\n    ["text"] = "chunk_text"\n};\nawait ic.CreateIndexForModelAsync(new CreateIndexForModelRequest\n{\n    Name = indexName,\n    Cloud = "aws",\n    Region = "ap-south-1",\n    Embed = new CreateIndexForModelEmbed\n    {\n        Model = "all-MiniLM-L6-v2",\n        Metric = "cosine",\n        FieldMap = fieldMap\n    }\n});`
  },
  {
    id: 'shell',
    label: 'Shell',
    refLabel: 'API reference',
    isShellOnly: true,
    installCmd: 'export ICEBERG_API_KEY="********-****-****-****-************"',
    initLines: (key) => [
      <span key="1"><span className="text-[#c678dd]">curl</span> -s <span className="text-[#8fcf6d]">&quot;https://api.icebergdb.in/collections&quot;</span> \</span>,
      <span key="2">{'  '}<span className="text-[#6bb6e4]">-H</span> <span className="text-[#8fcf6d]">&quot;X-API-Key: {key}&quot;</span></span>,
    ],
    initRaw: (key) => `curl -s "https://api.icebergdb.in/collections" \\\n  -H "X-API-Key: ${key}"`,
    createLines: (key) => [
      <span key="1"><span className="text-[#c678dd]">curl</span> <span className="text-[#8fcf6d]">&quot;https://api.icebergdb.in/collections&quot;</span> \</span>,
      <span key="2">{'  '}<span className="text-[#6bb6e4]">-H</span> <span className="text-[#8fcf6d]">&quot;Accept: application/json&quot;</span> \</span>,
      <span key="3">{'  '}<span className="text-[#6bb6e4]">-H</span> <span className="text-[#8fcf6d]">&quot;Content-Type: application/json&quot;</span> \</span>,
      <span key="4">{'  '}<span className="text-[#6bb6e4]">-H</span> <span className="text-[#8fcf6d]">&quot;X-API-Key: {key}&quot;</span> \</span>,
      <span key="5">{'  '}<span className="text-[#6bb6e4]">-H</span> <span className="text-[#8fcf6d]">&quot;X-Iceberg-API-Version: 2025-04&quot;</span> \</span>,
      <span key="6">{'  '}<span className="text-[#6bb6e4]">-d</span> <span className="text-[#8fcf6d]">&apos;{'{'}</span></span>,
      <span key="7"><span className="text-[#8fcf6d]">{'        "name": "developer-quickstart-shell",'}</span></span>,
      <span key="8"><span className="text-[#8fcf6d]">{'        "cloud": "aws",'}</span></span>,
      <span key="9"><span className="text-[#8fcf6d]">{'        "region": "ap-south-1",'}</span></span>,
      <span key="10"><span className="text-[#8fcf6d]">{'        "embed": {'}</span></span>,
      <span key="11"><span className="text-[#8fcf6d]">{'          "model": "all-MiniLM-L6-v2",'}</span></span>,
      <span key="12"><span className="text-[#8fcf6d]">{'          "metric": "cosine",'}</span></span>,
      <span key="13"><span className="text-[#8fcf6d]">{'          "field_map": {'}</span></span>,
      <span key="14"><span className="text-[#8fcf6d]">{'            "text": "chunk_text"'}</span></span>,
      <span key="15"><span className="text-[#8fcf6d]">{'          }'}</span></span>,
      <span key="16"><span className="text-[#8fcf6d]">{'        }'}</span></span>,
      <span key="17"><span className="text-[#8fcf6d]">{'      }\''}</span></span>,
    ],
    createRaw: (key) => `curl "https://api.icebergdb.in/collections" \\\n  -H "Accept: application/json" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: ${key}" \\\n  -H "X-Iceberg-API-Version: 2025-04" \\\n  -d '{\n        "name": "developer-quickstart-shell",\n        "cloud": "aws",\n        "region": "ap-south-1",\n        "embed": {\n          "model": "all-MiniLM-L6-v2",\n          "metric": "cosine",\n          "field_map": {\n            "text": "chunk_text"\n          }\n        }\n      }'`
  }
]

export default function DatabaseQuickstart() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const dropdownContainerRef = useRef(null)

  const [mode, setMode] = useState('files') // 'files' | 'text' | 'connect' | 'sample'
  const [collections, setCollections] = useState([])
  const [targetCollection, setTargetCollection] = useState('quickstart_docs')

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)

  // Direct text state
  const [rawText, setRawText] = useState('')

  // Connect tab state (Matches Pinecone Screenshots 1-5 UI, backed by real Iceberg SDKs)
  const [connectMethod, setConnectMethod] = useState('code') // 'code' | 'ai_assist' | 'n8n'
  const [sdkLang, setSdkLang] = useState('node')
  const [methodMenuOpen, setMethodMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [revealedKey, setRevealedKey] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Execution state
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  useEffect(() => {
    api.getCollections()
      .then((res) => {
        const list = res?.collections || []
        setCollections(list)
        if (list.length > 0) {
          setTargetCollection(list[0])
        }
      })
      .catch(() => {})
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target)) {
        setMethodMenuOpen(false)
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const effectiveCollection = targetCollection.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'quickstart_docs'

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []).slice(0, 25)
    if (incoming.length > 0) {
      setSelectedFiles((prev) => [...prev, ...incoming].slice(0, 25))
      setStatusMsg(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer?.files?.length) {
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleImportFiles = async () => {
    if (selectedFiles.length === 0) return
    setLoading(true)
    setStatusMsg(null)
    try {
      await api.createCollection(effectiveCollection, 'Created via Database Quickstart').catch(() => {})
      let totalChunks = 0
      for (const file of selectedFiles) {
        const res = await api.uploadFile(effectiveCollection, file)
        if (res?.detail && !res?.chunks_indexed && !res?.status) {
          throw new Error(res.detail)
        }
        totalChunks += res?.chunks_indexed || 1
      }
      setSelectedFiles([])
      setStatusMsg({
        type: 'success',
        text: `Imported ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} (${totalChunks} vector chunks) into "${effectiveCollection}".`,
        collection: effectiveCollection
      })
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to upload files. Please verify file format (.pdf, .md, .txt).'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportText = async () => {
    if (!rawText.trim()) return
    setLoading(true)
    setStatusMsg(null)
    try {
      await api.createCollection(effectiveCollection, 'Created via Database Quickstart').catch(() => {})
      const res = await api.indexText(effectiveCollection, rawText.trim(), 'quickstart')
      if (res?.detail && !res?.chunks_indexed && !res?.status) {
        throw new Error(res.detail)
      }
      setRawText('')
      setStatusMsg({
        type: 'success',
        text: `Indexed ${res?.chunks_indexed || 1} vector chunk(s) into "${effectiveCollection}".`,
        collection: effectiveCollection
      })
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to index text.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSampleData = async () => {
    setLoading(true)
    setStatusMsg(null)
    const sampleCol = collections[0] || 'sample_knowledge_base'
    try {
      await api.createCollection(sampleCol, 'Sample AI & Vector DB knowledge base').catch(() => {})
      const res = await api.indexBatch(sampleCol, SAMPLE_DATASET.map(d => d.text), 'sample_quickstart')
      if (res?.detail && !res?.chunks_indexed && !res?.indexed && !res?.status) {
        for (const item of SAMPLE_DATASET) {
          await api.indexText(sampleCol, item.text, 'sample_quickstart')
        }
      }
      setStatusMsg({
        type: 'success',
        text: `Loaded ${SAMPLE_DATASET.length} sample documents into "${sampleCol}".`,
        collection: sampleCol
      })
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to load sample dataset.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGetApiKey = () => {
    const stored = localStorage.getItem('iceberg_api_key')
    if (stored) {
      setRevealedKey(stored)
      copyText(stored, 'apikey')
    } else {
      navigate('/apikeys')
    }
  }

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const currentMethodObj = CONNECT_METHODS.find((m) => m.id === connectMethod) || CONNECT_METHODS[0]
  const currentSdk = SDK_OPTIONS.find((s) => s.id === sdkLang) || SDK_OPTIONS[0]
  const displayKey = revealedKey || '********-****-****-****-************'
  const rawKeyForCopy = revealedKey || localStorage.getItem('iceberg_api_key') || 'YOUR_API_KEY'

  const n8nCurlLines = [
    <span key="1">curl -X POST <span className="text-[#7ec699]">&quot;https://api.icebergdb.in/documents/text&quot;</span> \</span>,
    <span key="2">{'  '}-H <span className="text-[#7ec699]">&quot;X-API-Key: {displayKey}&quot;</span> \</span>,
    <span key="3">{'  '}-F <span className="text-[#7ec699]">&quot;collection=n8n_knowledge_base&quot;</span> \</span>,
    <span key="4">{'  '}-F <span className="text-[#7ec699]">&quot;text=Automated workflow document from n8n&quot;</span> \</span>,
    <span key="5">{'  '}-F <span className="text-[#7ec699]">&quot;source=n8n&quot;</span></span>,
  ]
  const n8nCurlRaw = `curl -X POST "https://api.icebergdb.in/documents/text" \\\n  -H "X-API-Key: ${rawKeyForCopy}" \\\n  -F "collection=n8n_knowledge_base" \\\n  -F "text=Automated workflow document from n8n" \\\n  -F "source=n8n"`

  return (
    <div className="pt-12 sm:pt-14 pb-12 px-4 sm:px-6 max-w-[1008px] mx-auto">
      {/* ── Centered Title & Subtitle (Exact Measured Match to Pinecone) ── */}
      <div className="text-center">
        <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-[-0.02em] text-[var(--text-primary)] leading-tight">
          Get started with Iceberg
        </h1>
        <p className="text-[15.5px] text-[var(--text-primary)] mt-3.5">
          Import data or connect your environment to start building knowledgeable AI.
        </p>
        <p className="text-[15.5px] text-[var(--text-primary)] mt-5">
          Already have vector embeddings?{' '}
          <Link
            to="/collections"
            className="text-[var(--accent)] underline hover:opacity-85 font-normal"
          >
            Configure a new index manually
          </Link>
        </p>
      </div>

      {/* ── Main Bordered Quickstart Container (960px wide, 32px padding -> 4 x 212px x 148px cards) ── */}
      <div className="mt-7 pc-card p-6 sm:p-8 space-y-6">
        {/* 4 Option Cards (Exact 212x148px, Top-Aligned so all titles & descriptions align horizontally) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Local files */}
          <button
            type="button"
            onClick={() => { setMode('files'); setStatusMsg(null) }}
            className={`text-left pt-[18px] pb-[18px] px-[17px] rounded-[2px] border flex flex-col items-start justify-start h-[148px] cursor-pointer ${
              mode === 'files'
                ? 'border-[1.5px] border-[var(--accent)] bg-[var(--card-bg)]'
                : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border2)]'
            }`}
          >
            <div className="h-[30px] flex items-center text-[var(--text-primary)]">
              <svg width="23" height="29" viewBox="0 0 23 29" fill="none" className="text-[var(--text-primary)]">
                <path
                  d="M2 1.5H14.5L21 8V26.5C21 27.05 20.55 27.5 20 27.5H3C2.45 27.5 2 27.05 2 26.5V1.5Z"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                <path d="M13.5 1.5L21 9H13.5V1.5Z" fill="currentColor" />
                <path d="M11.5 13L6 19H10V25H13V19H17L11.5 13Z" fill="currentColor" />
              </svg>
            </div>
            <div className="mt-[15px] text-[15.5px] font-bold leading-[1.2] text-[var(--text-primary)]">
              Local files
            </div>
            <div className="mt-[11px] text-[14px] text-[var(--text-secondary)] leading-[1.45]">
              Upload, parse, and chunk files from your computer
            </div>
          </button>

          {/* Card 2: Import */}
          <button
            type="button"
            onClick={() => { setMode('text'); setStatusMsg(null) }}
            className={`text-left pt-[18px] pb-[18px] px-[17px] rounded-[2px] border flex flex-col items-start justify-start h-[148px] cursor-pointer ${
              mode === 'text'
                ? 'border-[1.5px] border-[var(--accent)] bg-[var(--card-bg)]'
                : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border2)]'
            }`}
          >
            <div className="h-[30px] flex items-center text-[var(--text-primary)]">
              <svg width="35" height="24" viewBox="0 0 35 24" fill="none" className="text-[var(--text-primary)]">
                <path
                  d="M9 21.5H26.5C29.8 21.5 32.5 18.8 32.5 15.5C32.5 12.4 30.1 9.8 27.1 9.5C26.2 5.2 22.4 2 17.8 2C13.1 2 9.2 5.4 8.4 9.9C5.1 10.3 2.5 13.1 2.5 16.5C2.5 19.3 4.8 21.5 9 21.5Z"
                  stroke="currentColor"
                  strokeWidth="2.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M17.5 8.5L12 14H15.3V18.5H19.7V14H23L17.5 8.5Z" fill="currentColor" />
              </svg>
            </div>
            <div className="mt-[15px] text-[15.5px] font-bold leading-[1.2] text-[var(--text-primary)]">
              Import
            </div>
            <div className="mt-[11px] text-[14px] text-[var(--text-secondary)] leading-[1.45]">
              Ingest from S3, Google Cloud, or Azure
            </div>
          </button>

          {/* Card 3: Connect */}
          <button
            type="button"
            onClick={() => { setMode('connect'); setStatusMsg(null) }}
            className={`text-left pt-[18px] pb-[18px] px-[17px] rounded-[2px] border flex flex-col items-start justify-start h-[148px] cursor-pointer ${
              mode === 'connect'
                ? 'border-[1.5px] border-[var(--accent)] bg-[var(--card-bg)]'
                : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border2)]'
            }`}
          >
            <div className="h-[30px] flex items-center text-[var(--text-primary)]">
              <svg width="29" height="19" viewBox="0 0 29 19" fill="none" className="text-[var(--text-primary)]">
                <polyline points="10 2 2 9.5 10 17" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="19 2 27 9.5 19 17" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-[15px] text-[15.5px] font-bold leading-[1.2] text-[var(--text-primary)]">
              Connect
            </div>
            <div className="mt-[11px] text-[14px] text-[var(--text-secondary)] leading-[1.45]">
              Connect an agent, SDK, or n8n workflow
            </div>
          </button>

          {/* Card 4: Sample data (Exact 27x27 outer frame + 4 solid 6x6 squares with 3px gaps) */}
          <button
            type="button"
            onClick={() => { setMode('sample'); setStatusMsg(null) }}
            className={`text-left pt-[18px] pb-[18px] px-[17px] rounded-[2px] border flex flex-col items-start justify-start h-[148px] cursor-pointer ${
              mode === 'sample'
                ? 'border-[1.5px] border-[var(--accent)] bg-[var(--card-bg)]'
                : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border2)]'
            }`}
          >
            <div className="h-[30px] flex items-center text-[var(--text-primary)]">
              <svg width="27" height="27" viewBox="0 0 27 27" fill="none" className="text-[var(--text-primary)]">
                <rect x="1.5" y="1.5" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2.8" />
                <rect x="6" y="6" width="6" height="6" fill="currentColor" />
                <rect x="15" y="6" width="6" height="6" fill="currentColor" />
                <rect x="6" y="15" width="6" height="6" fill="currentColor" />
                <rect x="15" y="15" width="6" height="6" fill="currentColor" />
              </svg>
            </div>
            <div className="mt-[15px] text-[15.5px] font-bold leading-[1.2] text-[var(--text-primary)]">
              Sample data
            </div>
            <div className="mt-[11px] text-[14px] text-[var(--text-secondary)] leading-[1.45]">
              Explore Iceberg with a sample dataset
            </div>
          </button>
        </div>

        {/* ── MODE 1: LOCAL FILES (Exact Match to Pinecone Screenshot 4) ── */}
        {mode === 'files' && (
          <div className="space-y-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border rounded-[2px] py-16 sm:py-20 px-6 text-center cursor-pointer ${
                dragActive
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border2)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.md,.txt,.csv,.json"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
              />
              <div className="h-[30px] mx-auto mb-3.5 flex items-center justify-center text-[var(--text-primary)]">
                <svg width="35" height="24" viewBox="0 0 35 24" fill="none" className="text-[var(--text-primary)]">
                  <path
                    d="M9 21.5H26.5C29.8 21.5 32.5 18.8 32.5 15.5C32.5 12.4 30.1 9.8 27.1 9.5C26.2 5.2 22.4 2 17.8 2C13.1 2 9.2 5.4 8.4 9.9C5.1 10.3 2.5 13.1 2.5 16.5C2.5 19.3 4.8 21.5 9 21.5Z"
                    stroke="currentColor"
                    strokeWidth="2.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M17.5 8.5L12 14H15.3V18.5H19.7V14H23L17.5 8.5Z" fill="currentColor" />
                </svg>
              </div>
              <p className="text-[17px] font-semibold text-[var(--text-primary)]">
                Drag &amp; drop or <span className="text-[var(--accent)] hover:underline">choose files</span> to upload
              </p>
              <p className="text-[13.5px] text-[var(--text-secondary)] mt-2.5">
                Supports PDF, Markdown, and text files. Limit of 25 per upload (250 MB total).
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="border border-[var(--border)] rounded-[2px] divide-y divide-[var(--border)] bg-[var(--bg-surface)]">
                {selectedFiles.map((f, idx) => (
                  <div key={`${f.name}-${idx}`} className="px-4 py-2.5 flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[var(--text-primary)] truncate">{f.name}</span>
                      <span className="text-[var(--text-muted)] shrink-0">
                        ({Math.max(1, Math.round(f.size / 1024))} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-[var(--text-muted)] hover:text-red-500 transition px-1.5"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedFiles.length === 0 || loading}
                onClick={handleImportFiles}
                className={`px-4 py-2 rounded-[2px] text-[13px] font-medium transition ${
                  selectedFiles.length === 0
                    ? 'bg-[var(--bg-surface2)] text-[var(--text-muted)] cursor-not-allowed'
                    : 'pc-btn-primary'
                }`}
              >
                {loading ? 'Importing files...' : 'Import files'}
              </button>
            </div>
          </div>
        )}

        {/* ── MODE 2: IMPORT TEXT ── */}
        {mode === 'text' && (
          <div className="space-y-4">
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste paragraphs, markdown documents, or knowledge base notes here to automatically chunk and embed..."
              className="input-base text-[14px] leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                <span>Target index:</span>
                <input
                  type="text"
                  value={targetCollection}
                  onChange={(e) => setTargetCollection(e.target.value)}
                  className="px-2.5 py-1 rounded-[2px] border border-[var(--border)] bg-[var(--input-bg)] font-mono text-[14px] text-[var(--text-primary)] w-44"
                />
              </div>
              <button
                type="button"
                disabled={!rawText.trim() || loading}
                onClick={handleImportText}
                className="pc-btn-primary"
              >
                {loading ? 'Importing...' : 'Import text'}
              </button>
            </div>
          </div>
        )}

        {/* ── MODE 3: CONNECT (Exact Pixel Match to Pinecone Connect Screenshots + Dropdown Menus) ── */}
        {mode === 'connect' && (
          <div className="pt-1 space-y-6">
            {/* 1. Top Selector Row: "Code ^" (Code, AI Assist, n8n) and "Node ^" (Node, Python, Java, Go, Shell) */}
            <div ref={dropdownContainerRef} className="flex items-center gap-6 relative">
              {/* Method Dropdown (Code, AI Assist, n8n — Exact 103x115px menu) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMethodMenuOpen((v) => !v)
                    setLangMenuOpen(false)
                  }}
                  className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 cursor-pointer"
                >
                  <span>{currentMethodObj.label}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={methodMenuOpen ? 'rotate-180' : ''}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {methodMenuOpen && (
                  <div className="absolute left-0 top-[30px] min-w-[115px] rounded-[2px] border border-[var(--border)] bg-[var(--card-bg)] py-2.5 z-30 shadow-xl">
                    {CONNECT_METHODS.map((m) => {
                      const active = connectMethod === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setConnectMethod(m.id)
                            setMethodMenuOpen(false)
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-[7px] text-[14.5px] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer ${
                            active ? 'font-bold' : 'font-normal'
                          }`}
                        >
                          <span className="whitespace-nowrap">{m.label}</span>
                          {active && <BlueCheckIcon />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Language Dropdown (Node, Python, Java, Go, Shell — Exact 5 options from Pinecone Screenshot) */}
              {connectMethod === 'code' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setLangMenuOpen((v) => !v)
                      setMethodMenuOpen(false)
                    }}
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 cursor-pointer"
                  >
                    <span>{currentSdk.label}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={langMenuOpen ? 'rotate-180' : ''}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute left-0 top-[30px] min-w-[96px] rounded-[2px] border border-[var(--border)] bg-[var(--card-bg)] py-2.5 z-30 shadow-xl">
                      {SDK_OPTIONS.map((opt) => {
                        const active = sdkLang === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSdkLang(opt.id)
                              setLangMenuOpen(false)
                            }}
                            className={`w-full flex items-center justify-between gap-3 px-3.5 py-[6.5px] text-[14.5px] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer ${
                              active ? 'font-bold' : 'font-normal'
                            }`}
                          >
                            <span className="whitespace-nowrap">{opt.label}</span>
                            {active && <BlueCheckIcon />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. "Using Claude Code?" Callout Banner (Exact 75px height, #050f19 dark blue box with #3e3e3e border) */}
            <div className="rounded-[2px] border border-[var(--border)] bg-[#050f19] min-h-[75px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="text-[#4d9aff] mt-0.5 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.85" />
                    <rect x="9" y="5.4" width="2" height="2" rx="0.4" fill="currentColor" />
                    <rect x="9" y="9" width="2" height="5.6" rx="0.4" fill="currentColor" />
                  </svg>
                </span>
                <div>
                  <div className="text-[15px] font-semibold text-[#4d9aff] leading-[1.35]">
                    {connectMethod === 'ai_assist' ? 'Using an SDK in your application?' : 'Using Claude Code?'}
                  </div>
                  <div className="text-[15px] text-[#4d9aff] mt-1 leading-[1.35]">
                    {connectMethod === 'ai_assist'
                      ? 'Switch back to Code view for Node, Python, Java, Go, and Shell.'
                      : 'Install the Iceberg plugin to get started with MCP, skills, and more.'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConnectMethod(connectMethod === 'ai_assist' ? 'code' : 'ai_assist')}
                className="px-3.5 h-[36px] inline-flex items-center justify-center rounded-[2px] border border-[#1d4ed8]/70 bg-[#071526] hover:bg-[#0c213b] text-[#4d9aff] text-[14px] font-semibold shrink-0 cursor-pointer"
              >
                {connectMethod === 'ai_assist' ? 'Switch to Code' : 'Switch to Claude Code'}
              </button>
            </div>

            {connectMethod === 'code' && (
              <div className="space-y-8 pt-1">
                {/* Step 1: Get your API key */}
                <div>
                  <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
                    Get your API key
                  </h3>
                  <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5">
                    You need an API key for secure access to your project.
                  </p>
                  <div className="mt-3.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGetApiKey}
                      className="inline-flex items-center gap-2.5 px-3.5 h-[36px] rounded-[2px] border border-[var(--border2)] bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] text-[14.5px] font-semibold text-[var(--text-primary)] cursor-pointer"
                    >
                      <span className="text-[17px] leading-none font-normal">+</span>
                      <span>API key</span>
                    </button>
                    {revealedKey && (
                      <span className="text-[13.5px] text-emerald-400 font-medium">
                        {copiedId === 'apikey' ? 'API key copied & injected below!' : 'Active API key injected into snippet below'}
                      </span>
                    )}
                  </div>
                </div>

                {!currentSdk.isShellOnly && (
                  <>
                    {/* Step 2: Install Iceberg */}
                    <div>
                      <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
                        Install Iceberg
                      </h3>
                      <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5">
                        Ready to get started with Iceberg? First, install the {currentSdk.label} SDK:
                      </p>
                      {currentSdk.installLines ? (
                        <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 py-[14px] relative font-mono text-[14px] leading-[21px]">
                          <div className="absolute top-3 right-3">
                            <CopyIconButton
                              copied={copiedId === 'install'}
                              onClick={() => copyText(currentSdk.installCmd, 'install')}
                            />
                          </div>
                          <div className="overflow-x-auto pr-8">
                            {currentSdk.installLines.map((lineEl, idx) => (
                              <div key={idx} className="flex items-start gap-4 whitespace-pre min-h-[21px]">
                                <span className={`text-[#8a8a8a] select-none shrink-0 ${currentSdk.installLines.length >= 10 ? 'w-4 text-right' : ''}`}>{idx + 1}</span>
                                <span className="text-[var(--text-primary)]">{lineEl}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 h-[50px] flex items-center justify-between font-mono text-[14px]">
                          <div className="flex items-center gap-4 min-w-0 overflow-x-auto no-scrollbar">
                            <span className="text-[#8a8a8a] select-none shrink-0">1</span>
                            <span className="text-[var(--text-primary)] whitespace-nowrap">{currentSdk.installCmd}</span>
                          </div>
                          <CopyIconButton
                            copied={copiedId === 'install'}
                            onClick={() => copyText(currentSdk.installCmd, 'install')}
                          />
                        </div>
                      )}
                    </div>

                    {/* Step 3: Initialize */}
                    <div>
                      <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
                        Initialize
                      </h3>
                      <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5">
                        Next, use your API key to initialize your client:
                      </p>
                      <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 py-[14px] relative font-mono text-[14px] leading-[21px]">
                        <div className="absolute top-3 right-3">
                          <CopyIconButton
                            copied={copiedId === 'init'}
                            onClick={() => copyText(currentSdk.initRaw(rawKeyForCopy), 'init')}
                          />
                        </div>
                        <div className="overflow-x-auto pr-8">
                          {currentSdk.initLines(displayKey).map((lineEl, idx, arr) => (
                            <div key={idx} className="flex items-start gap-4 whitespace-pre min-h-[21px]">
                              <span className={`text-[#8a8a8a] select-none shrink-0 ${arr.length >= 10 ? 'w-4 text-right' : ''}`}>{idx + 1}</span>
                              <span className="text-[var(--text-primary)]">{lineEl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 4: Create index */}
                <div>
                  <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
                    Create index
                  </h3>
                  <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5 leading-relaxed">
                    {currentSdk.isShellOnly
                      ? 'Ready to get started with Iceberg? Use the code below to '
                      : 'Then '}
                    <Link to="/collections" className="underline text-[var(--text-primary)] hover:text-[var(--accent)]">
                      create an index
                    </Link>{' '}
                    that is integrated with an embedding model hosted by Iceberg. With integrated models, you upsert and search with text and have Iceberg generate vectors automatically.
                  </p>
                  <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 py-[14px] relative font-mono text-[14px] leading-[21px]">
                    <div className="absolute top-3 right-3">
                      <CopyIconButton
                        copied={copiedId === 'create'}
                        onClick={() =>
                          copyText(
                            typeof currentSdk.createRaw === 'function'
                              ? currentSdk.createRaw(revealedKey || 'YOUR_API_KEY')
                              : currentSdk.createRaw,
                            'create'
                          )
                        }
                      />
                    </div>
                    <div className="overflow-x-auto pr-8">
                      {(typeof currentSdk.createLines === 'function'
                        ? currentSdk.createLines(revealedKey || 'YOUR_API_KEY')
                        : currentSdk.createLines
                      ).map((lineEl, idx, arr) => (
                        <div key={idx} className="flex items-start gap-4 whitespace-pre min-h-[21px]">
                          <span className={`text-[#8a8a8a] select-none shrink-0 ${arr.length >= 10 ? 'w-4 text-right' : ''}`}>{idx + 1}</span>
                          <span className="text-[var(--text-primary)]">{lineEl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 5: Support */}
                <div className="pt-1">
                  <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
                    Support
                  </h3>
                  <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5">
                    Now you&apos;re ready to upsert records and start searching. Head to our documentation for detailed information and examples:
                  </p>
                  <ul className="mt-4 space-y-3 pl-5 list-disc marker:text-[var(--text-primary)] text-[15px]">
                    <li>
                      <Link to="/docs" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                        <span>Quickstart</span>
                        <ExternalArrowIcon />
                      </Link>
                    </li>
                    <li>
                      <Link to="/explorer" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                        <span>Upsert data</span>
                        <ExternalArrowIcon />
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings?tab=api" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                        <span>{currentSdk.refLabel}</span>
                        <ExternalArrowIcon />
                      </Link>
                    </li>
                    {currentSdk.hasNotebooks && (
                      <li>
                        <Link to="/docs" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                          <span>Example notebooks</span>
                          <ExternalArrowIcon />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {connectMethod === 'ai_assist' && (
              /* AI Assist / Claude Code / MCP Mode (100% real iceberg-mcp server) */
              <div className="space-y-7 pt-1">
                <div>
                  <h3 className="text-[15.5px] font-semibold text-[var(--text-primary)]">
                    Get your API key
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
                    You need an API key for secure access to your project from Claude Code, Cursor, or Windsurf.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGetApiKey}
                      className="inline-flex items-center gap-2 px-3.5 h-[32px] rounded-[2px] border border-[var(--border2)] bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] text-[13.5px] font-semibold text-[var(--text-primary)] cursor-pointer"
                    >
                      <span className="text-[16px] leading-none font-normal">+</span>
                      <span>API key</span>
                    </button>
                    {revealedKey && (
                      <span className="text-[13px] text-emerald-400 font-medium">
                        Active API key injected into MCP command below
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[15.5px] font-semibold text-[var(--text-primary)]">
                    Add Iceberg MCP to Claude Code
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
                    Run the following command in your terminal to connect Claude Code directly to your Iceberg project:
                  </p>
                  <div className="mt-3 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 h-[40px] flex items-center justify-between font-mono text-[13px]">
                    <div className="flex items-center gap-4 min-w-0 overflow-x-auto no-scrollbar">
                      <span className="text-[#8a8a8a] select-none shrink-0">1</span>
                      <span className="text-[var(--text-primary)] whitespace-nowrap">
                        claude mcp add iceberg -e ICEBERG_API_KEY={displayKey} -- npx -y iceberg-mcp
                      </span>
                    </div>
                    <CopyIconButton
                      copied={copiedId === 'mcp'}
                      onClick={() =>
                        copyText(
                          `claude mcp add iceberg -e ICEBERG_API_KEY=${rawKeyForCopy} -- npx -y iceberg-mcp`,
                          'mcp'
                        )
                      }
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <h3 className="text-[15.5px] font-semibold text-[var(--text-primary)]">
                    Support
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
                    Explore MCP tools for vector search, collection management, and 4-tier agent memory:
                  </p>
                  <ul className="mt-3.5 space-y-2.5 pl-5 list-disc marker:text-[var(--text-primary)] text-[14px]">
                    <li>
                      <Link to="/docs" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                        <span>Quickstart</span>
                        <ExternalArrowIcon />
                      </Link>
                    </li>
                    <li>
                      <Link to="/memory" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                        <span>Agent Memory</span>
                        <ExternalArrowIcon />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {connectMethod === 'n8n' && (
              /* n8n Workflow Mode (100% real Iceberg REST endpoints for n8n HTTP Request node) */
              <div className="space-y-7 pt-1">
                <div>
                  <h3 className="text-[15.5px] font-semibold text-[var(--text-primary)]">
                    Get your API key
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
                    You need an API key to authenticate n8n HTTP Request nodes against your Iceberg project.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGetApiKey}
                      className="inline-flex items-center gap-2 px-3.5 h-[32px] rounded-[2px] border border-[var(--border2)] bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] text-[13.5px] font-semibold text-[var(--text-primary)] cursor-pointer"
                    >
                      <span className="text-[16px] leading-none font-normal">+</span>
                      <span>API key</span>
                    </button>
                    {revealedKey && (
                      <span className="text-[13px] text-emerald-400 font-medium">
                        Active API key injected into n8n request below
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[15.5px] font-semibold text-[var(--text-primary)]">
                    Import into n8n HTTP Request node
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
                    In n8n, add an <strong>HTTP Request</strong> node, click <strong>Import cURL</strong>, and paste the request below:
                  </p>
                  <div className="mt-3 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 py-3 relative font-mono text-[13px] leading-[1.65]">
                    <div className="absolute top-2.5 right-2.5">
                      <CopyIconButton
                        copied={copiedId === 'n8n_curl'}
                        onClick={() => copyText(n8nCurlRaw, 'n8n_curl')}
                      />
                    </div>
                    <div className="overflow-x-auto pr-8">
                      {n8nCurlLines.map((lineEl, idx) => (
                        <div key={idx} className="flex items-start gap-4 whitespace-pre">
                          <span className="text-[#8a8a8a] select-none w-4 text-right shrink-0">{idx + 1}</span>
                          <span className="text-[var(--text-primary)]">{lineEl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <h3 className="text-[15.5px] font-semibold text-[var(--text-primary)]">
                    Support
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
                    Head to our documentation for full REST endpoint specifications:
                  </p>
                  <ul className="mt-3.5 space-y-2.5 pl-5 list-disc marker:text-[var(--text-primary)] text-[14px]">
                    <li>
                      <Link to="/docs" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                        <span>Quickstart</span>
                        <ExternalArrowIcon />
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings?tab=api" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium">
                        <span>REST API reference</span>
                        <ExternalArrowIcon />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MODE 4: SAMPLE DATA ── */}
        {mode === 'sample' && (
          <div className="space-y-4">
            <div className="p-5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-base)]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Iceberg AI &amp; Hybrid Search Sample Dataset
                </span>
                <span className="text-[13px] font-mono px-2 py-0.5 rounded-[2px] bg-[var(--bg-surface2)] border border-[var(--border)] text-[var(--text-secondary)]">
                  {SAMPLE_DATASET.length} documents · 384d
                </span>
              </div>
              <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                Pre-built collection of technical documents covering hybrid dense + BM25 search, 4-tier agent memory, and RBAC authentication so you can immediately evaluate semantic retrieval in Query Explorer.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={handleLoadSampleData}
                className="pc-btn-primary"
              >
                {loading ? 'Loading sample dataset...' : 'Load sample dataset'}
              </button>
            </div>
          </div>
        )}

        {/* ── Status Feedback Banner ── */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-[2px] border text-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              statusMsg.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'border-red-500/30 bg-red-500/10 text-red-500'
            }`}
          >
            <span>{statusMsg.text}</span>
            {statusMsg.collection && (
              <button
                type="button"
                onClick={() => navigate(`/explorer?collection=${encodeURIComponent(statusMsg.collection)}`)}
                className="pc-btn-primary shrink-0"
              >
                Open Query Explorer →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BlueCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CopyIconButton({ copied, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={copied ? 'Copied!' : 'Copy code'}
      className="w-7 h-7 rounded-[2px] hover:bg-[var(--bg-hover)] inline-flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
    >
      {copied ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

function ExternalArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  )
}

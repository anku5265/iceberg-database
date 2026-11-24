import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import { Link, useSearchParams } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import IcebergLogo from '../components/IcebergLogo'

const CHAT_MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai', model: 'gpt-4o', needsKey: false },
  { id: 'gpt-4o-mini', label: 'GPT-4o-mini', provider: 'openai', model: 'gpt-4o-mini', needsKey: false },
  { id: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet', provider: 'claude', model: 'claude-3-7-sonnet-latest', needsKey: false },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'claude', model: 'claude-3-5-sonnet-latest', needsKey: false },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'gemini', model: 'gemini-2.0-flash', needsKey: false },
  { id: 'llama-3.3-70b', label: 'Llama 3.3 70B (Groq)', provider: 'groq', model: 'llama-3.3-70b-versatile', needsKey: false },
  { id: 'deepseek-chat', label: 'DeepSeek-V3', provider: 'deepseek', model: 'deepseek-chat', needsKey: false },
  { id: 'iceberg-native', label: 'Iceberg Native AI (ap-south-1)', provider: 'iceberg_fast', model: 'all-MiniLM-L6-v2', needsKey: false },
]

const CODE_LANGUAGES = [
  { id: 'shell', label: 'Shell' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node' },
  { id: 'java', label: 'Java' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'dotnet', label: '.NET' },
]

const FILTER_OPERATORS = ['==', '!=', '>', '>=', '<', '<=', '$in', '$nin']

const FILTER_VALUE_TYPES = [
  { id: 'string', label: 'String' },
  { id: 'number', label: 'Number' },
  { id: 'boolean', label: 'Boolean' },
]

function createEmptyFilterRow() {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    key: '',
    op: '==',
    value: '',
    valueType: 'string',
    subfilters: [],
  }
}

function evaluateSingleCondition(hit, cond) {
  const k = (cond.key || '').trim()
  const rawVal = (cond.value || '').trim()
  if (!k || !rawVal) return true

  const meta = hit?.metadata || {}
  let actual = meta[k] ?? hit?.[k]
  if (actual === undefined && ['source', 'file', 'filename', 'file_name'].includes(k.toLowerCase())) {
    actual = meta.source || hit?.source || ''
  }
  const actualStr = String(actual ?? '').toLowerCase()
  const targetStr = rawVal.toLowerCase()
  const op = cond.op || '=='

  if (op === '==') return actualStr === targetStr || actualStr.includes(targetStr)
  if (op === '!=') return actualStr !== targetStr
  if (op === '>') return parseFloat(actual) > parseFloat(rawVal)
  if (op === '>=') return parseFloat(actual) >= parseFloat(rawVal)
  if (op === '<') return parseFloat(actual) < parseFloat(rawVal)
  if (op === '<=') return parseFloat(actual) <= parseFloat(rawVal)
  if (op === '$in') {
    const items = targetStr.split(',').map(s => s.trim()).filter(Boolean)
    return items.some(item => actualStr === item || actualStr.includes(item))
  }
  if (op === '$nin') {
    const items = targetStr.split(',').map(s => s.trim()).filter(Boolean)
    return !items.some(item => actualStr === item || actualStr.includes(item))
  }
  return true
}

function matchesMetadataFilters(hit, filters) {
  if (!Array.isArray(filters) || filters.length === 0) return true
  return filters.every(row => {
    const mainMatch = evaluateSingleCondition(hit, row)
    const subMatches = Array.isArray(row.subfilters)
      ? row.subfilters.every(sub => evaluateSingleCondition(hit, sub))
      : true
    return mainMatch && subMatches
  })
}

const SAMPLE_ICEBERG_DOCS = [
  'Iceberg DB delivers sub-15ms vector query latency hosted in India (ap-south-1).',
  'Hybrid Search in Iceberg DB combines 384-dimensional dense semantic embeddings (all-MiniLM-L6-v2 Cosine similarity) with sparse BM25 keyword matching using Reciprocal Rank Fusion (RRF).',
  'Server-side CPU embeddings are built directly into Iceberg DB at zero extra cost — developers can send raw text or PDFs without needing an external OpenAI embedding API key.',
  'Iceberg Agent Memory provides 4 cognitive persistence tiers: short_term, episodic, long_term, and semantic memory via /remember and /recall endpoints.',
  'Iceberg DB provides official open-source SDKs for Python (pip install icebergdb), JavaScript/TypeScript (npm install iceberg-js), Rust, .NET, Java, and Model Context Protocol (MCP).',
]

function getChatModelMeta(modelId) {
  return CHAT_MODELS.find(m => m.id === modelId || m.model === modelId) || CHAT_MODELS[0]
}

function synthesizeNativeRagAnswer(question, hits, assistantName) {
  const q = question.trim().toLowerCase()
  if (/^(hi|hello|hey|namaste|namaskar|namaskaram|hola|yo)\b/.test(q) && q.split(/\s+/).length <= 3) {
    return `Namaskar! I am ${assistantName}. Ask me any question about the documents indexed in my vector collection, and I will retrieve the relevant passages using Hybrid RRF search.`
  }
  if (!hits || hits.length === 0) {
    return `No matching context was found in the vector index for "${question}". Try uploading a document or loading sample data in the Files drawer on the right.`
  }
  const top = hits[0]
  if (hits.length === 1 || (top.score && top.score > 0.62)) {
    const extra = hits[1] && hits[1].text !== top.text ? `\n\nAdditional context: ${hits[1].text}` : ''
    return `${top.text}${extra}`
  }
  return hits
    .slice(0, 3)
    .map((h, idx) => `${idx + 1}. ${h.text}`)
    .join('\n\n')
}

function buildUploadSnippet(lang, asstName) {
  const slug = (asstName || 'ankush').trim()
  if (lang === 'python') {
    return {
      raw: `from iceberg import Iceberg\n\nic = Iceberg(api_key="YOUR_API_KEY")\nassistant = ic.assistant.Assistant(assistant_name="${slug}")\n\nresponse = assistant.upload_file(\n    file_path="/Users/jdoe/Downloads/example_file.txt",\n    timeout=None\n)`,
      lines: [
        [{ t: 'from ', c: '#c586c0' }, { t: 'iceberg ', c: '#dcdcaa' }, { t: 'import ', c: '#c586c0' }, { t: 'Iceberg', c: '#4ec9b0' }],
        [],
        [{ t: 'ic = ', c: '#d4d4d4' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(api_key=', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'assistant = ic.assistant.', c: '#d4d4d4' }, { t: 'Assistant', c: '#4ec9b0' }, { t: '(assistant_name=', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [],
        [{ t: 'response = assistant.', c: '#d4d4d4' }, { t: 'upload_file', c: '#61afef' }, { t: '(', c: '#d4d4d4' }],
        [{ t: '    file_path=', c: '#d4d4d4' }, { t: '"/Users/jdoe/Downloads/example_file.txt"', c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '    timeout=', c: '#d4d4d4' }, { t: 'None', c: '#569cd6' }],
        [{ t: ')', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'node') {
    return {
      raw: `import { Iceberg } from 'iceberg-js';\n\nconst ic = new Iceberg({ apiKey: 'YOUR_API_KEY' });\nconst assistant = ic.Assistant('${slug}');\n\nawait assistant.uploadFile({\n  path: '/Users/jdoe/Downloads/example_file.txt'\n});`,
      lines: [
        [{ t: 'import ', c: '#c586c0' }, { t: '{ Iceberg } ', c: '#d4d4d4' }, { t: 'from ', c: '#c586c0' }, { t: "'iceberg-js'", c: '#a5d6a7' }, { t: ';', c: '#d4d4d4' }],
        [],
        [{ t: 'const ', c: '#569cd6' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '({ apiKey: ', c: '#d4d4d4' }, { t: "'YOUR_API_KEY'", c: '#a5d6a7' }, { t: ' });', c: '#d4d4d4' }],
        [{ t: 'const ', c: '#569cd6' }, { t: 'assistant = ic.', c: '#d4d4d4' }, { t: 'Assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `'${slug}'`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [],
        [{ t: 'await ', c: '#c586c0' }, { t: 'assistant.', c: '#d4d4d4' }, { t: 'uploadFile', c: '#61afef' }, { t: '({', c: '#d4d4d4' }],
        [{ t: '  path: ', c: '#d4d4d4' }, { t: "'/Users/jdoe/Downloads/example_file.txt'", c: '#a5d6a7' }],
        [{ t: '});', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'java') {
    return {
      raw: `import in.iceberg.Iceberg;\nimport java.nio.file.Paths;\n\nIceberg ic = new Iceberg("YOUR_API_KEY");\nic.uploadAssistantFile("${slug}", Paths.get("/Users/jdoe/Downloads/example_file.txt"));`,
      lines: [
        [{ t: 'import ', c: '#c586c0' }, { t: 'in.iceberg.Iceberg;', c: '#d4d4d4' }],
        [{ t: 'import ', c: '#c586c0' }, { t: 'java.nio.file.Paths;', c: '#d4d4d4' }],
        [],
        [{ t: 'Iceberg ', c: '#4ec9b0' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'ic.', c: '#d4d4d4' }, { t: 'uploadAssistantFile', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', Paths.get(', c: '#d4d4d4' }, { t: '"/Users/jdoe/Downloads/example_file.txt"', c: '#a5d6a7' }, { t: '));', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'go') {
    return {
      raw: `client := iceberg.NewClient("YOUR_API_KEY")\nasst := client.Assistant("${slug}")\nerr := asst.UploadFile(ctx, "/Users/jdoe/Downloads/example_file.txt")`,
      lines: [
        [{ t: 'client := iceberg.', c: '#d4d4d4' }, { t: 'NewClient', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'asst := client.', c: '#d4d4d4' }, { t: 'Assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'err := asst.', c: '#d4d4d4' }, { t: 'UploadFile', c: '#61afef' }, { t: '(ctx, ', c: '#d4d4d4' }, { t: '"/Users/jdoe/Downloads/example_file.txt"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'rust') {
    return {
      raw: `let client = icebergdb::Client::new("YOUR_API_KEY");\nlet asst = client.assistant("${slug}");\nasst.upload_file("/Users/jdoe/Downloads/example_file.txt").await?;`,
      lines: [
        [{ t: 'let ', c: '#569cd6' }, { t: 'client = icebergdb::Client::', c: '#d4d4d4' }, { t: 'new', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'let ', c: '#569cd6' }, { t: 'asst = client.', c: '#d4d4d4' }, { t: 'assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'asst.', c: '#d4d4d4' }, { t: 'upload_file', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"/Users/jdoe/Downloads/example_file.txt"', c: '#a5d6a7' }, { t: ').', c: '#d4d4d4' }, { t: 'await', c: '#c586c0' }, { t: '?;', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'dotnet') {
    return {
      raw: `using IcebergDb;\n\nvar client = new IcebergClient("YOUR_API_KEY");\nvar asst = client.Assistant("${slug}");\nawait asst.UploadFileAsync("/Users/jdoe/Downloads/example_file.txt");`,
      lines: [
        [{ t: 'using ', c: '#c586c0' }, { t: 'IcebergDb;', c: '#d4d4d4' }],
        [],
        [{ t: 'var ', c: '#569cd6' }, { t: 'client = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'IcebergClient', c: '#4ec9b0' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'var ', c: '#569cd6' }, { t: 'asst = client.', c: '#d4d4d4' }, { t: 'Assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'await ', c: '#c586c0' }, { t: 'asst.', c: '#d4d4d4' }, { t: 'UploadFileAsync', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"/Users/jdoe/Downloads/example_file.txt"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
      ],
    }
  }

  // Default: Shell (Exact 7 lines with Iceberg's X-API-Key header)
  const raw = `ICEBERG_API_KEY="YOUR_API_KEY"\nLOCAL_FILE_PATH="/Users/jdoe/Downloads/example_file.txt"\n\ncurl -X POST \\\n  "${API_URL}/assistant/files/${slug}" \\\n  -H "X-API-Key: $ICEBERG_API_KEY" \\\n  -F "file=@$LOCAL_FILE_PATH"`
  return {
    raw,
    lines: [
      [{ t: 'ICEBERG_API_KEY=', c: '#61afef' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }],
      [{ t: 'LOCAL_FILE_PATH=', c: '#61afef' }, { t: '"/Users/jdoe/Downloads/example_file.txt"', c: '#a5d6a7' }],
      [],
      [{ t: 'curl', c: '#c586c0' }, { t: ' -X ', c: '#61afef' }, { t: 'POST \\', c: '#d4d4d4' }],
      [{ t: `  "${API_URL}/assistant/files/${slug}"`, c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -H ', c: '#61afef' }, { t: '"X-API-Key: $ICEBERG_API_KEY"', c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -F ', c: '#61afef' }, { t: '"file=@$LOCAL_FILE_PATH"', c: '#a5d6a7' }],
    ],
  }
}

function buildChatSnippet(lang, asstName, chatModelId = 'gpt-4o') {
  const slug = (asstName || 'ankush').trim()
  const modelStr = chatModelId || 'gpt-4o'

  if (lang === 'python') {
    return {
      raw: `from iceberg import Iceberg\n\nic = Iceberg(api_key="YOUR_API_KEY")\nassistant = ic.assistant.Assistant(assistant_name="${slug}")\n\nresp = assistant.chat(\n    messages=[{"role": "user", "content": "What is the inciting incident of Pride and Prejudice?"}],\n    model="${modelStr}"\n)\nprint(resp["message"]["content"])`,
      lines: [
        [{ t: 'from ', c: '#c586c0' }, { t: 'iceberg ', c: '#dcdcaa' }, { t: 'import ', c: '#c586c0' }, { t: 'Iceberg', c: '#4ec9b0' }],
        [],
        [{ t: 'ic = ', c: '#d4d4d4' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(api_key=', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'assistant = ic.assistant.', c: '#d4d4d4' }, { t: 'Assistant', c: '#4ec9b0' }, { t: '(assistant_name=', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [],
        [{ t: 'resp = assistant.', c: '#d4d4d4' }, { t: 'chat', c: '#61afef' }, { t: '(', c: '#d4d4d4' }],
        [{ t: '    messages=[{', c: '#d4d4d4' }, { t: '"role"', c: '#a5d6a7' }, { t: ': ', c: '#d4d4d4' }, { t: '"user"', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"content"', c: '#a5d6a7' }, { t: ': ', c: '#d4d4d4' }, { t: '"What is the inciting incident of Pride and Prejudice?"', c: '#a5d6a7' }, { t: '}],', c: '#d4d4d4' }],
        [{ t: '    model=', c: '#d4d4d4' }, { t: `"${modelStr}"`, c: '#a5d6a7' }],
        [{ t: ')', c: '#d4d4d4' }],
        [{ t: 'print', c: '#61afef' }, { t: '(resp[', c: '#d4d4d4' }, { t: '"message"', c: '#a5d6a7' }, { t: '][', c: '#d4d4d4' }, { t: '"content"', c: '#a5d6a7' }, { t: '])', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'node') {
    return {
      raw: `import { Iceberg } from 'iceberg-js';\n\nconst ic = new Iceberg({ apiKey: 'YOUR_API_KEY' });\nconst assistant = ic.Assistant('${slug}');\n\nconst chatResp = await assistant.chat({\n  messages: [{ role: 'user', content: 'What is the inciting incident of Pride and Prejudice?' }],\n  model: '${modelStr}'\n});\nconsole.log(chatResp);`,
      lines: [
        [{ t: 'import ', c: '#c586c0' }, { t: '{ Iceberg } ', c: '#d4d4d4' }, { t: 'from ', c: '#c586c0' }, { t: "'iceberg-js'", c: '#a5d6a7' }, { t: ';', c: '#d4d4d4' }],
        [],
        [{ t: 'const ', c: '#569cd6' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '({ apiKey: ', c: '#d4d4d4' }, { t: "'YOUR_API_KEY'", c: '#a5d6a7' }, { t: ' });', c: '#d4d4d4' }],
        [{ t: 'const ', c: '#569cd6' }, { t: 'assistant = ic.', c: '#d4d4d4' }, { t: 'Assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `'${slug}'`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [],
        [{ t: 'const ', c: '#569cd6' }, { t: 'chatResp = ', c: '#d4d4d4' }, { t: 'await ', c: '#c586c0' }, { t: 'assistant.', c: '#d4d4d4' }, { t: 'chat', c: '#61afef' }, { t: '({', c: '#d4d4d4' }],
        [{ t: '  messages: [{ role: ', c: '#d4d4d4' }, { t: "'user'", c: '#a5d6a7' }, { t: ', content: ', c: '#d4d4d4' }, { t: "'What is the inciting incident of Pride and Prejudice?'", c: '#a5d6a7' }, { t: ' }],', c: '#d4d4d4' }],
        [{ t: '  model: ', c: '#d4d4d4' }, { t: `'${modelStr}'`, c: '#a5d6a7' }],
        [{ t: '});', c: '#d4d4d4' }],
        [{ t: 'console.', c: '#d4d4d4' }, { t: 'log', c: '#61afef' }, { t: '(chatResp);', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'java') {
    return {
      raw: `Iceberg ic = new Iceberg("YOUR_API_KEY");\nString reply = ic.chatAssistant("${slug}", "What is the inciting incident of Pride and Prejudice?");\nSystem.out.println(reply);`,
      lines: [
        [{ t: 'Iceberg ', c: '#4ec9b0' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'String ', c: '#4ec9b0' }, { t: 'reply = ic.', c: '#d4d4d4' }, { t: 'chatAssistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"What is the inciting incident of Pride and Prejudice?"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'System.out.', c: '#d4d4d4' }, { t: 'println', c: '#61afef' }, { t: '(reply);', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'go') {
    return {
      raw: `asst := client.Assistant("${slug}")\nresp, err := asst.Chat(ctx, "What is the inciting incident of Pride and Prejudice?")\nfmt.Println(resp.Message.Content)`,
      lines: [
        [{ t: 'asst := client.', c: '#d4d4d4' }, { t: 'Assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'resp, err := asst.', c: '#d4d4d4' }, { t: 'Chat', c: '#61afef' }, { t: '(ctx, ', c: '#d4d4d4' }, { t: '"What is the inciting incident of Pride and Prejudice?"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'fmt.', c: '#d4d4d4' }, { t: 'Println', c: '#61afef' }, { t: '(resp.Message.Content)', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'rust') {
    return {
      raw: `let asst = client.assistant("${slug}");\nlet resp = asst.chat("What is the inciting incident of Pride and Prejudice?").await?;\nprintln!("{}", resp.content);`,
      lines: [
        [{ t: 'let ', c: '#569cd6' }, { t: 'asst = client.', c: '#d4d4d4' }, { t: 'assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'let ', c: '#569cd6' }, { t: 'resp = asst.', c: '#d4d4d4' }, { t: 'chat', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"What is the inciting incident of Pride and Prejudice?"', c: '#a5d6a7' }, { t: ').', c: '#d4d4d4' }, { t: 'await', c: '#c586c0' }, { t: '?;', c: '#d4d4d4' }],
        [{ t: 'println!', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"{}"', c: '#a5d6a7' }, { t: ', resp.content);', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'dotnet') {
    return {
      raw: `var asst = client.Assistant("${slug}");\nvar resp = await asst.ChatAsync("What is the inciting incident of Pride and Prejudice?");\nConsole.WriteLine(resp.Content);`,
      lines: [
        [{ t: 'var ', c: '#569cd6' }, { t: 'asst = client.', c: '#d4d4d4' }, { t: 'Assistant', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'var ', c: '#569cd6' }, { t: 'resp = ', c: '#d4d4d4' }, { t: 'await ', c: '#c586c0' }, { t: 'asst.', c: '#d4d4d4' }, { t: 'ChatAsync', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"What is the inciting incident of Pride and Prejudice?"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'Console.', c: '#d4d4d4' }, { t: 'WriteLine', c: '#61afef' }, { t: '(resp.Content);', c: '#d4d4d4' }],
      ],
    }
  }

  // Default: Shell (Exact 15 lines matching Screenshots 1, 2, 3 with Iceberg's X-API-Key header)
  const raw = `ICEBERG_API_KEY="YOUR_API_KEY"\n\ncurl "${API_URL}/assistant/chat/${slug}" \\\n  -H "X-API-Key: $ICEBERG_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n  "messages": [\n    {\n      "role": "user",\n      "content": "What is the inciting incident of Pride and Prejudice?"\n    }\n  ],\n  "stream": false,\n  "model": "${modelStr}"\n}'`
  return {
    raw,
    lines: [
      [{ t: 'ICEBERG_API_KEY=', c: '#61afef' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }],
      [],
      [{ t: 'curl', c: '#c586c0' }, { t: ` "${API_URL}/assistant/chat/${slug}"`, c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -H ', c: '#61afef' }, { t: '"X-API-Key: $ICEBERG_API_KEY"', c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -H ', c: '#61afef' }, { t: '"Content-Type: application/json"', c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -d ', c: '#61afef' }, { t: "'{", c: '#a5d6a7' }],
      [{ t: '  "messages": [', c: '#a5d6a7' }],
      [{ t: '    {', c: '#a5d6a7' }],
      [{ t: '      "role": "user",', c: '#a5d6a7' }],
      [{ t: '      "content": "What is the inciting incident of Pride and Prejudice?"', c: '#a5d6a7' }],
      [{ t: '    }', c: '#a5d6a7' }],
      [{ t: '  ],', c: '#a5d6a7' }],
      [{ t: '  "stream": false,', c: '#a5d6a7' }],
      [{ t: `  "model": "${modelStr}"`, c: '#a5d6a7' }],
      [{ t: "}'", c: '#a5d6a7' }],
    ],
  }
}

export default function Assistants() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Synchronously initialize from localStorage so page reload never flashes between states
  const [assistants, setAssistants] = useState(() => api.getCachedAssistants())
  const [selected, setSelected] = useState(() => {
    const targetName = searchParams.get('assistant')
    if (!targetName) return null
    const cached = api.getCachedAssistants()
    return cached.find(a => a.name === targetName || a.id === targetName) || null
  })
  const [openTableRowId, setOpenTableRowId] = useState(null)
  const tableMenuRef = useRef(null)
  const [colDetails, setColDetails] = useState({})
  const [creating, setCreating] = useState(() => searchParams.get('create') === '1')
  const [regionMenuOpen, setRegionMenuOpen] = useState(false)

  useEffect(() => {
    const targetName = searchParams.get('assistant')
    if (targetName) {
      const match = assistants.find(a => a.name === targetName || a.id === targetName)
      if (match) setSelected(match)
    } else {
      setSelected(null)
    }
    if (searchParams.get('create') === '1') {
      setCreating(true)
      const next = new URLSearchParams(searchParams)
      next.delete('create')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, assistants])

  // Top playground assistant switcher dropdown
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef(null)

  // Right collapsible drawer state ('files' | 'settings' | 'connect')
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [drawerTab, setDrawerTab] = useState('files')
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef(null)
  const [showPasteBox, setShowPasteBox] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Settings tab dropdowns & copy state
  const [chatModelMenuOpen, setChatModelMenuOpen] = useState(false)
  const chatModelRef = useRef(null)
  const [copiedField, setCopiedField] = useState('')

  // Code (<>) tab language dropdown
  const [codeLang, setCodeLang] = useState('shell')
  const [codeLangMenuOpen, setCodeLangMenuOpen] = useState(false)
  const codeLangRef = useRef(null)

  const [indexedChunks, setIndexedChunks] = useState([])
  const [loadingChunks, setLoadingChunks] = useState(false)

  const [form, setForm] = useState({
    name: '',
    region: 'India (ap-south-1)',
    collectionMode: '__auto__',
    greeting: 'Namaskar! How can I help you?',
    llm_provider: 'iceberg_fast',
    llm_api_key: '',
    llm_model: 'all-MiniLM-L6-v2',
    color: '#0a0a0b',
  })
  const [createLoading, setCreateLoading] = useState(false)

  // Settings tab editable state for active assistant
  const [settingsForm, setSettingsForm] = useState({
    instructions: '',
    chat_model_id: 'gpt-4o',
    greeting: 'Namaskar! How can I help you?',
    llm_api_key: '',
  })

  const [uploading, setUploading] = useState(false)
  const [manualText, setManualText] = useState('')
  const [manualSource] = useState('manual_knowledge.txt')
  const [indexingText, setIndexingText] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [seedingDemo, setSeedingDemo] = useState(false)

  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatScrollRef = useRef(null)

  // Bottom "Filter by file metadata" panel state (Matches Screenshot 3)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState([])
  const [draftFilters, setDraftFilters] = useState(() => [createEmptyFilterRow()])
  const [openFilterMenu, setOpenFilterMenu] = useState(null) // e.g. 'op_<id>' | 'type_<id>'

  const handleOpenFilterPanel = () => {
    setDraftFilters(
      appliedFilters.length > 0
        ? JSON.parse(JSON.stringify(appliedFilters))
        : [createEmptyFilterRow()]
    )
    setOpenFilterMenu(null)
    setFilterPanelOpen(true)
  }

  const handleClearAllFilters = () => {
    setDraftFilters([createEmptyFilterRow()])
    setAppliedFilters([])
    setOpenFilterMenu(null)
  }

  const handleCancelFilter = () => {
    setOpenFilterMenu(null)
    setFilterPanelOpen(false)
  }

  const hasValidDraftFilter = draftFilters.some(
    r =>
      (r.key.trim() && r.value.trim()) ||
      (Array.isArray(r.subfilters) && r.subfilters.some(s => s.key.trim() && s.value.trim()))
  )

  const canSetFilter = hasValidDraftFilter || appliedFilters.length > 0

  const handleSetFilter = () => {
    if (!canSetFilter) return
    const valid = draftFilters
      .map(r => ({
        ...r,
        key: r.key.trim(),
        value: r.value.trim(),
        subfilters: (r.subfilters || []).filter(s => s.key.trim() && s.value.trim()),
      }))
      .filter(r => (r.key && r.value) || r.subfilters.length > 0)
    setAppliedFilters(valid)
    setOpenFilterMenu(null)
    setFilterPanelOpen(false)
  }

  const updateFilterRow = (rowId, patch) => {
    setDraftFilters(prev => prev.map(r => (r.id === rowId ? { ...r, ...patch } : r)))
  }

  const removeFilterRow = (rowId) => {
    setDraftFilters(prev => {
      if (prev.length <= 1) return [createEmptyFilterRow()]
      return prev.filter(r => r.id !== rowId)
    })
  }

  const addMetadataFilterRow = () => {
    setDraftFilters(prev => [...prev, createEmptyFilterRow()])
  }

  const addSubfilter = (rowId) => {
    setDraftFilters(prev =>
      prev.map(r =>
        r.id === rowId
          ? {
              ...r,
              subfilters: [
                ...(r.subfilters || []),
                {
                  id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                  key: '',
                  op: '==',
                  value: '',
                  valueType: 'string',
                },
              ],
            }
          : r
      )
    )
  }

  const updateSubfilter = (rowId, subId, patch) => {
    setDraftFilters(prev =>
      prev.map(r =>
        r.id === rowId
          ? {
              ...r,
              subfilters: (r.subfilters || []).map(s => (s.id === subId ? { ...s, ...patch } : s)),
            }
          : r
      )
    )
  }

  const removeSubfilter = (rowId, subId) => {
    setDraftFilters(prev =>
      prev.map(r =>
        r.id === rowId
          ? {
              ...r,
              subfilters: (r.subfilters || []).filter(s => s.id !== subId),
            }
          : r
      )
    )
  }

  const getTargetCollection = (asst) => {
    if (!asst) return ''
    return asst.collection || `_asst_${asst.id}`
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedField(id)
    setTimeout(() => setCopiedField(''), 1800)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setSwitcherOpen(false)
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false)
      }
      if (chatModelRef.current && !chatModelRef.current.contains(e.target)) {
        setChatModelMenuOpen(false)
      }
      if (codeLangRef.current && !codeLangRef.current.contains(e.target)) {
        setCodeLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const load = async () => {
    try {
      const [asstRes, colRes] = await Promise.all([
        api.getAssistants(),
        api.getCollections().catch(() => ({ collections: [] })),
      ])

      const allCols = colRes?.collections || []

      const list = (asstRes?.assistants || []).map(a => ({
        ...a,
        collection: a.collection || `_asst_${a.id}`,
        llm_provider: a.llm_provider || 'iceberg_fast',
        llm_model: a.llm_model || 'all-MiniLM-L6-v2',
        chat_model_id: a.chat_model_id || 'gpt-4o',
        instructions: a.instructions || '',
        color: a.color || '#0a0a0b',
        greeting: a.greeting || 'Namaskar! How can I help you?',
      }))

      setAssistants(list)

      const colsToFetch = Array.from(new Set([...allCols, ...list.map(a => a.collection)]))
      if (colsToFetch.length > 0) {
        const detailsObj = {}
        await Promise.all(
          colsToFetch.map(async (cName) => {
            try {
              const info = await api.getCollection(cName)
              if (info && info.vector_count !== undefined) {
                detailsObj[cName] = info
              }
            } catch {}
          })
        )
        setColDetails(detailsObj)
      }

      setSelected(prev => {
        const targetName = searchParams.get('assistant')
        if (targetName) {
          return list.find(a => a.name === targetName || a.id === targetName) || prev
        }
        if (prev) {
          return list.find(a => a.id === prev.id) || null
        }
        return null
      })
    } catch (err) {
      console.error('Failed to load assistants:', err)
    }
  }

  const loadIndexedChunks = async (asst) => {
    if (!asst) {
      setIndexedChunks([])
      return
    }
    const col = getTargetCollection(asst)
    setLoadingChunks(true)
    try {
      const res = await api.search(col, 'overview guide documentation information system', 8, 'hybrid', 0.5)
      if (res && Array.isArray(res.results)) {
        setIndexedChunks(res.results)
      } else {
        setIndexedChunks([])
      }
    } catch {
      setIndexedChunks([])
    } finally {
      setLoadingChunks(false)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(() => load(), 4500)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    if (selected) {
      const greetText = selected.greeting || 'Namaskar! How can I help you?'
      setChatMessages([
        {
          id: 'greeting',
          role: 'assistant',
          text: greetText,
          sources: [],
          latencyMs: null,
          topScore: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setSettingsForm({
        instructions: selected.instructions || '',
        chat_model_id: selected.chat_model_id || 'gpt-4o',
        greeting: greetText,
        llm_api_key: selected.llm_api_key || '',
      })
      loadIndexedChunks(selected)
    } else {
      setChatMessages([])
      setIndexedChunks([])
    }
  }, [selected?.id, selected?.collection])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, chatLoading])

  const create = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreateLoading(true)
    try {
      const chosenCol =
        form.collectionMode && form.collectionMode !== '__auto__'
          ? form.collectionMode
          : `asst_${form.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20)}`

      const created = await api.createAssistant({
        name: form.name.trim(),
        collection: chosenCol,
        description: 'Iceberg Native AI (ap-south-1)',
        greeting: form.greeting.trim() || 'Namaskar! How can I help you?',
        llm_provider: 'iceberg_fast',
        llm_api_key: form.llm_api_key.trim(),
        llm_model: 'all-MiniLM-L6-v2',
        chat_model_id: 'gpt-4o',
        color: form.color,
      })

      setCreating(false)
      setRegionMenuOpen(false)
      setForm({
        name: '',
        region: 'India (ap-south-1)',
        collectionMode: '__auto__',
        greeting: 'Namaskar! How can I help you?',
        llm_provider: 'iceberg_fast',
        llm_api_key: '',
        llm_model: 'all-MiniLM-L6-v2',
        color: '#0a0a0b',
      })
      await load()
      setSelected(created)
      setSearchParams({ assistant: created.name }, { replace: true })
      setDrawerTab('files')
    } catch (err) {
      console.error(err)
    } finally {
      setCreateLoading(false)
    }
  }

  const updateAssistantSettingsLive = async (patch) => {
    const nextSettings = { ...settingsForm, ...patch }
    setSettingsForm(nextSettings)
    if (!selected) return

    const modelMeta = getChatModelMeta(nextSettings.chat_model_id)
    const cleanGreeting = (nextSettings.greeting || '').trim() || 'Namaskar! How can I help you?'
    const updated = await api.updateAssistant(selected.id, {
      instructions: nextSettings.instructions,
      chat_model_id: nextSettings.chat_model_id,
      llm_provider: modelMeta.provider,
      llm_model: modelMeta.model,
      greeting: cleanGreeting,
      llm_api_key: (nextSettings.llm_api_key || '').trim(),
      updated_at: Math.floor(Date.now() / 1000),
    })
    if (updated) {
      setSelected(updated)
      setAssistants(prev => prev.map(a => (a.id === updated.id ? updated : a)))
      if (patch.greeting !== undefined) {
        setChatMessages(prev =>
          prev.map(m => (m.id === 'greeting' ? { ...m, text: cleanGreeting } : m))
        )
      }
    }
  }

  const handleLaunchDemoBot = async () => {
    setSeedingDemo(true)
    setSwitcherOpen(false)
    try {
      const targetCol = 'asst_iceberg_support'
      const created = await api.createAssistant({
        name: 'Iceberg Tech Support',
        collection: targetCol,
        description: 'Iceberg Native AI (ap-south-1)',
        greeting: 'Namaskar! How can I help you?',
        llm_provider: 'iceberg_fast',
        llm_api_key: '',
        llm_model: 'all-MiniLM-L6-v2',
        chat_model_id: 'gpt-4o',
        color: '#0a0a0b',
      })

      await api.indexBatch(targetCol, SAMPLE_ICEBERG_DOCS, 'iceberg_architecture_guide.md')
      await load()
      setSelected(created)
      setSearchParams({ assistant: created.name }, { replace: true })
      await loadIndexedChunks(created)
    } catch (err) {
      console.error('Failed to launch sample assistant:', err)
    } finally {
      setSeedingDemo(false)
    }
  }

  const handleSeedCurrentAssistant = async () => {
    if (!selected) return
    setSeedingDemo(true)
    setMoreMenuOpen(false)
    const targetCol = getTargetCollection(selected)
    try {
      await api.createCollection(targetCol, `RAG Knowledge Base for ${selected.name}`).catch(() => {})
      await api.indexBatch(targetCol, SAMPLE_ICEBERG_DOCS, 'iceberg_architecture_guide.md')
      setUploadSuccess(`Loaded 5 sample Iceberg DB docs into "${selected.name}".`)
      await load()
      await loadIndexedChunks(selected)
      setTimeout(() => setUploadSuccess(''), 5000)
    } catch {
      setUploadError('Failed to load sample docs')
    } finally {
      setSeedingDemo(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const targetCol = getTargetCollection(deleteTarget)
      await api.deleteAssistant(deleteTarget.id, true, targetCol)
      if (selected?.id === deleteTarget.id) setSelected(null)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const uploadDoc = async (asst, file) => {
    if (!file || !asst) return
    setUploading(true)
    setUploadSuccess('')
    setUploadError('')
    const targetCol = getTargetCollection(asst)
    try {
      await api.createCollection(targetCol, `RAG Knowledge Base for ${asst.name}`).catch(() => {})
      const data = await api.uploadFile(targetCol, file)
      // Also sync to /assistant/files/{id} so direct curl /assistant/chat/{name} queries work out of the box
      try {
        const directForm = new FormData()
        directForm.append('file', file)
        fetch(`${API_URL}/assistant/files/${encodeURIComponent(asst.id || asst.name)}`, {
          method: 'POST',
          headers: { 'X-API-Key': localStorage.getItem('iceberg_api_key') || 'ib_dev_test123' },
          body: directForm,
        }).catch(() => {})
      } catch {}
      const chunksCount = data?.chunks_indexed ?? data?.indexed ?? 'all'
      if (data && (data.chunks_indexed !== undefined || data.indexed !== undefined || data.filename)) {
        setUploadSuccess(`Indexed "${file.name}" (${chunksCount} chunks).`)
        await api.updateAssistant(asst.id, { updated_at: Math.floor(Date.now() / 1000) })
        await load()
        await loadIndexedChunks(asst)
        setTimeout(() => setUploadSuccess(''), 6000)
      } else {
        setUploadError(data?.detail || 'Document upload failed')
      }
    } catch {
      setUploadError('Failed to upload and index document')
    } finally {
      setUploading(false)
    }
  }

  const handleManualTextIngest = async (e) => {
    e.preventDefault()
    if (!manualText.trim() || !selected) return
    setIndexingText(true)
    setUploadSuccess('')
    setUploadError('')
    const targetCol = getTargetCollection(selected)
    try {
      await api.createCollection(targetCol, `RAG Knowledge Base for ${selected.name}`).catch(() => {})
      const res = await api.indexText(targetCol, manualText.trim(), manualSource.trim() || 'manual_entry.txt')
      const count = res?.chunks_indexed ?? 1
      setManualText('')
      setShowPasteBox(false)
      setUploadSuccess(`Indexed ${count} text chunk(s).`)
      await api.updateAssistant(selected.id, { updated_at: Math.floor(Date.now() / 1000) })
      await load()
      await loadIndexedChunks(selected)
      setTimeout(() => setUploadSuccess(''), 5000)
    } catch {
      setUploadError('Failed to index text into collection')
    } finally {
      setIndexingText(false)
    }
  }

  const handleClearChat = () => {
    if (!selected) return
    setChatMessages([
      {
        id: 'greeting',
        role: 'assistant',
        text: selected.greeting || 'Namaskar! How can I help you?',
        sources: [],
        latencyMs: null,
        topScore: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const sendChatMessage = async (presetText = null) => {
    const textToSend = (presetText || chatInput).trim()
    if (!textToSend || !selected || chatLoading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    const targetCol = getTargetCollection(selected)
    const t0 = performance.now()

    try {
      const topK = appliedFilters.length > 0 ? 12 : 4
      const searchRes = await api.search(targetCol, textToSend, topK, 'hybrid', 0.5)
      const measuredMs = Math.max(1, Math.round((performance.now() - t0) * 10) / 10)
      const rawHits = Array.isArray(searchRes?.results) ? searchRes.results : []
      const hits =
        appliedFilters.length > 0
          ? rawHits.filter(h => matchesMetadataFilters(h, appliedFilters)).slice(0, 4)
          : rawHits.slice(0, 4)
      const serverMs = searchRes?.latency_ms || searchRes?.took_ms || measuredMs

      const sources = Array.from(
        new Set(
          hits
            .map(h => h.metadata?.source || h.source || targetCol)
            .filter(Boolean)
        )
      )
      const topScore = hits.length > 0 && hits[0].score !== undefined ? hits[0].score : null
      const contextText = hits.map(h => h.text).join('\n\n')

      const provider = selected.llm_provider || 'openai'
      const apiKey = (selected.llm_api_key || '').trim()
      const model = selected.llm_model || 'gpt-4o'
      const customInstructions = (selected.instructions || '').trim()
      const instructionsPrompt = customInstructions ? `\n\nInstructions: ${customInstructions}` : ''

      let replyText = ''

      if (apiKey && contextText && (provider === 'openai' || provider === 'groq' || provider === 'deepseek')) {
        const endpoint =
          provider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : provider === 'deepseek'
            ? apiKey.startsWith('sk-or-')
              ? 'https://openrouter.ai/api/v1/chat/completions'
              : 'https://api.deepseek.com/chat/completions'
            : 'https://api.openai.com/v1/chat/completions'
        try {
          const llmRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'system',
                  content: `You are ${selected.name}, an AI assistant powered by Iceberg DB.${instructionsPrompt}\nAnswer accurately and concisely using ONLY the retrieved context below:\n\n${contextText}`,
                },
                { role: 'user', content: textToSend },
              ],
            }),
          })
          if (llmRes.ok) {
            const llmJson = await llmRes.json()
            replyText = llmJson?.choices?.[0]?.message?.content || ''
          }
        } catch {}
      } else if (apiKey && contextText && provider === 'gemini') {
        try {
          const geminiModel = model.startsWith('gemini') ? model : 'gemini-2.0-flash'
          const llmRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are ${selected.name}.${instructionsPrompt}\nAnswer using ONLY this retrieved context:\n\n${contextText}\n\nQuestion: ${textToSend}`,
                      },
                    ],
                  },
                ],
              }),
            }
          )
          if (llmRes.ok) {
            const llmJson = await llmRes.json()
            replyText = llmJson?.candidates?.[0]?.content?.parts?.[0]?.text || ''
          }
        } catch {}
      }

      if (!replyText) {
        replyText = synthesizeNativeRagAnswer(textToSend, hits, selected.name)
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: replyText,
          sources,
          latencyMs: serverMs,
          topScore,
          hitsCount: hits.length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Unable to query vector index. Please verify your index has documents.',
          sources: [],
          latencyMs: null,
          topScore: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const selectedCollection = getTargetCollection(selected)
  const selectedVectorCount = colDetails[selectedCollection]?.vector_count ?? indexedChunks.length
  const userMessagesCount = chatMessages.filter(m => m.role === 'user').length
  const showSetupSplash = selectedVectorCount === 0 && userMessagesCount === 0

  const createdTs = (selected?.created_at || Math.floor(Date.now() / 1000)) * 1000
  const updatedTs = (selected?.updated_at || selected?.created_at || Math.floor(Date.now() / 1000)) * 1000
  const createdDateStr = new Date(createdTs).toLocaleDateString('en-US')
  const updatedDateStr = new Date(updatedTs).toLocaleDateString('en-US')

  const hostUrl = selected ? `${API_URL}/assistant/${selected.name}` : ''
  const mcpUrl = selected ? `${API_URL}/mcp/assistants/${selected.name}` : ''

  const currentChatModel = getChatModelMeta(settingsForm.chat_model_id)
  const currentCodeLang = CODE_LANGUAGES.find(l => l.id === codeLang) || CODE_LANGUAGES[0]
  const uploadSnippet = buildUploadSnippet(codeLang, selected?.name || 'ankush')
  const chatSnippet = buildChatSnippet(codeLang, selected?.name || 'ankush', currentChatModel.id)

  // Centered "Set up your new assistant" modal (Matches Screenshot 1 pixel-for-pixel)
  const createModal = creating ? (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !createLoading) {
          setCreating(false)
          setRegionMenuOpen(false)
        }
      }}
    >
      <form
        onSubmit={create}
        className="w-full max-w-[465px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] p-7 shadow-[0_24px_64px_rgba(0,0,0,0.75)] text-left"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold tracking-tight text-white">
            Set up your new assistant
          </h2>
          <button
            type="button"
            onClick={() => {
              setCreating(false)
              setRegionMenuOpen(false)
            }}
            className="w-7 h-7 flex items-center justify-center text-[#cccccc] hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-6">
          <label className="block text-[14.5px] font-semibold text-white mb-2">
            Name your assistant
          </label>
          <input
            autoFocus
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Assistant name"
            className="w-full h-[42px] px-3.5 rounded-[2px] bg-[#222222] border border-[#3a3a3a] focus:border-[#4da3fa] text-[14.5px] text-white placeholder:text-[#737373] outline-none"
          />
        </div>

        <div className="mt-5">
          <label className="flex items-center gap-1.5 text-[14.5px] font-semibold text-white mb-2">
            <span>Region</span>
            <span
              className="text-[#cccccc] inline-flex items-center cursor-help"
              title="Hosted in India (ap-south-1)"
            >
              <InfoCircleIcon size={14} />
            </span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRegionMenuOpen(v => !v)}
              className="w-full h-[42px] px-3.5 rounded-[2px] bg-[#222222] border border-[#3a3a3a] hover:border-[#525252] flex items-center justify-between text-[14.5px] text-[#cccccc] cursor-pointer"
            >
              <span>{form.region}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                {regionMenuOpen ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
            </button>

            {regionMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#222222] border border-[#3a3a3a] rounded-[2px] shadow-2xl py-1.5 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, region: 'India (ap-south-1)' })
                    setRegionMenuOpen(false)
                  }}
                  className="w-full px-3.5 py-2 text-left text-[14px] font-semibold text-white hover:bg-[#2c2c2c] flex items-center justify-between cursor-pointer"
                >
                  <span>India (ap-south-1)</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4da3fa" strokeWidth="2.4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={createLoading || !form.name.trim()}
          className={`mt-6 w-full h-[40px] rounded-[2px] text-[13.5px] font-semibold transition flex items-center justify-center ${
            !form.name.trim() || createLoading
              ? 'bg-[#333333] text-[#888888] cursor-not-allowed'
              : 'bg-white hover:bg-[#e6e6e6] text-[#171717] cursor-pointer'
          }`}
        >
          {createLoading ? 'Creating...' : 'Create assistant'}
        </button>
      </form>
    </div>
  ) : null

  // ── Empty State (0 Assistants) ──
  if (assistants.length === 0) {
    return (
      <div className="py-10 sm:py-12 px-6 sm:px-12 max-w-[1090px] mx-auto text-[var(--text-primary)] relative">
        <div className="bg-[var(--card-bg)] rounded-[2px] min-h-[560px] flex flex-col items-center justify-center text-center px-6 py-16">
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
            Create your first assistant
          </h1>
          <p className="mt-3 text-[15px] text-[var(--text-primary)]">
            Assistants use AI to answer questions about your data.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="pc-btn-primary"
            >
              Create an assistant
            </button>
            <button
              type="button"
              onClick={handleLaunchDemoBot}
              disabled={seedingDemo}
              className="pc-btn-secondary"
            >
              {seedingDemo ? 'Loading sample...' : 'Load sample assistant'}
            </button>
            <Link
              to="/assistants/quickstart"
              className="pc-btn-secondary"
            >
              Quickstart
            </Link>
          </div>
        </div>

        {createModal}
      </div>
    )
  }

  // ── Assistants List Table Page (Exact Match to Screenshot 4: Name | Created | Updated | Host | Actions) ──
  if (!selected) {
    return (
      <div className="pt-[50px] pb-12 px-6 sm:px-[49px] max-w-[1090px] text-[var(--text-primary)] relative">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
            Assistants
          </h1>

          <button
            type="button"
            onClick={() => setCreating(true)}
            className="pc-btn-primary"
          >
            <span>Create an assistant</span>
          </button>
        </div>

        <div
          ref={tableMenuRef}
          className="mt-[25px] border border-[#343434] rounded-[2px] bg-[#1c1c1c] relative"
        >
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="h-[55px] border-b border-[#343434] bg-[#1c1c1c] text-[#cccccc] text-[13px] font-semibold">
                <th className="pl-[18px] pr-3 w-[43%]">Name</th>
                <th className="px-3 w-[12%]">Created</th>
                <th className="px-3 w-[12%]">Updated</th>
                <th className="px-3 w-[23%]">Host</th>
                <th className="px-3 w-[10%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#343434]">
              {assistants.map((a) => {
                const cDate = a.created_at
                  ? new Date(a.created_at * 1000).toLocaleDateString('en-US')
                  : new Date().toLocaleDateString('en-US')
                const uDate = (a.updated_at || a.created_at)
                  ? new Date((a.updated_at || a.created_at) * 1000).toLocaleDateString('en-US')
                  : cDate
                const rowHost = `${API_URL}/assistant/${a.name}`
                const menuOpen = openTableRowId === a.id

                return (
                  <tr
                    key={a.id}
                    onClick={() => {
                      setSelected(a)
                      setSearchParams({ assistant: a.name })
                    }}
                    className="h-[64px] bg-[#1c1c1c] hover:bg-[#222222] transition text-[13px] text-white cursor-pointer"
                  >
                    <td className="pl-[18px] pr-3 truncate">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[#58a6ff] font-normal hover:underline truncate">
                          {a.name}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043] shrink-0" />
                      </div>
                    </td>

                    <td className="px-3 font-normal text-white">
                      {cDate}
                    </td>

                    <td className="px-3 font-normal text-white">
                      {uDate}
                    </td>

                    <td className="px-3 font-normal text-white truncate" title={rowHost}>
                      {rowHost}
                    </td>

                    <td
                      className="px-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenTableRowId(menuOpen ? null : a.id)}
                        className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white cursor-pointer transition ${
                          menuOpen ? 'bg-[#2b2b2b]' : 'hover:bg-[#2a2a2a]'
                        }`}
                        title="Actions"
                      >
                        <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>

                      {menuOpen && (
                        <div className="absolute right-3 top-[52px] w-[142px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.8)] py-2 z-[110] text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenTableRowId(null)
                              setSelected(a)
                              setDrawerTab('settings')
                              setSearchParams({ assistant: a.name })
                            }}
                            className="w-full px-4 py-2 text-left text-[13.5px] font-bold text-white hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            <span>Settings</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenTableRowId(null)
                              setDeleteTarget(a)
                            }}
                            className="w-full px-4 py-2 text-left text-[13.5px] font-bold text-[#cccccc] hover:text-white hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {createModal}

        <ConfirmModal
          open={!!deleteTarget}
          title="Delete assistant?"
          message={
            <div>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-[var(--text-primary)]">{deleteTarget?.name}</span>?
            </div>
          }
          confirmText="Delete assistant"
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    )
  }

  // ── Full-Bleed Assistant Playground + Right Collapsible Drawer ──
  return (
    <div className="h-[calc(100vh-72px)] flex overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] relative">
      {/* Left / Main Playground Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Playground Bar */}
        <div className="h-[60px] px-6 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                setSearchParams({})
              }}
              className="text-[13px] text-[#a0a0a0] hover:text-white inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Back to Assistants table"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Assistants</span>
            </button>

            <span className="text-[#444444]">/</span>

            <h1 className="text-[16.5px] font-bold text-white tracking-tight shrink-0">
              Assistant playground
            </h1>

            {/* Assistant Switcher Dropdown */}
            <div ref={switcherRef} className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen(v => !v)}
                className="h-[36px] px-3.5 rounded-[2px] bg-[#1c1c1c] border border-[#3a3a3a] hover:border-[#525252] inline-flex items-center gap-2.5 text-[14.5px] font-semibold text-white cursor-pointer"
              >
                <span className="truncate max-w-[180px]">{selected?.name || 'Select assistant'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
                  {switcherOpen ? (
                    <polyline points="18 15 12 9 6 15" />
                  ) : (
                    <polyline points="6 9 12 15 18 9" />
                  )}
                </svg>
              </button>

              {switcherOpen && (
                <div className="absolute left-0 top-full mt-1 w-[235px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.65)] py-1.5 z-50">
                  <div className="max-h-[220px] overflow-y-auto">
                    {assistants.map(a => {
                      const isSel = selected?.id === a.id
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setSelected(a)
                            setSwitcherOpen(false)
                          }}
                          className={`w-full px-3.5 py-2 text-left text-[14px] flex items-center justify-between hover:bg-[#262626] cursor-pointer ${
                            isSel ? 'font-bold text-white' : 'font-normal text-[#cccccc]'
                          }`}
                        >
                          <span className="truncate pr-2">{a.name}</span>
                          {isSel && (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4da3fa" strokeWidth="2.4" className="shrink-0">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="my-1 border-t border-[#2e2e2e]" />

                  <button
                    type="button"
                    onClick={() => {
                      setSwitcherOpen(false)
                      setCreating(true)
                    }}
                    className="w-full px-3.5 py-2 text-left text-[14px] font-semibold text-[#4da3fa] hover:bg-[#262626] flex items-center gap-2 cursor-pointer"
                  >
                    <span>+ Create an assistant</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchDemoBot}
                    disabled={seedingDemo}
                    className="w-full px-3.5 py-2 text-left text-[13.5px] font-medium text-[#cccccc] hover:bg-[#262626] flex items-center gap-2 cursor-pointer"
                  >
                    <span>{seedingDemo ? 'Loading sample...' : 'Load sample assistant'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expand Drawer Button when Right Drawer is Collapsed */}
          {!drawerOpen && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#3a3a3a] hover:bg-[#2a2a2a] flex items-center justify-center text-white cursor-pointer"
              title="Open assistant drawer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Center Playground Canvas */}
        <div
          ref={chatScrollRef}
          className="flex-1 flex flex-col overflow-y-auto px-6 py-6 min-h-0"
        >
          {showSetupSplash ? (
            filterPanelOpen ? (
              /* When Filter by file metadata is open on empty state, center area stays clean (Matches Screenshot 3) */
              <div className="flex-1" />
            ) : (
              /* Exact Centered Brand Mark + Setup Message from Screenshot 1 */
              <div className="flex-1 flex flex-col items-center justify-center text-center select-none">
                <div className="flex items-center justify-center gap-2.5">
                  <IcebergLogo className="w-[34px] h-[34px]" />
                  <span className="text-[29px] font-medium tracking-[-0.02em] text-white">
                    Iceberg
                  </span>
                </div>
                <p className="mt-3 text-[15px] font-semibold text-white">
                  Your assistant is set up. Get started by uploading your files.
                </p>
              </div>
            )
          ) : (
            /* Active Chat Conversation */
            <div className="flex-1 space-y-4 max-w-[840px] w-full mx-auto">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[84%] rounded-[2px] px-4 py-3 text-[14.5px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium'
                        : 'bg-[#1c1c1c] border border-[var(--border)] text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {(msg.sources?.length > 0 || msg.latencyMs) && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-mono text-[var(--text-muted)]">
                        {msg.sources?.length > 0 && (
                          <span>Source: {msg.sources.join(', ')}</span>
                        )}
                        {msg.latencyMs && (
                          <span>{msg.latencyMs}ms</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-[2px] bg-[#1c1c1c] border border-[var(--border)] text-[14px] text-[var(--text-muted)]">
                    Retrieving context from {selectedCollection}...
                  </div>
                </div>
              )}

              {selectedVectorCount > 0 && userMessagesCount === 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[13px] text-[var(--text-muted)]">Try:</span>
                  {[
                    'How fast is Iceberg hybrid search?',
                    'How does Agent Memory work?',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendChatMessage(prompt)}
                      className="text-[13px] bg-[#1c1c1c] hover:bg-[#262626] border border-[var(--border)] text-[#cccccc] hover:text-white px-2.5 py-1 rounded-[2px] transition cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Area: Either "Filter by file metadata" Panel (Screenshot 3) OR Chat Input Bar (Screenshots 1 & 2) */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          {filterPanelOpen ? (
            <div className="border border-[#2e2e2e] rounded-[2px] bg-[var(--bg-base)] p-6">
              {/* Top Row: Funnel Icon + "Filter by file metadata" + "Clear all filters" */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    className="text-white shrink-0"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="6.5" y1="12" x2="17.5" y2="12" />
                    <line x1="10" y1="18" x2="14" y2="18" />
                  </svg>
                  <span className="text-[15.5px] font-bold text-white">
                    Filter by file metadata
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-[14px] font-semibold text-white hover:opacity-80 cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>

              {/* Inner Dark Card with Filter Rows + "+ Metadata filter" */}
              <div className="mt-4 bg-[#1c1c1c] rounded-[2px] p-5 space-y-5">
                {draftFilters.map(row => {
                  const opMenuKey = `op_${row.id}`
                  const typeMenuKey = `type_${row.id}`
                  return (
                    <div key={row.id} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Solid White Circle Remove (x) Button */}
                        <button
                          type="button"
                          onClick={() => removeFilterRow(row.id)}
                          className="w-[18px] h-[18px] rounded-full bg-white text-[#1c1c1c] hover:opacity-85 flex items-center justify-center shrink-0 cursor-pointer mr-0.5"
                          title="Remove filter"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>

                        {/* Key Input */}
                        <input
                          type="text"
                          value={row.key}
                          onChange={e => updateFilterRow(row.id, { key: e.target.value })}
                          placeholder="Key"
                          className="w-[130px] sm:w-[142px] h-[40px] px-3 rounded-[2px] bg-[#161616] border border-[#2e2e2e] focus:border-[#4da3fa] text-[14.5px] text-white placeholder:text-[#737373] outline-none"
                        />

                        {/* Operator Dropdown (== v) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenFilterMenu(openFilterMenu === opMenuKey ? null : opMenuKey)}
                            className="w-[84px] h-[40px] px-3 rounded-[2px] bg-[#161616] border border-[#2e2e2e] hover:border-[#525252] flex items-center justify-between text-[14.5px] text-white cursor-pointer"
                          >
                            <span>{row.op}</span>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>

                          {openFilterMenu === opMenuKey && (
                            <div className="absolute left-0 top-full mt-1 w-[96px] bg-[#1f1f1f] border border-[#3a3a3a] rounded-[2px] shadow-2xl py-1 z-50">
                              {FILTER_OPERATORS.map(op => (
                                <button
                                  key={op}
                                  type="button"
                                  onClick={() => {
                                    updateFilterRow(row.id, { op })
                                    setOpenFilterMenu(null)
                                  }}
                                  className={`w-full px-3 py-1.5 text-left text-[13.5px] flex items-center justify-between hover:bg-[#2a2a2a] cursor-pointer ${
                                    row.op === op ? 'font-bold text-white' : 'text-[#cccccc]'
                                  }`}
                                >
                                  <span>{op}</span>
                                  {row.op === op && (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4da3fa" strokeWidth="2.4">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Value Input + Value Type Dropdown Button */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={row.value}
                            onChange={e => updateFilterRow(row.id, { value: e.target.value })}
                            placeholder="Value"
                            className="w-[155px] sm:w-[190px] h-[40px] px-3 rounded-[2px] bg-[#161616] border border-[#2e2e2e] focus:border-[#4da3fa] text-[14.5px] text-white placeholder:text-[#737373] outline-none"
                          />

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenFilterMenu(openFilterMenu === typeMenuKey ? null : typeMenuKey)}
                              className="w-[34px] h-[40px] rounded-[2px] bg-[#161616] border border-[#2e2e2e] hover:border-[#525252] flex items-center justify-center text-white cursor-pointer"
                              title={`Value type: ${row.valueType}`}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>

                            {openFilterMenu === typeMenuKey && (
                              <div className="absolute right-0 top-full mt-1 w-[112px] bg-[#1f1f1f] border border-[#3a3a3a] rounded-[2px] shadow-2xl py-1 z-50">
                                {FILTER_VALUE_TYPES.map(vt => (
                                  <button
                                    key={vt.id}
                                    type="button"
                                    onClick={() => {
                                      updateFilterRow(row.id, { valueType: vt.id })
                                      setOpenFilterMenu(null)
                                    }}
                                    className={`w-full px-3 py-1.5 text-left text-[13.5px] flex items-center justify-between hover:bg-[#2a2a2a] cursor-pointer ${
                                      row.valueType === vt.id ? 'font-bold text-white' : 'text-[#cccccc]'
                                    }`}
                                  >
                                    <span>{vt.label}</span>
                                    {row.valueType === vt.id && (
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4da3fa" strokeWidth="2.4">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* + Subfilter Button */}
                        <button
                          type="button"
                          onClick={() => addSubfilter(row.id)}
                          className="inline-flex items-center gap-2 text-[14px] font-semibold text-white hover:opacity-80 cursor-pointer ml-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Subfilter</span>
                        </button>
                      </div>

                      {/* Subfilter Rows (if any added) */}
                      {Array.isArray(row.subfilters) &&
                        row.subfilters.map(sub => (
                          <div key={sub.id} className="pl-7 flex flex-wrap items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => removeSubfilter(row.id, sub.id)}
                              className="w-[18px] h-[18px] rounded-full bg-white text-[#1c1c1c] hover:opacity-85 flex items-center justify-center shrink-0 cursor-pointer mr-0.5"
                              title="Remove subfilter"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>

                            <input
                              type="text"
                              value={sub.key}
                              onChange={e => updateSubfilter(row.id, sub.id, { key: e.target.value })}
                              placeholder="Key"
                              className="w-[125px] sm:w-[135px] h-[38px] px-3 rounded-[2px] bg-[#161616] border border-[#2e2e2e] focus:border-[#4da3fa] text-[14px] text-white placeholder:text-[#737373] outline-none"
                            />

                            <select
                              value={sub.op}
                              onChange={e => updateSubfilter(row.id, sub.id, { op: e.target.value })}
                              className="w-[84px] h-[38px] px-2.5 rounded-[2px] bg-[#161616] border border-[#2e2e2e] text-[14px] text-white outline-none cursor-pointer"
                            >
                              {FILTER_OPERATORS.map(op => (
                                <option key={op} value={op}>
                                  {op}
                                </option>
                              ))}
                            </select>

                            <input
                              type="text"
                              value={sub.value}
                              onChange={e => updateSubfilter(row.id, sub.id, { value: e.target.value })}
                              placeholder="Value"
                              className="w-[150px] sm:w-[180px] h-[38px] px-3 rounded-[2px] bg-[#161616] border border-[#2e2e2e] focus:border-[#4da3fa] text-[14px] text-white placeholder:text-[#737373] outline-none"
                            />
                          </div>
                        ))}
                    </div>
                  )
                })}

                {/* + Metadata filter Button */}
                <div>
                  <button
                    type="button"
                    onClick={addMetadataFilterRow}
                    className="inline-flex items-center gap-2 text-[14px] font-semibold text-white hover:opacity-80 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Metadata filter</span>
                  </button>
                </div>
              </div>

              {/* Bottom Action Row: Cancel + Set filter */}
              <div className="mt-5 flex items-center justify-end gap-5">
                <button
                  type="button"
                  onClick={handleCancelFilter}
                  className="text-[14.5px] font-bold text-white hover:opacity-80 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!canSetFilter}
                  onClick={handleSetFilter}
                  className={`h-[38px] px-4 rounded-[2px] text-[14.5px] font-semibold transition flex items-center justify-center ${
                    !canSetFilter
                      ? 'bg-[#2b2b2b] text-[#777777] cursor-not-allowed'
                      : 'bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] cursor-pointer'
                  }`}
                >
                  Set filter
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendChatMessage()
              }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-[48px] bg-[#1c1c1c] border border-[#2e2e2e] focus-within:border-[#4da3fa] rounded-[2px] px-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenFilterPanel}
                  className="relative text-white hover:opacity-80 transition shrink-0 cursor-pointer"
                  title="Filter by file metadata"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="6.5" y1="12" x2="17.5" y2="12" />
                    <line x1="10" y1="18" x2="14" y2="18" />
                  </svg>
                  {appliedFilters.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#4da3fa]" />
                  )}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={chatLoading}
                  className="flex-1 bg-transparent text-[14.5px] text-white placeholder:text-[#888888] outline-none"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="text-[#888888] hover:text-white disabled:opacity-40 transition shrink-0 cursor-pointer"
                  aria-label="Send message"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={handleClearChat}
                className="text-[14px] font-semibold text-[#666666] hover:text-white px-2 py-1 transition cursor-pointer select-none"
              >
                Clear
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Collapsible Drawer (Matches Screenshots 1, 2, 3, 4, 5 pixel-for-pixel) */}
      {drawerOpen && (
        <div className="w-[325px] sm:w-[340px] border-l border-[var(--border)] bg-[var(--bg-base)] flex flex-col h-full shrink-0 relative">
          {/* Circular Collapse Double-Chevron Button Straddling the Left Border Line */}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute -left-[16px] top-[14px] z-30 w-[32px] h-[32px] rounded-full bg-[#1c1c1c] border border-[#3a3a3a] hover:bg-[#2a2a2a] flex items-center justify-center text-white cursor-pointer"
            title="Collapse panel"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>

          {/* Top Icon Row (No horizontal border-b line, round active background pill) */}
          <div ref={moreMenuRef} className="pt-[14px] pb-3 px-6 flex items-center gap-3 shrink-0 relative">
            {/* Gear Icon (Settings) */}
            <button
              type="button"
              onClick={() => setDrawerTab('settings')}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition cursor-pointer ${
                drawerTab === 'settings'
                  ? 'bg-[#2b2b2b] text-white'
                  : 'text-[#cccccc] hover:text-white hover:bg-[#222222]'
              }`}
              title="Assistant settings"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Folder Icon (Files — Default) */}
            <button
              type="button"
              onClick={() => setDrawerTab('files')}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition cursor-pointer ${
                drawerTab === 'files'
                  ? 'bg-[#2b2b2b] text-white'
                  : 'text-[#cccccc] hover:text-white hover:bg-[#222222]'
              }`}
              title="Files"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            {/* Code Brackets Icon (<> Code Snippets) */}
            <button
              type="button"
              onClick={() => setDrawerTab('connect')}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition cursor-pointer ${
                drawerTab === 'connect'
                  ? 'bg-[#2b2b2b] text-white'
                  : 'text-[#cccccc] hover:text-white hover:bg-[#222222]'
              }`}
              title="Code snippets"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </button>

            {/* Three Dots Icon (More menu) */}
            <button
              type="button"
              onClick={() => setMoreMenuOpen(v => !v)}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition cursor-pointer ${
                moreMenuOpen
                  ? 'bg-[#2b2b2b] text-white'
                  : 'text-[#cccccc] hover:text-white hover:bg-[#222222]'
              }`}
              title="More actions"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>

            {moreMenuOpen && (
              <div className="absolute left-6 top-full mt-1 w-[190px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.65)] py-1.5 z-50">
                <button
                  type="button"
                  onClick={handleSeedCurrentAssistant}
                  disabled={seedingDemo}
                  className="w-full px-3.5 py-2 text-left text-[13.5px] font-medium text-white hover:bg-[#262626] cursor-pointer"
                >
                  {seedingDemo ? 'Loading sample docs...' : 'Load sample data'}
                </button>
                <div className="my-1 border-t border-[#2e2e2e]" />
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false)
                    setDeleteTarget(selected)
                  }}
                  className="w-full px-3.5 py-2 text-left text-[13.5px] font-medium text-red-400 hover:bg-[#262626] cursor-pointer"
                >
                  Delete assistant
                </button>
              </div>
            )}
          </div>

          {/* ── TAB 1: Gear Icon (Settings — Exact Match to Screenshot 1) ── */}
          {drawerTab === 'settings' && (
            <div className="px-6 pt-3 pb-6 flex-1 overflow-y-auto space-y-6">
              {/* Status, Created, Updated, Host, MCP */}
              <div className="space-y-2.5 text-[14.5px] leading-[1.4]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Status:</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" title="Ready" />
                </div>

                <div>
                  <span className="font-bold text-white">Created: </span>
                  <span className="text-[#e5e5e5]">{createdDateStr}</span>
                </div>

                <div>
                  <span className="font-bold text-white">Updated: </span>
                  <span className="text-[#e5e5e5]">{updatedDateStr}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 truncate">
                    <span className="font-bold text-white">Host: </span>
                    <span className="text-[#e5e5e5]">{hostUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(hostUrl, 'host')}
                    className="text-[#cccccc] hover:text-white shrink-0 cursor-pointer"
                    title="Copy Host URL"
                  >
                    {copiedField === 'host' ? <CheckSmallIcon /> : <CopySmallIcon />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 truncate">
                    <span className="font-bold text-white">MCP: </span>
                    <span className="text-[#e5e5e5]">{mcpUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(mcpUrl, 'mcp')}
                    className="text-[#cccccc] hover:text-white shrink-0 cursor-pointer"
                    title="Copy MCP URL"
                  >
                    {copiedField === 'mcp' ? <CheckSmallIcon /> : <CopySmallIcon />}
                  </button>
                </div>
              </div>

              {/* Assistant instructions */}
              <div>
                <label className="block text-[14.5px] font-bold text-white mb-2">
                  Assistant instructions
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.instructions}
                  onChange={e => updateAssistantSettingsLive({ instructions: e.target.value })}
                  placeholder="Outline the assistant’s behavior, tone, or any additional context. Applies to every conversation."
                  className="w-full p-3 rounded-[2px] bg-[#222222] border border-[#3a3a3a] focus:border-[#4da3fa] text-[14px] leading-[1.45] text-white placeholder:text-[#888888] outline-none resize-none"
                />
              </div>

              {/* Chat model */}
              <div ref={chatModelRef}>
                <label className="flex items-center gap-1.5 text-[14.5px] font-bold text-white mb-2">
                  <span>Chat model</span>
                  <span
                    className="text-[#cccccc] inline-flex items-center cursor-help"
                    title="Model used for assistant chat completions"
                  >
                    <InfoCircleIcon size={14} />
                  </span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setChatModelMenuOpen(v => !v)}
                    className={`w-full h-[40px] px-3.5 rounded-[2px] bg-[#222222] border flex items-center justify-between text-[14.5px] text-white cursor-pointer ${
                      chatModelMenuOpen ? 'border-[#4da3fa]' : 'border-[#3a3a3a] hover:border-[#4da3fa]'
                    }`}
                  >
                    <span className="truncate">{currentChatModel.label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
                      {chatModelMenuOpen ? (
                        <polyline points="18 15 12 9 6 15" />
                      ) : (
                        <polyline points="6 9 12 15 18 9" />
                      )}
                    </svg>
                  </button>

                  {chatModelMenuOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#1f1f1f] border border-[#3a3a3a] rounded-[2px] shadow-2xl py-1.5 z-50 max-h-[240px] overflow-y-auto">
                      {CHAT_MODELS.map(m => {
                        const active = m.id === currentChatModel.id
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              updateAssistantSettingsLive({ chat_model_id: m.id })
                              setChatModelMenuOpen(false)
                            }}
                            className={`w-full px-3.5 py-2 text-left text-[14px] flex items-center justify-between hover:bg-[#2a2a2a] cursor-pointer ${
                              active ? 'font-bold text-white' : 'font-normal text-[#cccccc]'
                            }`}
                          >
                            <span>{m.label}</span>
                            {active && (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4da3fa" strokeWidth="2.4">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: Folder Icon (Files — Exact Match to Screenshot 2) ── */}
          {drawerTab === 'files' && (
            <div className="px-6 pt-2 pb-6 flex-1 flex flex-col overflow-hidden">
              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const droppedFile = e.dataTransfer?.files?.[0]
                  if (droppedFile) uploadDoc(selected, droppedFile)
                }}
                className={`border rounded-[2px] h-[420px] flex flex-col items-center justify-center px-4 py-6 text-center cursor-pointer transition bg-[var(--bg-base)] ${
                  isDragging
                    ? 'border-[#4da3fa] bg-[#161f2c]'
                    : 'border-[#2e2e2e] hover:border-[#525252]'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.json,.md"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && uploadDoc(selected, e.target.files[0])}
                />

                {/* Clean Symmetric Cloud-Upload Icon */}
                <svg
                  width="36"
                  height="25"
                  viewBox="0 0 28 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M7 18h14a5 5 0 0 0 .6-9.96A7 7 0 0 0 8.2 5.4 5.5 5.5 0 0 0 7 18Z" />
                  <path d="M14 14V8" />
                  <polyline points="11 10.5 14 7.5 17 10.5" />
                </svg>

                <p className="mt-3.5 text-[14.5px] font-bold text-white whitespace-nowrap">
                  {uploading ? 'Uploading & indexing...' : 'Drag files here or click to browse'}
                </p>
                <p className="mt-2 text-[14px] text-[#cccccc]">
                  Accepted file types:
                </p>
                <p className="text-[14px] text-[#cccccc]">
                  .pdf, .docx, .txt, .json, .md
                </p>
              </label>

              {uploadSuccess && (
                <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[2px] text-[13px]">
                  {uploadSuccess}
                </div>
              )}

              {uploadError && (
                <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-[2px] text-[13px]">
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: Code Icon (<> — Exact Match to Screenshots 3, 4, 5) ── */}
          {drawerTab === 'connect' && (
            <div className="px-6 pt-2 pb-6 flex-1 overflow-y-auto space-y-5">
              {/* Language Row */}
              <div ref={codeLangRef} className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-bold text-white">
                  Language
                </span>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCodeLangMenuOpen(v => !v)}
                    className={`w-[116px] h-[38px] px-3 rounded-[2px] bg-[#222222] border flex items-center justify-between text-[14.5px] font-medium text-white cursor-pointer ${
                      codeLangMenuOpen ? 'border-[#4da3fa]' : 'border-[#3a3a3a] hover:border-[#4da3fa]'
                    }`}
                  >
                    <span>{currentCodeLang.label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      {codeLangMenuOpen ? (
                        <polyline points="18 15 12 9 6 15" />
                      ) : (
                        <polyline points="6 9 12 15 18 9" />
                      )}
                    </svg>
                  </button>

                  {codeLangMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-[132px] bg-[#1f1f1f] border border-[#3a3a3a] rounded-[2px] shadow-2xl py-1.5 z-50">
                      {CODE_LANGUAGES.map(l => {
                        const active = l.id === codeLang
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              setCodeLang(l.id)
                              setCodeLangMenuOpen(false)
                            }}
                            className={`w-full px-3.5 py-2 text-left text-[14px] flex items-center justify-between hover:bg-[#2a2a2a] cursor-pointer ${
                              active ? 'font-bold text-white' : 'font-normal text-[#cccccc]'
                            }`}
                          >
                            <span>{l.label}</span>
                            {active && (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4da3fa" strokeWidth="2.4">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 1: Upload files */}
              <div>
                <h3 className="text-[16.5px] font-bold text-white">
                  Upload files
                </h3>
                <p className="mt-1.5 text-[14.5px] text-white leading-[1.5]">
                  To upload a file to your assistant from your local device, use the create file operation as in the following example.
                </p>

                <NumberedCodeBox
                  snippet={uploadSnippet}
                  copied={copiedField === 'upload_code'}
                  onCopy={() => copyToClipboard(uploadSnippet.raw, 'upload_code')}
                />
              </div>

              {/* Section 2: Chat with your assistant */}
              <div className="pt-1">
                <h3 className="text-[16.5px] font-bold text-white">
                  Chat with your assistant
                </h3>
                <p className="mt-1.5 text-[14.5px] text-white leading-[1.5]">
                  To chat with an assistant, use the chat completion assistant endpoint. This operation returns either a JSON object or a text stream.
                </p>

                <NumberedCodeBox
                  snippet={chatSnippet}
                  copied={copiedField === 'chat_code'}
                  onCopy={() => copyToClipboard(chatSnippet.raw, 'chat_code')}
                />
              </div>

              {/* Footer Documentation Link */}
              <p className="pt-1 text-[14.5px] text-white leading-[1.5]">
                Read more about the Assistant API in our{' '}
                <Link to="/docs" className="text-[#4da3fa] underline hover:opacity-90">
                  documentation
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      )}

      {createModal}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete assistant?"
        message={
          <div>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-[var(--text-primary)]">{deleteTarget?.name}</span>?
          </div>
        }
        confirmText="Delete assistant"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function NumberedCodeBox({ snippet, copied, onCopy }) {
  return (
    <div className="mt-3 relative rounded-[2px] border border-[#2e2e2e] bg-[#1c1c1c] overflow-hidden">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-[2px] bg-[#222222] border border-[#3a3a3a] hover:bg-[#2c2c2c] flex items-center justify-center text-[#cccccc] hover:text-white cursor-pointer"
        title="Copy snippet"
      >
        {copied ? <CheckSmallIcon /> : <CopySmallIcon />}
      </button>

      <div className="overflow-x-auto py-3.5 px-3 font-mono text-[13px] leading-[1.65]">
        {snippet.lines.map((tokens, idx) => (
          <div key={idx} className="whitespace-pre flex items-baseline">
            <span className="w-6 shrink-0 select-none text-[#737373] text-right pr-3">
              {idx + 1}
            </span>
            <span>
              {tokens.length === 0
                ? ' '
                : tokens.map((tok, j) => (
                    <span key={j} style={{ color: tok.c }}>
                      {tok.t}
                    </span>
                  ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CopySmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function InfoCircleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.85" />
      <rect x="9" y="5.4" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="9" y="9" width="2" height="5.6" rx="0.4" fill="currentColor" />
    </svg>
  )
}

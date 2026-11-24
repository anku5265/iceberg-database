import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import ConfirmModal from '../components/ConfirmModal'
import IcebergLogo from '../components/IcebergLogo'

const MEMORY_TIERS = [
  { id: 'semantic', name: 'Semantic', ttl: 'Permanent', desc: 'User facts & traits', badgeColor: '#4da3fa' },
  { id: 'long_term', name: 'Long-term', ttl: 'Permanent', desc: 'Domain knowledge', badgeColor: '#10b981' },
  { id: 'episodic', name: 'Episodic', ttl: '30d TTL', desc: 'Past interactions', badgeColor: '#f59e0b' },
  { id: 'short_term', name: 'Short-term', ttl: '1h TTL', desc: 'Session context', badgeColor: '#a78bfa' },
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

const FILTER_OPERATORS = ['==', '!=', '$in', '$nin']

const FILTER_VALUE_TYPES = [
  { id: 'string', label: 'String' },
  { id: 'number', label: 'Number' },
  { id: 'boolean', label: 'Boolean' },
]

function createEmptyFilterRow() {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    key: 'tier',
    op: '==',
    value: '',
    valueType: 'string',
    subfilters: [],
  }
}

function evaluateMemoryCondition(mem, cond) {
  const k = (cond.key || '').trim().toLowerCase()
  const rawVal = (cond.value || '').trim().toLowerCase()
  if (!k || !rawVal) return true

  let actual = ''
  if (k === 'tier' || k === 'type' || k === 'memory_type') {
    actual = String(mem.type || 'semantic').toLowerCase()
  } else if (k === 'content' || k === 'text') {
    actual = String(mem.content || '').toLowerCase()
  } else {
    actual = String(mem?.metadata?.[cond.key] ?? mem?.[cond.key] ?? '').toLowerCase()
  }

  const op = cond.op || '=='
  if (op === '==') return actual === rawVal || actual.includes(rawVal)
  if (op === '!=') return actual !== rawVal
  if (op === '$in') {
    const parts = rawVal.split(',').map(s => s.trim()).filter(Boolean)
    return parts.some(p => actual === p || actual.includes(p))
  }
  if (op === '$nin') {
    const parts = rawVal.split(',').map(s => s.trim()).filter(Boolean)
    return !parts.some(p => actual === p || actual.includes(p))
  }
  return true
}

function matchesMemoryFilters(mem, filters) {
  if (!Array.isArray(filters) || filters.length === 0) return true
  return filters.every(row => {
    const mainMatch = evaluateMemoryCondition(mem, row)
    const subMatch = Array.isArray(row.subfilters)
      ? row.subfilters.every(sub => evaluateMemoryCondition(mem, sub))
      : true
    return mainMatch && subMatch
  })
}

function buildRememberSnippet(lang, agentId, memType = 'semantic') {
  const slug = (agentId || 'support_bot_01').trim()
  if (lang === 'python') {
    return {
      raw: `from iceberg import Iceberg\n\nic = Iceberg(api_key="YOUR_API_KEY")\n\nic.remember(\n    agent_id="${slug}",\n    content="User prefers concise Python SDK examples.",\n    memory_type="${memType}"\n)`,
      lines: [
        [{ t: 'from ', c: '#c586c0' }, { t: 'iceberg ', c: '#dcdcaa' }, { t: 'import ', c: '#c586c0' }, { t: 'Iceberg', c: '#4ec9b0' }],
        [],
        [{ t: 'ic = ', c: '#d4d4d4' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(api_key=', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [],
        [{ t: 'ic.', c: '#d4d4d4' }, { t: 'remember', c: '#61afef' }, { t: '(', c: '#d4d4d4' }],
        [{ t: '    agent_id=', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '    content=', c: '#d4d4d4' }, { t: '"User prefers concise Python SDK examples."', c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '    memory_type=', c: '#d4d4d4' }, { t: `"${memType}"`, c: '#a5d6a7' }],
        [{ t: ')', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'node') {
    return {
      raw: `import { Iceberg } from 'iceberg-js';\n\nconst ic = new Iceberg({ apiKey: 'YOUR_API_KEY' });\n\nawait ic.remember({\n  agentId: '${slug}',\n  content: 'User prefers concise Python SDK examples.',\n  memoryType: '${memType}'\n});`,
      lines: [
        [{ t: 'import ', c: '#c586c0' }, { t: '{ Iceberg } ', c: '#d4d4d4' }, { t: 'from ', c: '#c586c0' }, { t: "'iceberg-js'", c: '#a5d6a7' }, { t: ';', c: '#d4d4d4' }],
        [],
        [{ t: 'const ', c: '#569cd6' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '({ apiKey: ', c: '#d4d4d4' }, { t: "'YOUR_API_KEY'", c: '#a5d6a7' }, { t: ' });', c: '#d4d4d4' }],
        [],
        [{ t: 'await ', c: '#c586c0' }, { t: 'ic.', c: '#d4d4d4' }, { t: 'remember', c: '#61afef' }, { t: '({', c: '#d4d4d4' }],
        [{ t: '  agentId: ', c: '#d4d4d4' }, { t: `'${slug}'`, c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '  content: ', c: '#d4d4d4' }, { t: "'User prefers concise Python SDK examples.'", c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '  memoryType: ', c: '#d4d4d4' }, { t: `'${memType}'`, c: '#a5d6a7' }],
        [{ t: '});', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'java') {
    return {
      raw: `Iceberg ic = new Iceberg("YOUR_API_KEY");\nic.remember("${slug}", "User prefers concise Python SDK examples.", "${memType}");`,
      lines: [
        [{ t: 'Iceberg ', c: '#4ec9b0' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'ic.', c: '#d4d4d4' }, { t: 'remember', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"User prefers concise Python SDK examples."', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: `"${memType}"`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'go') {
    return {
      raw: `client := iceberg.NewClient("YOUR_API_KEY")\nerr := client.Remember(ctx, "${slug}", "User prefers concise Python SDK examples.", "${memType}")`,
      lines: [
        [{ t: 'client := iceberg.', c: '#d4d4d4' }, { t: 'NewClient', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'err := client.', c: '#d4d4d4' }, { t: 'Remember', c: '#61afef' }, { t: '(ctx, ', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"User prefers concise Python SDK examples."', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: `"${memType}"`, c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'rust') {
    return {
      raw: `let client = icebergdb::Client::new("YOUR_API_KEY");\nclient.remember("${slug}", "User prefers concise Python SDK examples.", "${memType}").await?;`,
      lines: [
        [{ t: 'let ', c: '#569cd6' }, { t: 'client = icebergdb::Client::', c: '#d4d4d4' }, { t: 'new', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'client.', c: '#d4d4d4' }, { t: 'remember', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"User prefers concise Python SDK examples."', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: `"${memType}"`, c: '#a5d6a7' }, { t: ').', c: '#d4d4d4' }, { t: 'await', c: '#c586c0' }, { t: '?;', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'dotnet') {
    return {
      raw: `var client = new IcebergClient("YOUR_API_KEY");\nawait client.RememberAsync("${slug}", "User prefers concise Python SDK examples.", "${memType}");`,
      lines: [
        [{ t: 'var ', c: '#569cd6' }, { t: 'client = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'IcebergClient', c: '#4ec9b0' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'await ', c: '#c586c0' }, { t: 'client.', c: '#d4d4d4' }, { t: 'RememberAsync', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"User prefers concise Python SDK examples."', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: `"${memType}"`, c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
      ],
    }
  }

  // Default: Shell
  const raw = `ICEBERG_API_KEY="YOUR_API_KEY"\n\ncurl -X POST "${API_URL}/memory/${slug}/remember" \\\n  -H "X-API-Key: $ICEBERG_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n  "content": "User prefers concise Python SDK examples.",\n  "memory_type": "${memType}"\n}'`
  return {
    raw,
    lines: [
      [{ t: 'ICEBERG_API_KEY=', c: '#61afef' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }],
      [],
      [{ t: 'curl', c: '#c586c0' }, { t: ' -X ', c: '#61afef' }, { t: 'POST ', c: '#d4d4d4' }, { t: `"${API_URL}/memory/${slug}/remember"`, c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -H ', c: '#61afef' }, { t: '"X-API-Key: $ICEBERG_API_KEY"', c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -H ', c: '#61afef' }, { t: '"Content-Type: application/json"', c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -d ', c: '#61afef' }, { t: "'{", c: '#a5d6a7' }],
      [{ t: '  "content": "User prefers concise Python SDK examples.",', c: '#a5d6a7' }],
      [{ t: `  "memory_type": "${memType}"`, c: '#a5d6a7' }],
      [{ t: "}'", c: '#a5d6a7' }],
    ],
  }
}

function buildRecallSnippet(lang, agentId) {
  const slug = (agentId || 'support_bot_01').trim()
  if (lang === 'python') {
    return {
      raw: `from iceberg import Iceberg\n\nic = Iceberg(api_key="YOUR_API_KEY")\n\nmemories = ic.recall(\n    agent_id="${slug}",\n    query="What are the user preferences?",\n    top_k=5\n)\nprint(memories)`,
      lines: [
        [{ t: 'from ', c: '#c586c0' }, { t: 'iceberg ', c: '#dcdcaa' }, { t: 'import ', c: '#c586c0' }, { t: 'Iceberg', c: '#4ec9b0' }],
        [],
        [{ t: 'ic = ', c: '#d4d4d4' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(api_key=', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ')', c: '#d4d4d4' }],
        [],
        [{ t: 'memories = ic.', c: '#d4d4d4' }, { t: 'recall', c: '#61afef' }, { t: '(', c: '#d4d4d4' }],
        [{ t: '    agent_id=', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '    query=', c: '#d4d4d4' }, { t: '"What are the user preferences?"', c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '    top_k=', c: '#d4d4d4' }, { t: '5', c: '#b5cea8' }],
        [{ t: ')', c: '#d4d4d4' }],
        [{ t: 'print', c: '#61afef' }, { t: '(memories)', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'node') {
    return {
      raw: `import { Iceberg } from 'iceberg-js';\n\nconst ic = new Iceberg({ apiKey: 'YOUR_API_KEY' });\n\nconst memories = await ic.recall({\n  agentId: '${slug}',\n  query: 'What are the user preferences?',\n  topK: 5\n});\nconsole.log(memories);`,
      lines: [
        [{ t: 'import ', c: '#c586c0' }, { t: '{ Iceberg } ', c: '#d4d4d4' }, { t: 'from ', c: '#c586c0' }, { t: "'iceberg-js'", c: '#a5d6a7' }, { t: ';', c: '#d4d4d4' }],
        [],
        [{ t: 'const ', c: '#569cd6' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '({ apiKey: ', c: '#d4d4d4' }, { t: "'YOUR_API_KEY'", c: '#a5d6a7' }, { t: ' });', c: '#d4d4d4' }],
        [],
        [{ t: 'const ', c: '#569cd6' }, { t: 'memories = ', c: '#d4d4d4' }, { t: 'await ', c: '#c586c0' }, { t: 'ic.', c: '#d4d4d4' }, { t: 'recall', c: '#61afef' }, { t: '({', c: '#d4d4d4' }],
        [{ t: '  agentId: ', c: '#d4d4d4' }, { t: `'${slug}'`, c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '  query: ', c: '#d4d4d4' }, { t: "'What are the user preferences?'", c: '#a5d6a7' }, { t: ',', c: '#d4d4d4' }],
        [{ t: '  topK: ', c: '#d4d4d4' }, { t: '5', c: '#b5cea8' }],
        [{ t: '});', c: '#d4d4d4' }],
        [{ t: 'console.', c: '#d4d4d4' }, { t: 'log', c: '#61afef' }, { t: '(memories);', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'java') {
    return {
      raw: `Iceberg ic = new Iceberg("YOUR_API_KEY");\nvar memories = ic.recall("${slug}", "What are the user preferences?", 5);\nSystem.out.println(memories);`,
      lines: [
        [{ t: 'Iceberg ', c: '#4ec9b0' }, { t: 'ic = ', c: '#d4d4d4' }, { t: 'new ', c: '#569cd6' }, { t: 'Iceberg', c: '#4ec9b0' }, { t: '(', c: '#d4d4d4' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'var ', c: '#569cd6' }, { t: 'memories = ic.', c: '#d4d4d4' }, { t: 'recall', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"What are the user preferences?"', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '5', c: '#b5cea8' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'System.out.', c: '#d4d4d4' }, { t: 'println', c: '#61afef' }, { t: '(memories);', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'go') {
    return {
      raw: `memories, err := client.Recall(ctx, "${slug}", "What are the user preferences?", 5)\nfmt.Println(memories)`,
      lines: [
        [{ t: 'memories, err := client.', c: '#d4d4d4' }, { t: 'Recall', c: '#61afef' }, { t: '(ctx, ', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"What are the user preferences?"', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '5', c: '#b5cea8' }, { t: ')', c: '#d4d4d4' }],
        [{ t: 'fmt.', c: '#d4d4d4' }, { t: 'Println', c: '#61afef' }, { t: '(memories)', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'rust') {
    return {
      raw: `let memories = client.recall("${slug}", "What are the user preferences?", 5).await?;\nprintln!("{:?}", memories);`,
      lines: [
        [{ t: 'let ', c: '#569cd6' }, { t: 'memories = client.', c: '#d4d4d4' }, { t: 'recall', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"What are the user preferences?"', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '5', c: '#b5cea8' }, { t: ').', c: '#d4d4d4' }, { t: 'await', c: '#c586c0' }, { t: '?;', c: '#d4d4d4' }],
        [{ t: 'println!', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: '"{:?}"', c: '#a5d6a7' }, { t: ', memories);', c: '#d4d4d4' }],
      ],
    }
  }
  if (lang === 'dotnet') {
    return {
      raw: `var memories = await client.RecallAsync("${slug}", "What are the user preferences?", 5);\nConsole.WriteLine(memories);`,
      lines: [
        [{ t: 'var ', c: '#569cd6' }, { t: 'memories = ', c: '#d4d4d4' }, { t: 'await ', c: '#c586c0' }, { t: 'client.', c: '#d4d4d4' }, { t: 'RecallAsync', c: '#61afef' }, { t: '(', c: '#d4d4d4' }, { t: `"${slug}"`, c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '"What are the user preferences?"', c: '#a5d6a7' }, { t: ', ', c: '#d4d4d4' }, { t: '5', c: '#b5cea8' }, { t: ');', c: '#d4d4d4' }],
        [{ t: 'Console.', c: '#d4d4d4' }, { t: 'WriteLine', c: '#61afef' }, { t: '(memories);', c: '#d4d4d4' }],
      ],
    }
  }

  // Default: Shell
  const raw = `ICEBERG_API_KEY="YOUR_API_KEY"\n\ncurl -X POST "${API_URL}/memory/${slug}/recall" \\\n  -H "X-API-Key: $ICEBERG_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n  "query": "What are the user preferences?",\n  "top_k": 5\n}'`
  return {
    raw,
    lines: [
      [{ t: 'ICEBERG_API_KEY=', c: '#61afef' }, { t: '"YOUR_API_KEY"', c: '#a5d6a7' }],
      [],
      [{ t: 'curl', c: '#c586c0' }, { t: ' -X ', c: '#61afef' }, { t: 'POST ', c: '#d4d4d4' }, { t: `"${API_URL}/memory/${slug}/recall"`, c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -H ', c: '#61afef' }, { t: '"X-API-Key: $ICEBERG_API_KEY"', c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -H ', c: '#61afef' }, { t: '"Content-Type: application/json"', c: '#a5d6a7' }, { t: ' \\', c: '#d4d4d4' }],
      [{ t: '  -d ', c: '#61afef' }, { t: "'{", c: '#a5d6a7' }],
      [{ t: '  "query": "What are the user preferences?",', c: '#a5d6a7' }],
      [{ t: '  "top_k": 5', c: '#a5d6a7' }],
      [{ t: "}'", c: '#a5d6a7' }],
    ],
  }
}

export default function Memory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlAgent = searchParams.get('agent') || ''
  const [tableMenuAgent, setTableMenuAgent] = useState(null)

  const defaultAgentName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
      const base = (u.email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')
      return base ? `agent_${base}` : 'support_bot_01'
    } catch {
      return 'support_bot_01'
    }
  })()

  const [customAgents, setCustomAgents] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('iceberg_memory_agents') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const [agentId, setAgentId] = useState(urlAgent || defaultAgentName)
  const [content, setContent] = useState('')
  const [memType, setMemType] = useState('semantic')
  const [query, setQuery] = useState('')
  const [tierFilter, setTierFilter] = useState('all')

  // Top playground agent switcher dropdown
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef(null)

  // "Set up new agent memory" modal
  const [creatingAgent, setCreatingAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentRegion] = useState('India (ap-south-1)')
  const [regionMenuOpen, setRegionMenuOpen] = useState(false)

  // Right collapsible drawer ('store' | 'settings' | 'connect')
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [drawerTab, setDrawerTab] = useState('store')
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef(null)

  // Drawer dropdowns & copy state
  const [tierMenuOpen, setTierMenuOpen] = useState(false)
  const tierMenuRef = useRef(null)
  const [codeLang, setCodeLang] = useState('shell')
  const [codeLangMenuOpen, setCodeLangMenuOpen] = useState(false)
  const codeLangRef = useRef(null)
  const [copiedField, setCopiedField] = useState('')

  // Bottom "Filter by memory metadata" panel (Exact Pinecone Screenshot 3 style)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState([])
  const [draftFilters, setDraftFilters] = useState(() => [createEmptyFilterRow()])
  const [openFilterMenu, setOpenFilterMenu] = useState(null)

  const [storedItems, setStoredItems] = useState([])
  const [recallResults, setRecallResults] = useState(null)
  const [lastRecallQuery, setLastRecallQuery] = useState('')
  const [lastLatency, setLastLatency] = useState(null)

  const [storing, setStoring] = useState(false)
  const [recalling, setRecalling] = useState(false)
  const [storedNotice, setStoredNotice] = useState(false)
  const [totalMemories, setTotalMemories] = useState(0)

  const [showClearModal, setShowClearModal] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearedNotice, setClearedNotice] = useState(false)
  const [preloading, setPreloading] = useState(false)

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
      if (tierMenuRef.current && !tierMenuRef.current.contains(e.target)) {
        setTierMenuOpen(false)
      }
      if (codeLangRef.current && !codeLangRef.current.contains(e.target)) {
        setCodeLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const loadAgentData = async (id = agentId, silent = false) => {
    const cleanId = (id || '').trim()
    if (!cleanId) {
      setTotalMemories(0)
      setStoredItems([])
      return
    }
    try {
      const statsData = await api.getMemoryStats(cleanId)
      const count = statsData?.total_memories || 0
      setTotalMemories(count)

      if (count > 0) {
        const probeRes = await api.recallMemory(
          cleanId,
          'user prefers agent memory fact knowledge system startup database',
          20
        )
        if (probeRes && Array.isArray(probeRes.memories)) {
          setStoredItems(probeRes.memories)
        }
      } else {
        setStoredItems([])
      }
    } catch {
      if (!silent) setTotalMemories(0)
    }
  }

  useEffect(() => {
    setRecallResults(null)
    setLastRecallQuery('')
    loadAgentData(agentId)
    const interval = setInterval(() => {
      if (agentId) loadAgentData(agentId, true)
    }, 5000)
    return () => clearInterval(interval)
  }, [agentId])

  const remember = async (e) => {
    e?.preventDefault()
    if (!agentId.trim() || !content.trim()) return
    setStoring(true)
    const textToStore = content.trim()
    try {
      const res = await api.rememberMemory(agentId.trim(), textToStore, memType)
      if (res && res.stored) {
        setContent('')
        setStoredNotice(true)
        setTimeout(() => setStoredNotice(false), 3000)

        const newEntry = {
          content: textToStore,
          type: memType,
          created_at: Math.floor(Date.now() / 1000),
          score: null,
        }
        setStoredItems(prev => [newEntry, ...prev.filter(x => x.content !== textToStore)])
        setTotalMemories(prev => prev + 1)
        await loadAgentData(agentId, true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStoring(false)
    }
  }

  const recall = async (searchQuery = query) => {
    const q = (searchQuery !== undefined ? searchQuery : query).trim()
    if (!agentId.trim() || !q) return
    setRecalling(true)
    const t0 = performance.now()
    try {
      const data = await api.recallMemory(agentId.trim(), q, 12)
      const measuredMs = Math.max(1, Math.round((performance.now() - t0) * 10) / 10)
      setLastLatency(measuredMs)
      if (data && Array.isArray(data.memories)) {
        setRecallResults(data.memories)
        setLastRecallQuery(q)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRecalling(false)
    }
  }

  const handlePreloadDemo = async () => {
    setPreloading(true)
    setMoreMenuOpen(false)
    setSwitcherOpen(false)
    const targetAgent = agentId.trim() || defaultAgentName
    setAgentId(targetAgent)

    const demoMemories = [
      { content: 'Iceberg DB is a production serverless vector database and 4-tier AI agent memory engine hosted in India (ap-south-1).', type: 'semantic' },
      { content: 'User prefers clean enterprise console UI and sub-15ms real-time hybrid RRF vector queries.', type: 'long_term' },
      { content: 'Agent deployed hybrid search combining 384d Cosine similarity with sparse BM25 lexical matching (30d TTL).', type: 'episodic' },
      { content: 'Built-in 384d FastEmbed CPU embeddings require $0 external OpenAI API keys.', type: 'semantic' },
    ]

    try {
      for (const m of demoMemories) {
        await api.rememberMemory(targetAgent, m.content, m.type)
      }
      await loadAgentData(targetAgent)
    } catch (err) {
      console.error('Failed to preload sample memories:', err)
    } finally {
      setPreloading(false)
    }
  }

  const confirmClear = async () => {
    if (!agentId) return
    setClearing(true)
    try {
      await api.clearMemory(agentId.trim())
      setRecallResults(null)
      setStoredItems([])
      setTotalMemories(0)
      setLastRecallQuery('')
      setShowClearModal(false)
      setClearedNotice(true)
      await loadAgentData(agentId)
      setTimeout(() => setClearedNotice(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setClearing(false)
    }
  }

  const handleCreateAgent = (e) => {
    e.preventDefault()
    const clean = newAgentName.trim().replace(/\s+/g, '_')
    if (!clean) return
    const nextList = Array.from(new Set([clean, ...customAgents]))
    setCustomAgents(nextList)
    try {
      localStorage.setItem('iceberg_memory_agents', JSON.stringify(nextList))
    } catch {}
    setAgentId(clean)
    setNewAgentName('')
    setCreatingAgent(false)
    setRegionMenuOpen(false)
    setDrawerOpen(true)
    setDrawerTab('store')
  }

  useEffect(() => {
    if (urlAgent && urlAgent !== agentId) {
      setAgentId(urlAgent)
    }
  }, [urlAgent])

  useEffect(() => {
    if (!tableMenuAgent) return
    const closeMenu = () => setTableMenuAgent(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [tableMenuAgent])

  // Filter Panel Handlers
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
    setTierFilter('all')
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
                  key: 'tier',
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

  const agentPresets = Array.from(
    new Set([defaultAgentName, ...customAgents, 'support_bot_01', 'analytics_agent'])
  )

  const activeList = recallResults !== null ? recallResults : storedItems
  const filteredMemories = activeList
    .filter(m => (tierFilter === 'all' ? true : (m.type || 'semantic') === tierFilter))
    .filter(m => matchesMemoryFilters(m, appliedFilters))

  const currentTierMeta = MEMORY_TIERS.find(t => t.id === memType) || MEMORY_TIERS[0]
  const currentCodeLang = CODE_LANGUAGES.find(l => l.id === codeLang) || CODE_LANGUAGES[0]
  const rememberSnippet = buildRememberSnippet(codeLang, agentId, memType)
  const recallSnippet = buildRecallSnippet(codeLang, agentId)

  const hostUrl = `${API_URL}/memory/${agentId}`
  const mcpUrl = `${API_URL}/mcp/memory/${agentId}`
  const todayStr = new Date().toLocaleDateString('en-US')

  // Centered "Set up your new agent memory" modal (Exact Pinecone Modal Style)
  const createAgentModal = creatingAgent ? (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setCreatingAgent(false)
          setRegionMenuOpen(false)
        }
      }}
    >
      <form
        onSubmit={handleCreateAgent}
        className="w-full max-w-[465px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] p-7 shadow-[0_24px_64px_rgba(0,0,0,0.75)] text-left"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold tracking-tight text-white">
            Set up new agent memory
          </h2>
          <button
            type="button"
            onClick={() => {
              setCreatingAgent(false)
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
            Name your agent
          </label>
          <input
            autoFocus
            type="text"
            value={newAgentName}
            onChange={e => setNewAgentName(e.target.value)}
            placeholder="Agent ID (e.g. support_bot_02)"
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
              <span>{newAgentRegion}</span>
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
                  onClick={() => setRegionMenuOpen(false)}
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
          disabled={!newAgentName.trim()}
          className={`mt-6 w-full h-[40px] rounded-[2px] text-[14.5px] font-semibold transition flex items-center justify-center ${
            !newAgentName.trim()
              ? 'bg-[#333333] text-[#888888] cursor-not-allowed'
              : 'bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] cursor-pointer'
          }`}
        >
          Create agent memory
        </button>
      </form>
    </div>
  ) : null

  // ── Pinecone-Style "Agent memory" Table View when at /memory without ?agent= ──
  if (!urlAgent) {
    return (
      <div
        className="pt-[46px] pb-12 px-6 sm:px-[49px] max-w-[1090px] text-white"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        <div className="flex items-center justify-between gap-4 mb-[24px]">
          <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
            Agent memory
          </h1>

          <button
            type="button"
            onClick={() => setCreatingAgent(true)}
            className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold inline-flex items-center justify-center transition cursor-pointer"
          >
            Create agent memory
          </button>
        </div>

        <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-[55px] border-b border-[#343434] text-[13px] font-bold text-white">
                <th className="pl-[16px] pr-4 font-bold">Name</th>
                <th className="px-4 font-bold w-[210px]">Cognitive tiers</th>
                <th className="px-4 font-bold w-[150px]">Cloud / Region</th>
                <th className="px-4 font-bold w-[240px]">Host</th>
                <th className="pl-4 pr-[16px] font-bold w-[86px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#343434] text-[13px]">
              {agentPresets.map((preset) => {
                const agentHost = `${API_URL}/memory/${preset}`
                const isMenuOpen = tableMenuAgent === preset
                return (
                  <tr
                    key={preset}
                    className="h-[64px] hover:bg-[#222222] transition-colors"
                  >
                    <td className="pl-[16px] pr-4">
                      <div className="inline-flex items-center gap-[9px]">
                        <button
                          type="button"
                          onClick={() => {
                            setAgentId(preset)
                            setSearchParams({ agent: preset })
                          }}
                          className="text-[#58a6ff] hover:underline font-normal text-[13.5px] cursor-pointer"
                        >
                          {preset}
                        </button>
                        <span
                          className="w-[8px] h-[8px] rounded-full bg-[#3fb950] shrink-0"
                          title="Ready"
                        />
                      </div>
                    </td>

                    <td className="px-4 text-white">
                      Semantic · Long-term · Episodic · Short-term
                    </td>

                    <td className="px-4 text-white whitespace-nowrap">
                      AWS / ap-south-1
                    </td>

                    <td className="px-4 text-white max-w-[240px] truncate" title={agentHost}>
                      {agentHost}
                    </td>

                    <td className="pl-4 pr-[16px] text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTableMenuAgent((prev) => (prev === preset ? null : preset))
                        }}
                        className="w-[30px] h-[30px] rounded-[2px] hover:bg-[#2d2d2d] text-white inline-flex items-center justify-center transition cursor-pointer"
                        title="Actions"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-[16px] top-[52px] z-30 w-[180px] rounded-[2px] border border-[#383838] bg-[#242424] shadow-xl py-1 text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setTableMenuAgent(null)
                              setAgentId(preset)
                              setSearchParams({ agent: preset })
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-white hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Open playground</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTableMenuAgent(null)
                              copyToClipboard(agentHost, `host_${preset}`)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-white hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Copy host URL</span>
                          </button>

                          <div className="my-1 border-t border-[#343434]" />

                          <button
                            type="button"
                            onClick={() => {
                              setTableMenuAgent(null)
                              setAgentId(preset)
                              setShowClearModal(true)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-[#f85149] hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Clear memories</span>
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

        {createAgentModal}

        <ConfirmModal
          open={showClearModal}
          title="Clear agent memories?"
          message={
            <div>
              Are you sure you want to permanently clear all stored vector memories for agent{' '}
              <span className="font-mono text-white font-semibold">{agentId}</span>?
            </div>
          }
          confirmText="Clear memories"
          loading={clearing}
          onConfirm={confirmClear}
          onClose={() => setShowClearModal(false)}
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-72px)] flex overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] relative">
      {/* Left / Main Memory Playground Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Playground Header Bar (Exact Pinecone Style) */}
        <div className="h-[60px] px-6 border-b border-[var(--border)] flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="text-[13px] text-[#a0a0a0] hover:text-white inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Back to Agent memory table"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Agent memory</span>
            </button>

            <span className="text-[#444444]">/</span>

            <h1 className="text-[16.5px] font-bold text-white tracking-tight shrink-0">
              Memory playground
            </h1>

            {/* Agent Switcher Dropdown */}
            <div ref={switcherRef} className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen(v => !v)}
                className="h-[36px] px-3.5 rounded-[2px] bg-[#1c1c1c] border border-[#3a3a3a] hover:border-[#525252] inline-flex items-center gap-2.5 text-[14.5px] font-semibold text-white cursor-pointer"
              >
                <span className="truncate max-w-[200px]">{agentId}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
                  {switcherOpen ? (
                    <polyline points="18 15 12 9 6 15" />
                  ) : (
                    <polyline points="6 9 12 15 18 9" />
                  )}
                </svg>
              </button>

              {switcherOpen && (
                <div className="absolute left-0 top-full mt-1 w-[250px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.65)] py-1.5 z-50">
                  <div className="max-h-[220px] overflow-y-auto">
                    {agentPresets.map(preset => {
                      const isSel = agentId === preset
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setAgentId(preset)
                            setSwitcherOpen(false)
                          }}
                          className={`w-full px-3.5 py-2 text-left text-[14px] flex items-center justify-between hover:bg-[#262626] cursor-pointer ${
                            isSel ? 'font-bold text-white' : 'font-normal text-[#cccccc]'
                          }`}
                        >
                          <span className="truncate pr-2">{preset}</span>
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
                      setCreatingAgent(true)
                    }}
                    className="w-full px-3.5 py-2 text-left text-[14px] font-semibold text-[#4da3fa] hover:bg-[#262626] flex items-center gap-2 cursor-pointer"
                  >
                    <span>+ Set up new agent</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePreloadDemo}
                    disabled={preloading}
                    className="w-full px-3.5 py-2 text-left text-[13.5px] font-medium text-[#cccccc] hover:bg-[#262626] flex items-center gap-2 cursor-pointer"
                  >
                    <span>{preloading ? 'Loading sample...' : 'Load sample memories'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cognitive Tier Filter Pills when memories exist */}
            {totalMemories > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 pl-2">
                {[
                  { id: 'all', label: `All (${totalMemories})` },
                  ...MEMORY_TIERS.map(t => ({ id: t.id, label: t.name })),
                ].map(tab => {
                  const active = tierFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTierFilter(tab.id)}
                      className={`h-[30px] px-2.5 rounded-[2px] text-[13px] font-medium transition cursor-pointer ${
                        active
                          ? 'bg-[#2b2b2b] text-white font-semibold'
                          : 'text-[#999999] hover:text-white hover:bg-[#1c1c1c]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pr-2">
            {recallResults !== null && lastLatency && (
              <span className="text-[13px] font-mono text-emerald-400">
                {lastLatency}ms
              </span>
            )}

            {/* Expand Drawer Button when Right Drawer is Collapsed */}
            {!drawerOpen && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#3a3a3a] hover:bg-[#2a2a2a] flex items-center justify-center text-white cursor-pointer"
                title="Open memory drawer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Center Memory Playground Canvas */}
        <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6 min-h-0">
          {clearedNotice && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[2px] text-[13.5px]">
              Cleared all stored memories for agent &ldquo;{agentId}&rdquo;.
            </div>
          )}

          {totalMemories === 0 && recallResults === null ? (
            filterPanelOpen ? (
              <div className="flex-1" />
            ) : (
              /* Exact Pinecone-Style Centered Brand Mark + Setup Splash */
              <div className="flex-1 flex flex-col items-center justify-center text-center select-none">
                <div className="flex items-center justify-center gap-2.5">
                  <IcebergLogo className="w-[34px] h-[34px]" />
                  <span className="text-[29px] font-medium tracking-[-0.02em] text-white">
                    Iceberg
                  </span>
                </div>
                <p className="mt-3 text-[15px] font-semibold text-white">
                  Your agent memory is set up. Get started by storing observations on the right.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(true)
                      setDrawerTab('store')
                    }}
                    className="pc-btn-primary"
                  >
                    Store a memory
                  </button>
                  <button
                    type="button"
                    onClick={handlePreloadDemo}
                    disabled={preloading}
                    className="pc-btn-secondary"
                  >
                    {preloading ? 'Loading sample...' : 'Load sample memories'}
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Pinecone-Style Memory Records Inspector Table */
            <div className="flex-1 flex flex-col max-w-[960px] w-full mx-auto">
              {/* Subheader Bar when Recall Query or Filters are Active */}
              {(recallResults !== null || appliedFilters.length > 0 || tierFilter !== 'all') && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[13.5px]">
                  <div className="flex flex-wrap items-center gap-2 text-[#cccccc]">
                    {lastRecallQuery ? (
                      <span>
                        Semantic recall matches for <strong className="text-white">&ldquo;{lastRecallQuery}&rdquo;</strong>
                      </span>
                    ) : (
                      <span>
                        Showing <strong className="text-white">{filteredMemories.length}</strong> stored memories
                      </span>
                    )}
                    {appliedFilters.length > 0 && (
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#1c1c1c] border border-[#3a3a3a] text-[12.5px] font-mono text-[#4da3fa]">
                        {appliedFilters.length} filter(s) active
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRecallResults(null)
                      setLastRecallQuery('')
                      setQuery('')
                      setTierFilter('all')
                      setAppliedFilters([])
                    }}
                    className="text-[13.5px] font-semibold text-[#4da3fa] hover:underline cursor-pointer"
                  >
                    Reset view
                  </button>
                </div>
              )}

              <div className="border border-[#2e2e2e] rounded-[2px] bg-[#161616] overflow-hidden flex-1 flex flex-col">
                <div className="grid grid-cols-12 bg-[#1c1c1c] border-b border-[#2e2e2e] px-5 py-3 text-[12.5px] font-semibold text-[#999999] uppercase tracking-wider">
                  <div className="col-span-3 sm:col-span-2">Tier</div>
                  <div className="col-span-7 sm:col-span-8">Memory Observation</div>
                  <div className="col-span-2 text-right">
                    {recallResults !== null ? 'Similarity' : 'Retention'}
                  </div>
                </div>

                {filteredMemories.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <p className="text-[15px] font-semibold text-white">
                      No matching memories found
                    </p>
                    <p className="text-[13.5px] text-[#888888] mt-1">
                      Try another semantic recall query or clear your active metadata filters.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#262626] overflow-y-auto">
                    {filteredMemories.map((m, i) => {
                      const tierObj = MEMORY_TIERS.find(t => t.id === (m.type || 'semantic')) || MEMORY_TIERS[0]
                      const scorePct =
                        typeof m.score === 'number'
                          ? `${Math.min(100, Math.max(0, m.score * 100)).toFixed(1)}%`
                          : null
                      return (
                        <div
                          key={i}
                          className="grid grid-cols-12 items-start px-5 py-3.5 text-[14.5px] hover:bg-[#1c1c1c] transition gap-3"
                        >
                          <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: tierObj.badgeColor }}
                            />
                            <span className="font-mono text-[13px] text-white font-medium">
                              {tierObj.id}
                            </span>
                          </div>

                          <div className="col-span-7 sm:col-span-8 text-white leading-relaxed">
                            {m.content}
                          </div>

                          <div className="col-span-2 text-right font-mono text-[13px]">
                            {recallResults !== null && scorePct ? (
                              <span className={m.score > 0.6 ? 'text-emerald-400 font-semibold' : 'text-[#999999]'}>
                                {scorePct}
                              </span>
                            ) : (
                              <span className="text-[#888888]">{tierObj.ttl}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Area: Either "Filter by memory metadata" Panel (Screenshot 3 style) OR Semantic Recall Bar */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          {filterPanelOpen ? (
            <div className="border border-[#2e2e2e] rounded-[2px] bg-[var(--bg-base)] p-6">
              {/* Top Row: Funnel Icon + "Filter by memory metadata" + "Clear all filters" */}
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
                    Filter by memory metadata
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

              {/* Inner Dark Card (#1c1c1c) */}
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
                          placeholder="Key (e.g. tier)"
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

                        {/* Value Input + Value Type Dropdown */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={row.value}
                            onChange={e => updateFilterRow(row.id, { value: e.target.value })}
                            placeholder="Value (e.g. semantic)"
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

                      {Array.isArray(row.subfilters) &&
                        row.subfilters.map(sub => (
                          <div key={sub.id} className="pl-7 flex flex-wrap items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => removeSubfilter(row.id, sub.id)}
                              className="w-[18px] h-[18px] rounded-full bg-white text-[#1c1c1c] hover:opacity-85 flex items-center justify-center shrink-0 cursor-pointer mr-0.5"
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
                recall()
              }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-[48px] bg-[#1c1c1c] border border-[#2e2e2e] focus-within:border-[#4da3fa] rounded-[2px] px-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenFilterPanel}
                  className="relative text-white hover:opacity-80 transition shrink-0 cursor-pointer"
                  title="Filter by memory metadata"
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
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Recall agent memory semantically (e.g. What are the user preferences?)..."
                  disabled={recalling}
                  className="flex-1 bg-transparent text-[14.5px] text-white placeholder:text-[#888888] outline-none"
                />

                <button
                  type="submit"
                  disabled={!query.trim() || recalling}
                  className="text-[#888888] hover:text-white disabled:opacity-40 transition shrink-0 cursor-pointer"
                  aria-label="Recall memory"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRecallResults(null)
                  setLastRecallQuery('')
                  setQuery('')
                }}
                className="text-[14px] font-semibold text-[#666666] hover:text-white px-2 py-1 transition cursor-pointer select-none"
              >
                Clear
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Collapsible Drawer (Exact Pinecone Style: » | ⚙ | Store | <> | •••) */}
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

          {/* Top Icon Row (Round active background pill bg-[#2b2b2b]) */}
          <div ref={moreMenuRef} className="pt-[14px] pb-3 px-6 flex items-center gap-3 shrink-0 relative">
            {/* Gear Icon (Settings & Agent Info) */}
            <button
              type="button"
              onClick={() => setDrawerTab('settings')}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition cursor-pointer ${
                drawerTab === 'settings'
                  ? 'bg-[#2b2b2b] text-white'
                  : 'text-[#cccccc] hover:text-white hover:bg-[#222222]'
              }`}
              title="Agent memory settings"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Memory Chip Icon (Store Memory — Default) */}
            <button
              type="button"
              onClick={() => setDrawerTab('store')}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition cursor-pointer ${
                drawerTab === 'store'
                  ? 'bg-[#2b2b2b] text-white'
                  : 'text-[#cccccc] hover:text-white hover:bg-[#222222]'
              }`}
              title="Store memory"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
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
              <div className="absolute left-6 top-full mt-1 w-[205px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.65)] py-1.5 z-50">
                <button
                  type="button"
                  onClick={handlePreloadDemo}
                  disabled={preloading}
                  className="w-full px-3.5 py-2 text-left text-[13.5px] font-medium text-white hover:bg-[#262626] cursor-pointer"
                >
                  {preloading ? 'Loading sample...' : 'Load sample memories'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false)
                    setCreatingAgent(true)
                  }}
                  className="w-full px-3.5 py-2 text-left text-[13.5px] font-medium text-white hover:bg-[#262626] cursor-pointer"
                >
                  Set up new agent
                </button>
                <div className="my-1 border-t border-[#2e2e2e]" />
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false)
                    setShowClearModal(true)
                  }}
                  className="w-full px-3.5 py-2 text-left text-[13.5px] font-medium text-red-400 hover:bg-[#262626] cursor-pointer"
                >
                  Clear agent memories
                </button>
              </div>
            )}
          </div>

          {/* ── TAB 1: Gear Icon (Settings & Agent Metadata — Exact Pinecone Style) ── */}
          {drawerTab === 'settings' && (
            <div className="px-6 pt-3 pb-6 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-2.5 text-[14.5px] leading-[1.4]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Status:</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" title="Active" />
                </div>

                <div>
                  <span className="font-bold text-white">Agent ID: </span>
                  <span className="text-[#e5e5e5] font-mono text-[13.5px]">{agentId}</span>
                </div>

                <div>
                  <span className="font-bold text-white">Stored memories: </span>
                  <span className="text-[#e5e5e5]">{totalMemories}</span>
                </div>

                <div>
                  <span className="font-bold text-white">Updated: </span>
                  <span className="text-[#e5e5e5]">{todayStr}</span>
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

              <div>
                <label className="block text-[14.5px] font-bold text-white mb-2">
                  Embedding model
                </label>
                <div className="w-full h-[40px] px-3.5 rounded-[2px] bg-[#222222] border border-[#3a3a3a] flex items-center justify-between text-[14px] text-[#cccccc]">
                  <span>all-MiniLM-L6-v2</span>
                  <span className="font-mono text-[12.5px] text-[#888888]">384d cosine</span>
                </div>
              </div>

              <div ref={tierMenuRef}>
                <label className="flex items-center gap-1.5 text-[14.5px] font-bold text-white mb-2">
                  <span>Default cognitive tier</span>
                  <span
                    className="text-[#cccccc] inline-flex items-center cursor-help"
                    title="Default tier used when storing new agent memories"
                  >
                    <InfoCircleIcon size={14} />
                  </span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTierMenuOpen(v => !v)}
                    className={`w-full h-[40px] px-3.5 rounded-[2px] bg-[#222222] border flex items-center justify-between text-[14.5px] text-white cursor-pointer ${
                      tierMenuOpen ? 'border-[#4da3fa]' : 'border-[#3a3a3a] hover:border-[#4da3fa]'
                    }`}
                  >
                    <span className="truncate">
                      {currentTierMeta.name} ({currentTierMeta.ttl})
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
                      {tierMenuOpen ? (
                        <polyline points="18 15 12 9 6 15" />
                      ) : (
                        <polyline points="6 9 12 15 18 9" />
                      )}
                    </svg>
                  </button>

                  {tierMenuOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#1f1f1f] border border-[#3a3a3a] rounded-[2px] shadow-2xl py-1.5 z-50">
                      {MEMORY_TIERS.map(t => {
                        const active = t.id === memType
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setMemType(t.id)
                              setTierMenuOpen(false)
                            }}
                            className={`w-full px-3.5 py-2 text-left text-[14px] flex items-center justify-between hover:bg-[#2a2a2a] cursor-pointer ${
                              active ? 'font-bold text-white' : 'font-normal text-[#cccccc]'
                            }`}
                          >
                            <span>
                              {t.name} ({t.ttl})
                            </span>
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

          {/* ── TAB 2: Store Memory (Default Tab — Clean Pinecone Drawer Form) ── */}
          {drawerTab === 'store' && (
            <form onSubmit={remember} className="px-6 pt-3 pb-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <h3 className="text-[16.5px] font-bold text-white">
                  Store memory
                </h3>
                <p className="mt-1 text-[14px] text-[#cccccc] leading-[1.45]">
                  Embed and persist an observation into <span className="font-mono text-white">{agentId}</span>.
                </p>
              </div>

              {/* Cognitive Tier Selector (Clean Full-Width Cards — Zero Wrapping or Overlap) */}
              <div>
                <label className="block text-[14.5px] font-bold text-white mb-2">
                  Cognitive tier
                </label>
                <div className="space-y-2">
                  {MEMORY_TIERS.map(t => {
                    const active = memType === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMemType(t.id)}
                        className={`w-full px-3.5 py-2.5 rounded-[2px] border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                          active
                            ? 'bg-[#222222] border-[#4da3fa]'
                            : 'bg-[#1c1c1c] border-[#2e2e2e] hover:border-[#525252]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: t.badgeColor }}
                            />
                            <span className="text-[14px] font-bold text-white whitespace-nowrap">
                              {t.name}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-[#aaaaaa] mt-0.5 pl-4 truncate">
                            {t.desc}
                          </p>
                        </div>

                        <span className="px-2 py-0.5 rounded-[2px] bg-[#161616] border border-[#2e2e2e] text-[11.5px] font-mono text-[#cccccc] whitespace-nowrap shrink-0">
                          {t.ttl}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Memory Observation Textarea */}
              <div>
                <label className="block text-[14.5px] font-bold text-white mb-2">
                  Memory observation
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Outline a user fact, preference, domain rule, or session event to embed in vector memory."
                  className="w-full p-3 rounded-[2px] bg-[#222222] border border-[#3a3a3a] focus:border-[#4da3fa] text-[14px] leading-[1.45] text-white placeholder:text-[#888888] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={storing || !agentId.trim() || !content.trim()}
                className={`w-full h-[40px] rounded-[2px] text-[14.5px] font-semibold transition flex items-center justify-center ${
                  storing || !agentId.trim() || !content.trim()
                    ? 'bg-[#333333] text-[#888888] cursor-not-allowed'
                    : 'bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] cursor-pointer'
                }`}
              >
                {storedNotice
                  ? '✓ Stored in vector memory'
                  : storing
                  ? 'Embedding & storing...'
                  : 'Store memory'}
              </button>
            </form>
          )}

          {/* ── TAB 3: Code Icon (<> — Exact Pinecone Style Language Dropdown + Numbered Code Boxes) ── */}
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

              {/* Section 1: Store memory */}
              <div>
                <h3 className="text-[16.5px] font-bold text-white">
                  Store memory
                </h3>
                <p className="mt-1.5 text-[14.5px] text-white leading-[1.5]">
                  To store a cognitive memory for your agent, use the remember endpoint as in the following example.
                </p>

                <NumberedCodeBox
                  snippet={rememberSnippet}
                  copied={copiedField === 'remember_code'}
                  onCopy={() => copyToClipboard(rememberSnippet.raw, 'remember_code')}
                />
              </div>

              {/* Section 2: Recall memory */}
              <div className="pt-1">
                <h3 className="text-[16.5px] font-bold text-white">
                  Recall memory
                </h3>
                <p className="mt-1.5 text-[14.5px] text-white leading-[1.5]">
                  To semantically recall relevant memories for your agent, use the recall endpoint.
                </p>

                <NumberedCodeBox
                  snippet={recallSnippet}
                  copied={copiedField === 'recall_code'}
                  onCopy={() => copyToClipboard(recallSnippet.raw, 'recall_code')}
                />
              </div>

              {/* Footer Documentation Link */}
              <p className="pt-1 text-[14.5px] text-white leading-[1.5]">
                Read more about the Agent Memory API in our{' '}
                <Link to="/docs" className="text-[#4da3fa] underline hover:opacity-90">
                  documentation
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      )}

      {createAgentModal}

      <ConfirmModal
        open={showClearModal}
        title="Clear agent memories?"
        message={
          <div>
            Are you sure you want to permanently clear all stored vector memories for agent{' '}
            <span className="font-mono text-[var(--text-primary)] font-semibold">{agentId}</span>?
          </div>
        }
        confirmText="Clear memories"
        loading={clearing}
        onConfirm={confirmClear}
        onClose={() => setShowClearModal(false)}
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

import { useState } from 'react'

const TOKEN_REGEX = /(#.*$|\/\/.*$|<!--[\s\S]*?-->)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(from|import|def|return|for|in|if|else|await|async|const|let|var|function|package|func|using|new|use|fn|mut|pub|struct|impl|class|public|static|void|try|catch|curl|docker|pip|npm|cargo|dotnet|go)\b|\b(Client|IcebergClient|Document|NodeWithScore|TextNode|SearchResult|create_collection|createCollection|CreateCollection|CreateCollectionAsync|list_collections|listCollections|delete_collection|deleteCollection|index_text|indexText|IndexText|IndexTextAsync|upload|uploadFile|search|Search|SearchAsync|remember|recall|clear_memory|clearMemory|create_key|post|get|delete|json|print|println|printf|forEach|WriteLine)\b|\b(true|false|True|False|None|null|undefined|\d+(?:\.\d+)?)\b|(-[XHdFevp]\b|\b(?:POST|GET|DELETE|PUT)\b)/gm

function highlightLine(line) {
  if (!line) return <span>&nbsp;</span>
  const trimmed = line.trim()
  if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('<!--')) {
    return <span className="text-[#6e7681] italic">{line}</span>
  }

  const parts = []
  let lastIndex = 0
  let match
  const re = new RegExp(TOKEN_REGEX.source, 'gm')

  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t-${lastIndex}`} className="text-[#e6edf3]">{line.slice(lastIndex, match.index)}</span>)
    }
    const [full, comment, str, kw, fn, num, flag] = match
    if (comment) {
      parts.push(<span key={`m-${match.index}`} className="text-[#6e7681] italic">{full}</span>)
    } else if (str) {
      parts.push(<span key={`m-${match.index}`} className="text-[#7ee787]">{full}</span>)
    } else if (kw) {
      parts.push(<span key={`m-${match.index}`} className="text-[#ff7b72] font-medium">{full}</span>)
    } else if (fn) {
      parts.push(<span key={`m-${match.index}`} className="text-[#79c0ff]">{full}</span>)
    } else if (num) {
      parts.push(<span key={`m-${match.index}`} className="text-[#ffa657]">{full}</span>)
    } else if (flag) {
      parts.push(<span key={`m-${match.index}`} className="text-[#d2a8ff] font-semibold">{full}</span>)
    } else {
      parts.push(<span key={`m-${match.index}`} className="text-[#e6edf3]">{full}</span>)
    }
    lastIndex = re.lastIndex
  }

  if (lastIndex < line.length) {
    parts.push(<span key={`t-end`} className="text-[#e6edf3]">{line.slice(lastIndex)}</span>)
  }

  return parts
}

export function CodeBlock({ code, label = 'python', className = '', showLineNumbers = true }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = (code || '').split('\n')

  return (
    <div className={`rounded-xl border border-[#222630] bg-[#0b0e14] overflow-hidden shadow-lg shadow-black/40 ${className}`}>
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#12161f] border-b border-[#222630]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
          </div>
          <span className="text-[11px] font-mono text-[#8b949e] uppercase tracking-wider truncate pl-1">{label}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
            copied
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/[0.05] hover:bg-blue-500/15 text-[#c9d1d9] hover:text-blue-400 border border-white/[0.09] hover:border-blue-500/30'
          }`}
        >
          {copied ? (
            <>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto font-mono text-xs leading-6">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                {showLineNumbers && lines.length > 1 && (
                  <td
                    className="select-none pr-3.5 text-right text-[11px] text-[#484f58] w-6 align-top font-mono"
                    style={{ userSelect: 'none' }}
                  >
                    {idx + 1}
                  </td>
                )}
                <td className="whitespace-pre text-[#e6edf3]">{highlightLine(line)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

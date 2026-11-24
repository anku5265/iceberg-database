import { useState } from 'react'

const TOKEN_REGEX = /(#.*$|\/\/.*$|<!--[\s\S]*?-->)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(from|import|def|return|for|in|if|else|await|async|const|let|var|function|package|func|using|new|use|fn|mut|pub|struct|impl|class|public|static|void|try|catch|curl|docker|pip|npm|cargo|dotnet|go)\b|\b(Client|IcebergClient|Document|NodeWithScore|TextNode|SearchResult|create_collection|createCollection|CreateCollectionAsync|list_collections|listCollections|delete_collection|deleteCollection|index_text|indexText|IndexTextAsync|upload|uploadFile|search|Search|SearchAsync|remember|recall|clear_memory|clearMemory|create_key|post|get|delete|json|print|println|printf|forEach|WriteLine)\b|\b(true|false|True|False|None|null|undefined|\d+(?:\.\d+)?)\b|(-[XHdFevp]\b|\b(?:POST|GET|DELETE|PUT)\b)/gm

function highlightLine(line) {
  if (!line) return <span>&nbsp;</span>
  const trimmed = line.trim()
  if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('<!--')) {
    return <span className="text-[var(--text-muted)] italic">{line}</span>
  }

  const parts = []
  let lastIndex = 0
  let match
  const re = new RegExp(TOKEN_REGEX.source, 'gm')

  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t-${lastIndex}`} className="text-[var(--text-primary)]">{line.slice(lastIndex, match.index)}</span>)
    }
    const [full, comment, str, kw, fn, num, flag] = match
    if (comment) {
      parts.push(<span key={`m-${match.index}`} className="text-[var(--text-muted)] italic">{full}</span>)
    } else if (str) {
      parts.push(<span key={`m-${match.index}`} className="text-emerald-600 dark:text-emerald-400">{full}</span>)
    } else if (kw) {
      parts.push(<span key={`m-${match.index}`} className="text-purple-600 dark:text-purple-400 font-medium">{full}</span>)
    } else if (fn) {
      parts.push(<span key={`m-${match.index}`} className="text-[var(--accent)]">{full}</span>)
    } else if (num) {
      parts.push(<span key={`m-${match.index}`} className="text-amber-600 dark:text-amber-400">{full}</span>)
    } else if (flag) {
      parts.push(<span key={`m-${match.index}`} className="text-[var(--accent)] font-semibold">{full}</span>)
    } else {
      parts.push(<span key={`m-${match.index}`} className="text-[var(--text-primary)]">{full}</span>)
    }
    lastIndex = re.lastIndex
  }

  if (lastIndex < line.length) {
    parts.push(<span key={`t-end`} className="text-[var(--text-primary)]">{line.slice(lastIndex)}</span>)
  }

  return parts
}

export function CodeBlock({ code, label = '', className = '', showLineNumbers = true }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = (code || '').split('\n')

  return (
    <div className={`relative rounded-[2px] border border-[var(--border)] bg-[var(--code-bg)] overflow-hidden ${className}`}>
      {label && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--border)] bg-[var(--bg-surface2)]">
          <span className="text-[13px] font-mono text-[var(--text-muted)] uppercase tracking-wider truncate">
            {label}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <span className="text-emerald-500 font-semibold">✓ Copied</span>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {!label && (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-[2px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <span className="text-[13px] font-mono text-emerald-500 px-1">✓</span>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      )}

      <div className="p-3.5 overflow-x-auto font-mono text-[13.5px] leading-[1.65]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx}>
                {showLineNumbers && (
                  <td className="select-none pr-4 text-right text-[13.5px] text-[var(--text-dim)] w-6 align-top">
                    {idx + 1}
                  </td>
                )}
                <td className="whitespace-pre pr-8">{highlightLine(line)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CodeBlock
